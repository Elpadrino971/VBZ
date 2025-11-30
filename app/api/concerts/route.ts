import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLiveStream } from "@/lib/mux"
import { checkRateLimit, concertCreationRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const concertSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  pricePhysical: z.number().min(0, "Le prix doit être positif"),
  priceEticket: z.number().min(0, "Le prix doit être positif"),
  date: z.string().datetime(),
  duration: z.number().nullable(),
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

    // Vérifier que Stripe Connect est connecté (obligatoire pour créer un concert)
    if (!artist.stripeAccountId) {
      return NextResponse.json(
        { error: "Vous devez connecter votre compte bancaire Stripe avant de créer un concert. Allez dans votre dashboard → Paiements." },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(concertCreationRateLimit, `concert:${session.user.id}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        { status: 429 }
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
        coverUrl: data.coverUrl || null,
        status: "PUBLISHED", // Publish immediately for V1
      },
    })

    // Créer automatiquement le stream Mux pour ce concert
    try {
      const muxStream = await createLiveStream(concert.title)
      const playbackId = muxStream.playback_ids[0]?.id

      if (playbackId) {
        await prisma.concert.update({
          where: { id: concert.id },
          data: {
            muxLiveStreamId: muxStream.id,
            muxStreamKey: muxStream.stream_key,
            muxPlaybackId: playbackId,
          },
        })
      }
    } catch (error) {
      console.error("Erreur lors de la création du stream Mux:", error)
      // On continue quand même, le stream pourra être créé plus tard depuis le dashboard
    }

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
