import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const concert = await prisma.concert.findUnique({
      where: { id },
      include: {
        artist: true,
      },
    })

    if (!concert) {
      return NextResponse.json({ error: "Concert not found" }, { status: 404 })
    }

    // Vérifier que le concert appartient à l'artiste
    if (concert.artist.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({
      id: concert.id,
      title: concert.title,
      slug: concert.slug,
      description: concert.description,
      date: concert.date.toISOString(),
      duration: concert.duration,
      status: concert.status,
      muxLiveStreamId: concert.muxLiveStreamId,
      muxPlaybackId: concert.muxPlaybackId,
      muxStreamKey: concert.muxStreamKey,
    })
  } catch (error) {
    console.error("Error fetching concert:", error)
    return NextResponse.json(
      { error: "Failed to fetch concert" },
      { status: 500 }
    )
  }
}

