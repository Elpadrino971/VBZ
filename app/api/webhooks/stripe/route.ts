import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { ARTIST_LEVELS } from "@/lib/artist-levels"
import Stripe from "stripe"
import QRCode from "qrcode"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

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
        await handleSuccessfulPayment(session)
      }
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

    // Create payout record (J+21)
    const releaseDate = new Date()
    releaseDate.setDate(releaseDate.getDate() + 21)

    await prisma.payout.create({
      data: {
        artistId,
        amount: artistRevenue,
        status: "PENDING",
        releaseDate,
      },
    })

    // Update artist stats
    await prisma.artist.update({
      where: { id: artistId },
      data: {
        ticketsSoldTotal: { increment: 1 },
        revenueTotal: { increment: artistRevenue },
      },
    })

    console.log(`Ticket created for user ${userId}, concert ${concertId}`)

    // TODO: Send email with ticket and QR code
  } catch (error) {
    console.error("Error handling payment:", error)
    throw error
  }
}
