import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { ARTIST_LEVELS } from "@/lib/artist-levels"
import QRCode from "qrcode"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID manquant" },
        { status: 400 }
      )
    }

    // Récupérer la session Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Paiement non complété" },
        { status: 400 }
      )
    }

    const { concertId, userId, ticketType, artistId } = stripeSession.metadata || {}

    if (!concertId || !userId || !ticketType || !artistId) {
      return NextResponse.json(
        { error: "Métadonnées manquantes" },
        { status: 400 }
      )
    }

    // Vérifier si le ticket existe déjà
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        concertId,
        userId,
        type: ticketType as "ETICKET" | "PHYSICAL",
        qrCode: {
          contains: sessionId.substring(0, 20), // Utiliser une partie du session_id pour identifier
        },
      },
    })

    if (existingTicket) {
      return NextResponse.json({
        success: true,
        ticketId: existingTicket.id,
        message: "Ticket déjà créé",
      })
    }

    // Get concert and artist info
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

    const price =
      ticketType === "ETICKET"
        ? concert.priceEticket
        : concert.pricePhysical

    // Generate unique QR code avec session_id pour éviter les doublons
    const qrCodeData = `VYBZZZ-${concertId}-${userId}-${sessionId.substring(0, 20)}-${Date.now()}`
    await QRCode.toDataURL(qrCodeData)

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

    console.log(`✅ Ticket créé depuis verify-session pour user ${userId}, concert ${concertId}`)

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      concertSlug: concert.slug,
      message: "Ticket créé avec succès",
    })
  } catch (error) {
    console.error("❌ Erreur verify-session:", error)
    return NextResponse.json(
      {
        error: "Une erreur est survenue",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

