import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Toggle like
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingLike = await prisma.concertLike.findUnique({
      where: {
        concertId_userId: {
          concertId: id,
          userId: session.user.id,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json({ error: "Already liked" }, { status: 400 })
    }

    await prisma.concertLike.create({
      data: {
        concertId: id,
        userId: session.user.id,
      },
    })

    const likesCount = await prisma.concertLike.count({
      where: { concertId: id },
    })

    return NextResponse.json({ 
      liked: true,
      likesCount 
    })
  } catch (error) {
    console.error("Error liking concert:", error)
    return NextResponse.json(
      { error: "Failed to like concert" },
      { status: 500 }
    )
  }
}

// Unlike
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.concertLike.deleteMany({
      where: {
        concertId: id,
        userId: session.user.id,
      },
    })

    const likesCount = await prisma.concertLike.count({
      where: { concertId: id },
    })

    return NextResponse.json({ 
      liked: false,
      likesCount 
    })
  } catch (error) {
    console.error("Error unliking concert:", error)
    return NextResponse.json(
      { error: "Failed to unlike concert" },
      { status: 500 }
    )
  }
}

// Get likes count and user status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    const likesCount = await prisma.concertLike.count({
      where: { concertId: id },
    })

    let userLiked = false
    if (session) {
      const like = await prisma.concertLike.findUnique({
        where: {
          concertId_userId: {
            concertId: id,
            userId: session.user.id,
          },
        },
      })
      userLiked = !!like
    }

    return NextResponse.json({
      likesCount,
      userLiked,
    })
  } catch (error) {
    console.error("Error fetching likes:", error)
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    )
  }
}

