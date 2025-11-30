import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { ARTIST_LEVELS } from "@/lib/artist-levels"
import { calculatePayoutReleaseDate } from "@/lib/payout-calculator"
import { addCredits } from "@/lib/credits"
import { sendTicketConfirmationEmail, sendConcertEndedEmail } from "@/lib/email"
import Stripe from "stripe"
import QRCode from "qrcode"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session

      if (session.payment_status === "paid") {
        // Vérifier le type de paiement
        if (session.metadata?.type === "tip") {
          await handleTipPayment(session)
        } else if (session.metadata?.extensionType === "STREAMING_EXTENSION") {
          await handleStreamingExtension(session)
        } else if (session.metadata?.type === "CREDITS") {
          await handleCreditsPurchase(session)
        } else {
          await handleSuccessfulPayment(session)
        }
      }
      break

    case "account.updated":
      await handleAccountUpdated(event.data.object as Stripe.Account)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const { concertId, userId, ticketType, artistId } = session.metadata!

  try {
    // Generate unique QR code
    const qrCodeData = `VYBZZZ-${concertId}-${userId}-${Date.now()}`
    const qrCodeImage = await QRCode.toDataURL(qrCodeData)

    // Get concert and artist info
    const concert = await prisma.concert.findUnique({
      where: { id: concertId },
      include: { artist: true },
    })

    if (!concert) {
      throw new Error("Concert not found")
    }

    const price =
      ticketType === "ETICKET"
        ? concert.priceEticket
        : concert.pricePhysical

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        concertId,
        userId,
        type: ticketType as "ETICKET" | "PHYSICAL",
        qrCode: qrCodeData,
        pricePaid: price,
      },
    })

    // Calculate artist revenue share
    const levelInfo = ARTIST_LEVELS[concert.artist.level]
    const artistRevenue = Number(price) * levelInfo.revenueShare

    // Vérifier si c'est le premier payout de l'artiste
    const existingPayouts = await prisma.payout.findFirst({
      where: { artistId },
    })
    const isFirstPayout = !existingPayouts

    // Calculer la date de fin du concert (date + duration)
    const concertEndDate = new Date(concert.date)
    if (concert.duration) {
      concertEndDate.setMinutes(concertEndDate.getMinutes() + concert.duration)
    }

    // Calculer la date de release selon les nouvelles règles
    const { releaseDate, daysUntilRelease } = calculatePayoutReleaseDate(
      concertEndDate,
      concert.artist.level,
      isFirstPayout
    )

    // Créer le payout SEULEMENT si le concert est terminé
    // Sinon, il sera créé quand le concert se terminera
    if (concert.status === "ENDED") {
      await prisma.payout.create({
        data: {
          artistId,
          concertId,
          ticketId: ticket.id,
          amount: artistRevenue,
          status: "PENDING",
          releaseDate,
          isFirstPayout,
          daysUntilRelease,
        },
      })
    }

    // Update artist stats
    await prisma.artist.update({
      where: { id: artistId },
      data: {
        ticketsSoldTotal: { increment: 1 },
        revenueTotal: { increment: artistRevenue },
      },
    })

    console.log(`Ticket created for user ${userId}, concert ${concertId}`)

    // Envoyer l'email de confirmation avec le ticket
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.email) {
      await sendTicketConfirmationEmail(user.email, {
        id: ticket.id,
        concertTitle: concert.title,
        qrCode: qrCodeImage,
        pricePaid: Number(price),
        purchaseDate: ticket.purchaseDate,
      })
    }
  } catch (error) {
    console.error("Error handling payment:", error)
    throw error
  }
}

async function handleCreditsPurchase(session: Stripe.Checkout.Session) {
  const { userId, amount } = session.metadata!

  try {
    // Ajouter les crédits à l'utilisateur
    await addCredits(
      userId,
      parseFloat(amount),
      "PURCHASE",
      `Achat de ${amount}€ de crédits via Stripe`,
      undefined // Pas d'expiration
    )

    console.log(`Credits added for user ${userId}: ${amount}€`)
  } catch (error) {
    console.error("Error handling credits purchase:", error)
    throw error
  }
}

async function handleTipPayment(session: Stripe.Checkout.Session) {
  const { tipId, concertId, artistId } = session.metadata!

  try {
    // Récupérer le tip
    const tip = await prisma.tip.findUnique({
      where: { id: tipId },
      include: {
        concert: {
          include: { artist: true },
        },
      },
    })

    if (!tip) {
      throw new Error("Tip not found")
    }

    // Marquer le tip comme complété
    await prisma.tip.update({
      where: { id: tipId },
      data: {
        status: "COMPLETED",
        stripePaymentIntentId: session.payment_intent as string,
      },
    })

    // Calculer la part de l'artiste selon son niveau
    const levelInfo = ARTIST_LEVELS[tip.concert.artist.level]
    const artistRevenue = Number(tip.amount) * levelInfo.revenueShare

    // Vérifier si c'est le premier payout de l'artiste
    const existingPayouts = await prisma.payout.findFirst({
      where: { artistId },
    })
    const isFirstPayout = !existingPayouts

    // Calculer la date de fin du concert
    const concertEndDate = new Date(tip.concert.date)
    if (tip.concert.duration) {
      concertEndDate.setMinutes(concertEndDate.getMinutes() + tip.concert.duration)
    }

    // Calculer la date de release selon les mêmes règles que les tickets
    const { releaseDate, daysUntilRelease } = calculatePayoutReleaseDate(
      concertEndDate,
      tip.concert.artist.level,
      isFirstPayout
    )

    // Créer le payout SEULEMENT si le concert est terminé
    // Sinon, il sera créé quand le concert se terminera (via /api/concerts/[id]/end)
    if (tip.concert.status === "ENDED") {
      await prisma.payout.create({
        data: {
          artistId,
          concertId,
          tipId: tip.id,
          amount: artistRevenue,
          status: "PENDING",
          releaseDate,
          isFirstPayout,
          daysUntilRelease,
        },
      })
    }

    // Mettre à jour les stats de l'artiste
    await prisma.artist.update({
      where: { id: artistId },
      data: {
        revenueTotal: { increment: artistRevenue },
      },
    })

    console.log(`Tip processed: ${tipId}, amount: ${tip.amount}, artist revenue: ${artistRevenue}`)
  } catch (error) {
    console.error("Error handling tip payment:", error)
    throw error
  }
}

async function handleStreamingExtension(session: Stripe.Checkout.Session) {
  const { concertId, days } = session.metadata!

  try {
    const concert = await prisma.concert.findUnique({
      where: { id: concertId },
    })

    if (!concert) {
      throw new Error("Concert not found")
    }

    // Calculer la date de fin actuelle
    const currentEndDate = concert.streamingExtendedUntil || concert.streamingEndDate || (() => {
      const endDate = new Date(concert.date)
      endDate.setDate(endDate.getDate() + 7)
      return endDate
    })()

    // Calculer la nouvelle date de fin
    const newEndDate = new Date(currentEndDate)
    newEndDate.setDate(newEndDate.getDate() + parseInt(days))

    // Mettre à jour le concert avec la nouvelle date d'extension
    await prisma.concert.update({
      where: { id: concertId },
      data: {
        streamingExtendedUntil: newEndDate,
      },
    })

    console.log(`Streaming extended for concert ${concertId} until ${newEndDate.toISOString()}`)
  } catch (error) {
    console.error("Error handling streaming extension:", error)
    throw error
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    // Trouver l'artiste avec ce stripeAccountId
    const artist = await prisma.artist.findFirst({
      where: { stripeAccountId: account.id },
    })

    if (!artist) {
      console.log(`No artist found for Stripe account ${account.id}`)
      return
    }

    // Vérifier le statut de l'onboarding
    const chargesEnabled = account.charges_enabled
    const payoutsEnabled = account.payouts_enabled
    const detailsSubmitted = account.details_submitted

    console.log(`Stripe account ${account.id} updated:`, {
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
    })

    // Si l'onboarding est complété, on peut logger ou mettre à jour un statut si nécessaire
    // Pour l'instant, on se contente de logger
    if (chargesEnabled && payoutsEnabled && detailsSubmitted) {
      console.log(`Artist ${artist.id} Stripe Connect onboarding completed`)
    }
  } catch (error) {
    console.error("Error handling account.updated webhook:", error)
    throw error
  }
}
