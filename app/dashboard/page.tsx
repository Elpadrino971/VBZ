import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Music,
  TrendingUp,
  Euro,
  Ticket,
  Users,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react"
import {
  ARTIST_LEVELS,
  getProgressToNextLevel,
  isTrialActive,
  getTrialDaysRemaining,
} from "@/lib/artist-levels"
import Link from "next/link"

async function getArtistData(userId: string) {
  const artist = await prisma.artist.findUnique({
    where: { userId },
    include: {
      concerts: {
        orderBy: { date: "desc" },
        take: 5,
      },
      payouts: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  if (!artist) {
    throw new Error("Artist profile not found")
  }

  // Calculate pending revenue (J+21)
  const releaseDate = new Date()
  releaseDate.setDate(releaseDate.getDate() + 21)

  const pendingPayouts = await prisma.payout.aggregate({
    where: {
      artistId: artist.id,
      status: "PENDING",
    },
    _sum: {
      amount: true,
    },
  })

  const availablePayouts = await prisma.payout.aggregate({
    where: {
      artistId: artist.id,
      status: "PENDING",
      releaseDate: {
        lte: new Date(),
      },
    },
    _sum: {
      amount: true,
    },
  })

  return {
    artist,
    pendingRevenue: pendingPayouts._sum.amount || 0,
    availableRevenue: availablePayouts._sum.amount || 0,
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session || session.user.role !== "ARTIST") {
    redirect("/auth/signin")
  }

  const { artist, pendingRevenue, availableRevenue } = await getArtistData(
    session.user.id
  )

  const levelInfo = ARTIST_LEVELS[artist.level]
  const trialActive = isTrialActive(artist.trialEndDate)
  const trialDaysLeft = getTrialDaysRemaining(artist.trialEndDate)

  const stats = {
    ticketsSold: artist.ticketsSoldTotal,
    revenue: Number(artist.revenueTotal),
    communityLeads: artist.communityLeads,
  }

  const progress = getProgressToNextLevel(artist.level, stats)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Artiste</h1>
          <p className="text-muted-foreground">
            Bienvenue, {artist.artistName}
          </p>
        </div>

        {/* Trial Banner */}
        {trialActive && artist.level === "STARTER" && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Essai gratuit actif
                    </h3>
                    <p className="text-sm text-blue-700">
                      Plus que {trialDaysLeft} jours restants • Niveau Starter
                      50/50
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="border-blue-300">
                  En savoir plus
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Level & Revenue Share */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Niveau Actuel</span>
                <Badge className={levelInfo.bgColor + " " + levelInfo.color}>
                  {levelInfo.name}
                </Badge>
              </CardTitle>
              <CardDescription>
                Votre part: {levelInfo.revenueShare * 100}% des revenus
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progress && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Tickets vendus
                      </span>
                      <span className="font-medium">
                        {stats.ticketsSold} / {progress.requirements.ticketsSold}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress.ticketsSoldProgress}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Revenus totaux
                      </span>
                      <span className="font-medium">
                        {stats.revenue.toFixed(2)} € /{" "}
                        {progress.requirements.revenue} €
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress.revenueProgress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-4">
                    Prochain niveau:{" "}
                    <span className="font-medium text-foreground">
                      {ARTIST_LEVELS[progress.nextLevel].name}
                    </span>{" "}
                    ({ARTIST_LEVELS[progress.nextLevel].revenueShare * 100}%)
                  </p>
                </div>
              )}
              {!progress && (
                <p className="text-sm text-muted-foreground">
                  Niveau maximum atteint !
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenus</CardTitle>
              <CardDescription>
                Vos gains et paiements disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Disponible maintenant
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {Number(availableRevenue).toFixed(2)} €
                  </span>
                </div>
                <Button className="w-full" disabled={Number(availableRevenue) === 0}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Demander un paiement
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    En attente (J+21)
                  </span>
                  <span className="font-semibold">
                    {Number(pendingRevenue).toFixed(2)} €
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenus totaux</span>
                  <span className="font-semibold">
                    {Number(artist.revenueTotal).toFixed(2)} €
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tickets Vendus
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {artist.ticketsSoldTotal}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Concerts Publiés
              </CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {artist.concerts.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Communauté
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {artist.communityLeads}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Commission
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {levelInfo.revenueShare * 100}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/concerts/new" className="block">
                <Button className="w-full justify-start" size="lg">
                  <Music className="mr-2 h-5 w-5" />
                  Créer un concert
                </Button>
              </Link>
              <Link href="/dashboard/concerts" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Gérer mes concerts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Derniers Concerts</CardTitle>
            </CardHeader>
            <CardContent>
              {artist.concerts.length > 0 ? (
                <div className="space-y-2">
                  {artist.concerts.slice(0, 3).map((concert) => (
                    <div
                      key={concert.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">
                          {concert.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(concert.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge variant="outline">{concert.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun concert créé
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
