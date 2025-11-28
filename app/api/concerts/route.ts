import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const concertSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  pricePhysical: z.number().min(0, "Le prix doit être positif"),
  priceEticket: z.number().min(0, "Le prix doit être positif"),
  date: z.string().datetime(),
  duration: z.number().nullable(),
  youtubeUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get artist profile
    const artist = await prisma.artist.findUnique({
      where: { userId: session.user.id },
    })

    if (!artist) {
      return NextResponse.json(
        { error: "Profil artiste non trouvé" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const data = concertSchema.parse(body)

    // Validate pricing
    if (data.priceEticket >= data.pricePhysical) {
      return NextResponse.json(
        { error: "Le prix e-ticket doit être inférieur au prix physique" },
        { status: 400 }
      )
    }

    // Create slug from title
    const slug = data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now()

    // Create concert
    const concert = await prisma.concert.create({
      data: {
        artistId: artist.id,
        title: data.title,
        slug,
        description: data.description || null,
        pricePhysical: data.pricePhysical,
        priceEticket: data.priceEticket,
        date: new Date(data.date),
        duration: data.duration,
        youtubeUrl: data.youtubeUrl || null,
        coverUrl: data.coverUrl || null,
        status: "PUBLISHED", // Publish immediately for V1
      },
    })

    return NextResponse.json(
      {
        message: "Concert créé avec succès",
        concert: {
          id: concert.id,
          slug: concert.slug,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Concert creation error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
