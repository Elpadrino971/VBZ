import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1).max(500),
})

// Get comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await prisma.comment.findMany({
      where: { concertId: id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100, // Limit to last 100 comments
    })

    return NextResponse.json({
      comments: comments.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        user: {
          name: c.user.name,
          email: c.user.email,
        },
      })),
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// Create comment
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

    const body = await req.json()
    const { content } = commentSchema.parse(body)

    // Anti-spam : Vérifier le dernier message de l'utilisateur pour ce concert
    const lastComment = await prisma.comment.findFirst({
      where: {
        concertId: id,
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (lastComment) {
      const timeSinceLastMessage = Date.now() - lastComment.createdAt.getTime()
      if (timeSinceLastMessage < 5000) {
        // Moins de 5 secondes depuis le dernier message
        return NextResponse.json(
          { error: "RATE_LIMIT", message: "Veuillez attendre 5 secondes entre chaque message" },
          { status: 429 }
        )
      }
    }

    const comment = await prisma.comment.create({
      data: {
        concertId: id,
        userId: session.user.id,
        content,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: {
          name: comment.user.name,
          email: comment.user.email,
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid comment data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}

