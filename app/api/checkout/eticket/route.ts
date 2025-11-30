import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { checkRateLimit, checkoutRateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(checkoutRateLimit, `checkout:${session.user.id}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        { status: 429 }
      )
    }

    const formData = await req.formData()
    const concertId = formData.get("concertId") as string

    if (!concertId) {
      return NextResponse.json(
        { error: "ID du concert manquant" },
        { status: 400 }
      )
    }

    // Get concert details
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

    if (concert.status === "ENDED") {
      return NextResponse.json(
        { error: "Ce concert est terminé" },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: `E-Ticket: ${concert.title}`,
              description: `Concert de ${concert.artist.artistName} - Streaming Live`,
              images: concert.coverUrl ? [concert.coverUrl] : [],
            },
            unit_amount: Math.round(Number(concert.priceEticket) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/concerts/${concert.slug}`,
      metadata: {
        concertId: concert.id,
        userId: session.user.id,
        ticketType: "ETICKET",
        artistId: concert.artistId,
      },
    })

    // Retourner l'URL pour les requêtes fetch (client-side)
    // ou rediriger pour les formulaires HTML (server-side)
    const acceptHeader = req.headers.get("accept") || ""
    const contentType = req.headers.get("content-type") || ""
    
    console.log("📤 Accept header:", acceptHeader)
    console.log("📤 Content-Type header:", contentType)
    console.log("📤 Stripe URL:", checkoutSession.url)
    
    // Si c'est une requête fetch avec Accept: application/json, retourner JSON
    if (acceptHeader.includes("application/json")) {
      console.log("✅ Retour JSON avec URL Stripe")
      return NextResponse.json({ url: checkoutSession.url! })
    }
    
    // Sinon, rediriger (pour les formulaires HTML)
    console.log("✅ Redirection directe vers Stripe")
    return NextResponse.redirect(checkoutSession.url!)
  } catch (error) {
    console.error("❌ Checkout error:", error)
    console.error("❌ Error details:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Une erreur est survenue",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
