import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { concertId, days } = await req.json()

    if (!concertId || !days) {
      return NextResponse.json(
        { error: "Concert ID et nombre de jours requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a un ticket pour ce concert
    const ticket = await prisma.ticket.findFirst({
      where: {
        concertId,
        userId: session.user.id,
        type: "ETICKET",
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Vous devez avoir un ticket pour ce concert" },
        { status: 403 }
      )
    }

    // Récupérer le concert
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

    if (concert.status !== "ENDED") {
      return NextResponse.json(
        { error: "Le concert doit être terminé pour prolonger le streaming" },
        { status: 400 }
      )
    }

    // Calculer la date de fin actuelle (streamingEndDate ou date + 7 jours par défaut)
    const currentEndDate = concert.streamingEndDate || (() => {
      const endDate = new Date(concert.date)
      endDate.setDate(endDate.getDate() + 7)
      return endDate
    })()

    // Vérifier si le streaming est encore disponible
    const now = new Date()
    if (now > currentEndDate && !concert.streamingExtendedUntil) {
      // Le streaming a expiré, proposer l'extension
    } else if (concert.streamingExtendedUntil && now > concert.streamingExtendedUntil) {
      // L'extension précédente a expiré, proposer une nouvelle extension
    }

    // Prix par jour (par défaut 0.99€/jour si non défini)
    const pricePerDay = Number(concert.extensionPricePerDay || 0.99)
    const totalPrice = pricePerDay * days

    // Calculer la nouvelle date de fin
    const newEndDate = new Date(currentEndDate)
    newEndDate.setDate(newEndDate.getDate() + days)

    // Créer la session Stripe Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: [...STRIPE_CONFIG.paymentMethodTypes],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: `Extension streaming: ${concert.title}`,
              description: `Prolongation du streaming de ${days} jours (jusqu'au ${newEndDate.toLocaleDateString('fr-FR')})`,
              images: concert.coverUrl ? [concert.coverUrl] : [],
            },
            unit_amount: Math.round(totalPrice * 100), // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/watch/${concert.slug}?extension=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/watch/${concert.slug}`,
      metadata: {
        concertId: concert.id,
        userId: session.user.id,
        extensionType: "STREAMING_EXTENSION",
        days: days.toString(),
        artistId: concert.artistId,
      },
    })

    // Retourner l'URL pour les requêtes fetch
    const acceptHeader = req.headers.get("accept") || ""
    
    if (acceptHeader.includes("application/json")) {
      return NextResponse.json({ url: checkoutSession.url! })
    }
    
    return NextResponse.redirect(checkoutSession.url!)
  } catch (error: any) {
    console.error("❌ Extension streaming error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue", details: error.message },
      { status: 500 }
    )
  }
}

