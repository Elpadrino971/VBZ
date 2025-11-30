import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getLiveStream } from "@/lib/mux"

/**
 * Vérifie les concerts PUBLISHED avec un stream Mux et les passe en LIVE si le stream est actif
 * Cette route peut être appelée périodiquement (cron job) ou via webhook Mux
 */
export async function POST(req: Request) {
  try {
    // Vérifier que la requête vient d'un cron job ou d'un webhook sécurisé
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || "secret"}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Récupérer tous les concerts PUBLISHED avec un muxLiveStreamId
    const concerts = await prisma.concert.findMany({
      where: {
        status: "PUBLISHED",
        muxLiveStreamId: {
          not: null,
        },
      },
      select: {
        id: true,
        muxLiveStreamId: true,
        title: true,
      },
    })

    let updatedCount = 0
    const errors: string[] = []

    for (const concert of concerts) {
      try {
        if (!concert.muxLiveStreamId) continue

        // Vérifier le statut du stream sur Mux
        const muxStream = await getLiveStream(concert.muxLiveStreamId)

        // Si le stream est actif (status === "active" signifie qu'il reçoit des données)
        // Note: Mux retourne "active" quand le stream reçoit des données RTMP
        if (muxStream.status === "active") {
          await prisma.concert.update({
            where: { id: concert.id },
            data: { status: "LIVE" },
          })
          updatedCount++
          console.log(`✅ Concert "${concert.title}" passé en LIVE`)
        }
      } catch (error: any) {
        errors.push(`Erreur pour concert ${concert.id}: ${error.message}`)
        console.error(`Erreur vérification stream pour concert ${concert.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      checked: concerts.length,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error("Erreur lors de la vérification des concerts:", error)
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint pour vérification manuelle (sans auth pour faciliter les tests)
 */
export async function GET() {
  try {
    const concerts = await prisma.concert.findMany({
      where: {
        status: "PUBLISHED",
        muxLiveStreamId: {
          not: null,
        },
      },
      select: {
        id: true,
        muxLiveStreamId: true,
        title: true,
      },
      take: 10, // Limiter pour les tests
    })

    const results = []

    for (const concert of concerts) {
      try {
        if (!concert.muxLiveStreamId) continue

        const muxStream = await getLiveStream(concert.muxLiveStreamId)
        const isActive = muxStream.status === "active"

        results.push({
          concertId: concert.id,
          title: concert.title,
          muxStreamId: concert.muxLiveStreamId,
          muxStatus: muxStream.status,
          shouldBeLive: isActive,
        })

        if (isActive) {
          await prisma.concert.update({
            where: { id: concert.id },
            data: { status: "LIVE" },
          })
        }
      } catch (error: any) {
        results.push({
          concertId: concert.id,
          title: concert.title,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      checked: concerts.length,
      results,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

