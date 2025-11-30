import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAssetByPlaybackId } from "@/lib/mux"

/**
 * Associe un asset Mux (vidéo uploadée) à un concert
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const concertId = params.id
    const { playbackId } = await req.json()

    if (!playbackId) {
      return NextResponse.json(
        { error: "playbackId manquant" },
        { status: 400 }
      )
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

    // Vérifier que l'asset existe sur Mux
    const asset = await getAssetByPlaybackId(playbackId)
    if (!asset) {
      return NextResponse.json(
        { error: "Asset Mux non trouvé avec ce playback ID" },
        { status: 404 }
      )
    }

    // Mettre à jour le concert avec le playback ID de l'asset
    await prisma.concert.update({
      where: { id: concertId },
      data: {
        muxPlaybackId: playbackId,
        // Si c'est un asset (pas un live stream), on ne met pas muxLiveStreamId
        // muxLiveStreamId reste null pour les assets
      },
    })

    return NextResponse.json({
      success: true,
      message: "Asset Mux associé au concert",
      playbackId,
    })
  } catch (error: any) {
    console.error("Error associating Mux asset:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'association de l'asset" },
      { status: 500 }
    )
  }
}

