import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { addCredits } from "@/lib/credits"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addCreditsSchema = z.object({
  amount: z.number().min(5).max(500), // Minimum 5€, maximum 500€
})

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()
    const { amount } = addCreditsSchema.parse(body)

    // Créer une session Stripe Checkout pour ajouter des crédits
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Ajout de ${amount}€ de crédits VYbzzZ`,
              description: "Crédits utilisables sur la plateforme pour acheter des tickets",
            },
            unit_amount: amount * 100, // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/account/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/account/credits?canceled=true`,
      metadata: {
        type: "CREDITS",
        userId: session.user.id,
        amount: amount.toString(),
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Add credits error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Erreur lors de l'ajout de crédits" }, { status: 500 })
  }
}

