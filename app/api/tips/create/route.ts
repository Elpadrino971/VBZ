import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { checkRateLimit, tipsRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const tipSchema = z.object({
  concertId: z.string(),
  artistId: z.string(),
  amount: z.number().min(2).max(100), // Entre 2€ et 100€
})

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(tipsRateLimit, `tips:${session.user.id}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { concertId, artistId, amount } = tipSchema.parse(body)

    // Vérifier que le montant est dans les paliers autorisés
    const allowedAmounts = [2, 5, 10, 20]
    if (!allowedAmounts.includes(amount)) {
      return NextResponse.json(
        { error: "Montant invalide. Utilisez 2€, 5€, 10€ ou 20€" },
        { status: 400 }
      )
    }

    // Vérifier que le concert existe et appartient à l'artiste
    const concert = await prisma.concert.findUnique({
      where: { id: concertId },
      include: { artist: true },
    })

    if (!concert) {
      return NextResponse.json(
        { error: "Concert non trouvé" },
        { status: 404 }
      )
    }

    if (concert.artistId !== artistId) {
      return NextResponse.json(
        { error: "L'artiste ne correspond pas au concert" },
        { status: 400 }
      )
    }

    // Vérifier que le concert est en cours ou terminé (pas avant)
    const now = new Date()
    if (concert.date > now && concert.status !== "LIVE") {
      return NextResponse.json(
        { error: "Vous ne pouvez pas envoyer de pourboire avant le début du concert" },
        { status: 400 }
      )
    }

    // Créer le tip en base de données (statut PENDING)
    const tip = await prisma.tip.create({
      data: {
        concertId,
        artistId,
        userId: session.user.id,
        amount,
        status: "PENDING",
      },
    })

    // Créer une session Stripe Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Pourboire pour ${concert.artist.artistName}`,
              description: `Concert: ${concert.title}`,
            },
            unit_amount: amount * 100, // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/watch/${concert.slug}?tip=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/watch/${concert.slug}?tip=cancelled`,
      metadata: {
        tipId: tip.id,
        concertId,
        artistId,
        userId: session.user.id,
        type: "tip", // Pour identifier dans le webhook
      },
      customer_email: session.user.email || undefined,
    })

    return NextResponse.json({
      success: true,
      tipId: tip.id,
      checkoutUrl: checkoutSession.url,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating tip:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du pourboire" },
      { status: 500 }
    )
  }
}

