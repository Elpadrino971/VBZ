import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculatePayoutReleaseDate } from "@/lib/payout-calculator"
import { ARTIST_LEVELS } from "@/lib/artist-levels"
import { sendConcertEndedEmail } from "@/lib/email"

/**
 * API route pour marquer un concert comme terminé
 * Crée les payouts pour tous les tickets vendus qui n'ont pas encore de payout
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: concertId } = await params
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer le concert avec l'artiste et les tickets
    const concert = await prisma.concert.findUnique({
      where: { id: concertId },
      include: { 
        artist: true, 
        tickets: {
          include: {
            payout: true, // Vérifier si un payout existe déjà
          },
        },
      },
    })

    if (!concert) {
      return NextResponse.json(
        { error: "Concert non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est l'artiste propriétaire
    if (concert.artist.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      )
    }

    // Si le concert n'est pas encore terminé, le marquer comme terminé
    if (concert.status !== "ENDED") {
      // Calculer la date de fin du concert
      const concertEndDate = new Date(concert.date)
      if (concert.duration) {
        concertEndDate.setMinutes(concertEndDate.getMinutes() + concert.duration)
      }

      // Vérifier si c'est le premier payout de l'artiste
      const existingPayouts = await prisma.payout.findFirst({
        where: { artistId: concert.artistId },
      })
      const isFirstPayout = !existingPayouts

      // Créer les payouts pour tous les tickets qui n'en ont pas encore
      for (const ticket of concert.tickets) {
        // Si un payout existe déjà pour ce ticket, passer au suivant
        if (ticket.payout) {
          continue
        }

        const ticketRevenue = Number(ticket.pricePaid)
        const levelInfo = ARTIST_LEVELS[concert.artist.level]
        const artistRevenue = ticketRevenue * levelInfo.revenueShare

        // Calculer la date de release
        const { releaseDate, daysUntilRelease } = calculatePayoutReleaseDate(
          concertEndDate,
          concert.artist.level,
          isFirstPayout
        )

        // Créer le payout pour ce ticket
        await prisma.payout.create({
          data: {
            artistId: concert.artistId,
            concertId: concert.id,
            ticketId: ticket.id,
            amount: artistRevenue,
            status: "PENDING",
            releaseDate,
            isFirstPayout,
            daysUntilRelease,
          },
        })
      }

      // Créer les payouts pour tous les tips qui n'en ont pas encore de payout
      const tips = await prisma.tip.findMany({
        where: {
          concertId: concert.id,
          status: "COMPLETED",
        },
        include: {
          payout: true, // Vérifier si un payout existe déjà
        },
      })

      for (const tip of tips) {
        // Si un payout existe déjà pour ce tip, passer au suivant
        if (tip.payout) {
          continue
        }

        const tipAmount = Number(tip.amount)
        const levelInfo = ARTIST_LEVELS[concert.artist.level]
        const artistRevenue = tipAmount * levelInfo.revenueShare

        // Calculer la date de release (même logique que les tickets)
        const { releaseDate, daysUntilRelease } = calculatePayoutReleaseDate(
          concertEndDate,
          concert.artist.level,
          isFirstPayout
        )

        // Créer le payout pour ce tip
        await prisma.payout.create({
          data: {
            artistId: concert.artistId,
            concertId: concert.id,
            tipId: tip.id,
            amount: artistRevenue,
            status: "PENDING",
            releaseDate,
            isFirstPayout,
            daysUntilRelease,
          },
        })
      }

      // Marquer le concert comme terminé
      await prisma.concert.update({
        where: { id: concertId },
        data: { status: "ENDED" },
      })

      // Envoyer un email à tous les utilisateurs qui ont acheté un ticket
      const ticketUsers = await prisma.ticket.findMany({
        where: { concertId: concert.id },
        include: { user: true },
        distinct: ["userId"],
      })

      for (const ticket of ticketUsers) {
        if (ticket.user.email) {
          try {
            await sendConcertEndedEmail(ticket.user.email, {
              title: concert.title,
              artistName: concert.artist.artistName,
            })
          } catch (emailError) {
            console.error(`Email error for user ${ticket.user.id}:`, emailError)
            // Ne pas bloquer si l'email échoue
          }
        }
      }
    }

    // Récupérer tous les payouts pour calculer les soldes
    const pendingPayouts = await prisma.payout.findMany({
      where: {
        artistId: concert.artistId,
        status: "PENDING",
      },
      include: {
        concert: true,
      },
    })

    // Calculer les soldes
    const now = new Date()
    const availablePayouts = pendingPayouts.filter(
      (p) => p.releaseDate <= now
    )
    const waitingPayouts = pendingPayouts.filter((p) => p.releaseDate > now)

    const availableAmount = availablePayouts.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    )
    const waitingAmount = waitingPayouts.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    )

    return NextResponse.json({
      success: true,
      availableAmount,
      waitingAmount,
      message: "Concert terminé, payouts créés",
    })
  } catch (error: any) {
    console.error("Erreur:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue", details: error.message },
      { status: 500 }
    )
  }
}
