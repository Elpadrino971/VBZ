import { PrismaClient } from "@prisma/client"
import Stripe from "stripe"

const prisma = new PrismaClient()

// Initialiser Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
})

async function createTicketFromSession() {
  console.log("🔍 Recherche des sessions Stripe récentes...\n")
  
  // Récupérer les sessions récentes (dernières 24h)
  const sessions = await stripe.checkout.sessions.list({
    limit: 10,
    created: {
      gte: Math.floor(Date.now() / 1000) - 24 * 60 * 60, // 24h
    },
  })

  console.log(`📋 ${sessions.data.length} session(s) trouvée(s)\n`)

  for (const session of sessions.data) {
    if (session.payment_status !== "paid") {
      console.log(`⏭️  Session ${session.id} - Paiement non complété`)
      continue
    }

    const { concertId, userId, ticketType, artistId } = session.metadata || {}

    if (!concertId || !userId || !ticketType) {
      console.log(`⚠️  Session ${session.id} - Métadonnées manquantes`)
      continue
    }

    // Vérifier si le ticket existe déjà
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        concertId,
        userId,
        type: ticketType as "ETICKET" | "PHYSICAL",
      },
    })

    if (existingTicket) {
      console.log(`✅ Ticket déjà créé pour session ${session.id}`)
      console.log(`   Concert: ${concertId}`)
      console.log(`   User: ${userId}`)
      continue
    }

    console.log(`\n🎫 Création du ticket pour session ${session.id}...`)

    try {
      // Get concert and artist info
      const concert = await prisma.concert.findUnique({
        where: { id: concertId },
        include: { artist: true },
      })

      if (!concert) {
        console.log(`❌ Concert ${concertId} non trouvé`)
        continue
      }

      const price =
        ticketType === "ETICKET"
          ? concert.priceEticket
          : concert.pricePhysical

      // Generate unique QR code
      const qrCodeData = `VYBZZZ-${concertId}-${userId}-${session.id.substring(0, 20)}-${Date.now()}`

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

      console.log(`✅ Ticket créé: ${ticket.id}`)
      console.log(`   Concert: ${concert.title}`)
      console.log(`   User: ${userId}`)
      console.log(`   Type: ${ticketType}`)
      console.log(`   Prix: ${Number(price).toFixed(2)} €`)

      // Si artistId est présent, créer le payout
      if (artistId) {
        const { ARTIST_LEVELS } = await import("@/lib/artist-levels")
        const levelInfo = ARTIST_LEVELS[concert.artist.level]
        const artistRevenue = Number(price) * levelInfo.revenueShare

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

        await prisma.artist.update({
          where: { id: artistId },
          data: {
            ticketsSoldTotal: { increment: 1 },
            revenueTotal: { increment: artistRevenue },
          },
        })

        console.log(`✅ Payout créé pour l'artiste`)
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la création du ticket:`, error)
    }
  }

  await prisma.$disconnect()
  console.log("\n🎉 Traitement terminé !")
}

createTicketFromSession()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })

