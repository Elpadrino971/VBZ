import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier si l'artiste existe
    const artist = await prisma.artist.findUnique({
      where: { userId: session.user.id },
    })

    if (!artist) {
      return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 })
    }

    // Si déjà connecté, retourner l'URL du dashboard Stripe
    if (artist.stripeAccountId) {
      const accountLink = await stripe.accountLinks.create({
        account: artist.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/payouts?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/payouts?success=true`,
        type: "account_onboarding",
      })

      return NextResponse.json({ url: accountLink.url })
    }

    // Créer un compte Stripe Connect
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: session.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        artistId: artist.id,
        userId: session.user.id,
      },
    })

    // Sauvegarder l'ID du compte Stripe
    await prisma.artist.update({
      where: { id: artist.id },
      data: { stripeAccountId: account.id },
    })

    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/payouts?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/dashboard/payouts?success=true`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error("Stripe Connect onboarding error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du compte Stripe Connect" },
      { status: 500 }
    )
  }
}

