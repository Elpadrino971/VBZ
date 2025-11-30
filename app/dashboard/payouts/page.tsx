import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { PayoutDashboard } from "@/components/payout-dashboard"
import { StripeConnectButton } from "@/components/stripe-connect-button"

async function getArtistPayouts(userId: string) {
  try {
    // Récupérer l'artiste d'abord
    const artist = await prisma.artist.findUnique({
      where: { userId },
      select: {
        id: true,
        artistName: true,
        level: true,
        revenueTotal: true,
        stripeAccountId: true,
      },
    })

    if (!artist) {
      return null
    }

    // Récupérer les payouts séparément avec leurs relations
    const payouts = await prisma.payout.findMany({
      where: { artistId: artist.id },
      include: {
        concert: true,
        ticket: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

  // Calculer les soldes
  const now = new Date()
  const pendingPayouts = payouts.filter((p) => p.status === "PENDING")
  
  const availablePayouts = pendingPayouts.filter(
    (p) => p.releaseDate <= now
  )
  const waitingPayouts = pendingPayouts.filter((p) => p.releaseDate > now)

  // Fonction helper pour convertir Decimal en Number de manière sécurisée
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return parseFloat(value) || 0
    if (value && typeof value.toNumber === 'function') return value.toNumber()
    return Number(value) || 0
  }

  const availableAmount = availablePayouts.reduce(
    (sum, p) => sum + toNumber(p.amount),
    0
  )
  const waitingAmount = waitingPayouts.reduce(
    (sum, p) => sum + toNumber(p.amount),
    0
  )

  // Calculer le total cumulé annuel
  const currentYear = new Date().getFullYear()
  const yearPayouts = payouts.filter(
    (p) => p.createdAt.getFullYear() === currentYear
  )
  const totalYearAmount = yearPayouts.reduce(
    (sum, p) => sum + toNumber(p.amount),
    0
  )

  // Mapper les payouts pour ne garder que les données nécessaires
  const mappedAvailablePayouts = availablePayouts.map((p) => ({
    id: p.id,
    amount: toNumber(p.amount),
    releaseDate: p.releaseDate,
    isFirstPayout: p.isFirstPayout,
    daysUntilRelease: p.daysUntilRelease,
    concert: {
      title: p.concert?.title || "Concert supprimé",
      date: p.concert?.date || new Date(),
    },
  }))

  const mappedWaitingPayouts = waitingPayouts.map((p) => ({
    id: p.id,
    amount: toNumber(p.amount),
    releaseDate: p.releaseDate,
    isFirstPayout: p.isFirstPayout,
    daysUntilRelease: p.daysUntilRelease,
    concert: {
      title: p.concert?.title || "Concert supprimé",
      date: p.concert?.date || new Date(),
    },
  }))

  return {
    artist: {
      id: artist.id,
      artistName: artist.artistName,
      level: artist.level,
      revenueTotal: toNumber(artist.revenueTotal),
      stripeAccountId: artist.stripeAccountId,
    },
    availableAmount,
    waitingAmount,
    totalYearAmount,
    availablePayouts: mappedAvailablePayouts,
    waitingPayouts: mappedWaitingPayouts,
  }
  } catch (error) {
    console.error("Error fetching artist payouts:", error)
    throw error
  }
}

export default async function PayoutsPage() {
  try {
    const session = await auth()

    if (!session) {
      redirect("/auth/signin")
    }

    const payoutData = await getArtistPayouts(session.user.id)

    if (!payoutData) {
      redirect("/dashboard")
    }

    // Récupérer stripeAccountId pour StripeConnectButton
    const artist = await prisma.artist.findUnique({
      where: { userId: session.user.id },
      select: { stripeAccountId: true },
    })

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-[1320px]">
          <div className="mb-6">
            <StripeConnectButton stripeAccountId={artist?.stripeAccountId || null} />
          </div>
          <PayoutDashboard {...payoutData} />
        </div>
      </div>
    )
  } catch (error: any) {
    console.error("❌ Error in PayoutsPage:", error)
    console.error("❌ Error stack:", error?.stack)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-[1320px]">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Erreur</h1>
            <p className="text-red-700 mb-4">
              Une erreur est survenue lors du chargement de la page des paiements.
            </p>
            <details className="text-sm text-red-600">
              <summary className="cursor-pointer font-semibold">Détails de l&apos;erreur</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-xs">
                {error?.message || String(error)}
                {error?.stack && `\n\nStack:\n${error.stack}`}
              </pre>
            </details>
          </div>
        </div>
      </div>
    )
  }
}

