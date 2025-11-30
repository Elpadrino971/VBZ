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

    // Récupérer l'artiste avec son compte Stripe
    const artist = await prisma.artist.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        stripeAccountId: true,
      },
    })

    if (!artist) {
      return NextResponse.json({ error: "Profil artiste non trouvé" }, { status: 404 })
    }

    if (!artist.stripeAccountId) {
      return NextResponse.json(
        { error: "Vous devez connecter votre compte Stripe Connect avant de retirer des fonds." },
        { status: 400 }
      )
    }

    // Vérifier le statut du compte Stripe Connect
    const stripeAccount = await stripe.accounts.retrieve(artist.stripeAccountId)

    if (!stripeAccount.charges_enabled || !stripeAccount.payouts_enabled || !stripeAccount.details_submitted) {
      return NextResponse.json(
        { error: "Votre compte Stripe Connect n'est pas encore complètement configuré. Veuillez terminer l'onboarding." },
        { status: 400 }
      )
    }

    // Récupérer les payouts disponibles
    const availablePayouts = await prisma.payout.findMany({
      where: {
        artistId: artist.id,
        status: "PENDING",
        releaseDate: {
          lte: new Date(),
        },
      },
    })

    if (availablePayouts.length === 0) {
      return NextResponse.json(
        { error: "Aucun paiement disponible pour le moment." },
        { status: 400 }
      )
    }

    // Calculer le montant total à transférer
    const totalAmount = availablePayouts.reduce((sum, payout) => {
      return sum + Number(payout.amount)
    }, 0)

    // Convertir en centimes pour Stripe
    const amountInCents = Math.round(totalAmount * 100)

    if (amountInCents < 100) {
      return NextResponse.json(
        { error: "Le montant minimum de retrait est de 1€." },
        { status: 400 }
      )
    }

    // Créer le transfer vers le compte Stripe Connect
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "eur",
      destination: artist.stripeAccountId,
      metadata: {
        artistId: artist.id,
        payoutIds: availablePayouts.map((p) => p.id).join(","),
      },
    })

    // Marquer les payouts comme transférés
    await prisma.payout.updateMany({
      where: {
        id: {
          in: availablePayouts.map((p) => p.id),
        },
      },
      data: {
        status: "COMPLETED",
        stripeTransferId: transfer.id,
        completedAt: new Date(),
      },
    })

    console.log(`Transfer created for artist ${artist.id}: ${transfer.id}, amount: ${totalAmount}€`)

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: totalAmount,
      message: `Transfert de ${totalAmount.toFixed(2)}€ effectué avec succès.`,
    })
  } catch (error: any) {
    console.error("Stripe Connect transfer error:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors du transfert vers votre compte bancaire" },
      { status: 500 }
    )
  }
}

