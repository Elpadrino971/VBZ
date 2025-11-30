import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getLiveStream } from "@/lib/mux"

/**
 * Permet à un artiste de passer manuellement son concert en LIVE
 * Vérifie aussi automatiquement si le stream Mux est actif
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: concertId } = await params
    const session = await auth()
    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Vérifier que le concert appartient à l'artiste
    const concert = await prisma.concert.findUnique({
      where: { id: concertId },
      include: { artist: true },
    })

    if (!concert || concert.artist.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Concert non trouvé" },
        { status: 404 }
      )
    }

    // Si le concert a un stream Mux, vérifier son statut
    if (concert.muxLiveStreamId) {
      try {
        const muxStream = await getLiveStream(concert.muxLiveStreamId)
        
        if (muxStream.status !== "active") {
          return NextResponse.json(
            {
              error: "Le stream Mux n'est pas actif",
              muxStatus: muxStream.status,
              message: "Démarrez votre stream sur OBS avant de passer en LIVE",
            },
            { status: 400 }
          )
        }
      } catch (error: any) {
        // Si erreur de récupération, on continue quand même (stream peut être en cours de création)
        console.warn("Impossible de vérifier le statut Mux:", error)
      }
    }

    // Mettre à jour le statut en LIVE
    await prisma.concert.update({
      where: { id: concertId },
      data: { status: "LIVE" },
    })

    return NextResponse.json({
      success: true,
      message: "Concert passé en LIVE",
      concert: {
        id: concert.id,
        title: concert.title,
        status: "LIVE",
      },
    })
  } catch (error: any) {
    console.error("Erreur lors du passage en LIVE:", error)
    return NextResponse.json(
      { error: "Erreur lors du passage en LIVE" },
      { status: 500 }
    )
  }
}

