import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { ConcertCard } from "@/components/concert-card"
import { Music, Ticket, Tv, TrendingUp } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getUpcomingConcerts() {
  const concerts = await prisma.concert.findMany({
    where: {
      status: "PUBLISHED",
      date: {
        gte: new Date(),
      },
    },
    include: {
      artist: true,
    },
    orderBy: {
      date: "asc",
    },
    take: 6,
  })
  return concerts
}

export default async function HomePage() {
  const upcomingConcerts = await getUpcomingConcerts()

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Vivez les concerts en live
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Streaming HD • Billets instantanés • Artistes exceptionnels
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/concerts">
                <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 w-full sm:w-auto">
                  <Music className="mr-2 h-5 w-5" />
                  Découvrir les concerts
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Tv className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Streaming Qualité HD</h3>
              <p className="text-muted-foreground">
                Regardez des concerts en direct depuis chez vous
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Ticket className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Billets Instantanés</h3>
              <p className="text-muted-foreground">
                E-tickets 50-70% moins chers que les places physiques
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Artistes Émergents</h3>
              <p className="text-muted-foreground">
                Soutenez directement vos artistes préférés
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Concerts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Concerts à venir</h2>
            <Link href="/concerts">
              <Button variant="outline">Voir tout</Button>
            </Link>
          </div>

          {upcomingConcerts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingConcerts.map((concert) => (
                <ConcertCard key={concert.id} concert={concert} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun concert prévu pour le moment
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Revenez bientôt pour découvrir nos prochains événements !
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 VYbzzZ. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
