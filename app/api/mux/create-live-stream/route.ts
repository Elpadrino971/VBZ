import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLiveStream } from "@/lib/mux"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { concertId } = await req.json()

    if (!concertId) {
      return NextResponse.json({ error: "concertId manquant" }, { status: 400 })
    }

    // Vérifier que le concert appartient à l'artiste
    const concert = await prisma.concert.findUnique({
      where: { id: concertId },
      include: { artist: true },
    })

    if (!concert || concert.artist.userId !== session.user.id) {
      return NextResponse.json({ error: "Concert not found" }, { status: 404 })
    }

    // Vérifier si un stream existe déjà
    if (concert.muxLiveStreamId) {
      return NextResponse.json(
        { error: "Un stream existe déjà pour ce concert" },
        { status: 400 }
      )
    }

    const muxStream = await createLiveStream(concert.title)
    const playbackId = muxStream.playback_ids[0]?.id

    if (!playbackId) {
      return NextResponse.json(
        { error: "Failed to get playback ID" },
        { status: 500 }
      )
    }

    await prisma.concert.update({
      where: { id: concertId },
      data: {
        muxLiveStreamId: muxStream.id,
        muxStreamKey: muxStream.stream_key,
        muxPlaybackId: playbackId,
      },
    })

    return NextResponse.json(
      { 
        muxStreamId: muxStream.id, 
        muxStreamKey: muxStream.stream_key, 
        muxPlaybackId: playbackId 
      },
      { status: 200 }
    )
  } catch (err) {
    console.error("Erreur Mux:", err)
    return NextResponse.json(
      { error: "Erreur création live Mux" },
      { status: 500 }
    )
  }
}

