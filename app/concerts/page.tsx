import { Navbar } from "@/components/navbar"
import { ConcertCard } from "@/components/concert-card"
import { prisma } from "@/lib/prisma"
import { Music, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ConcertsList } from "./concerts-list"

async function getConcerts() {
  const concerts = await prisma.concert.findMany({
    where: {
      status: {
        in: ["PUBLISHED", "LIVE"],
      },
    },
    include: {
      artist: {
        select: {
          id: true,
          userId: true,
          artistName: true,
          bio: true,
          photoUrl: true,
          level: true,
          trialEndDate: true,
          ticketsSoldTotal: true,
          revenueTotal: true,
          communityLeads: true,
          stripeAccountId: true,
          subscriptionId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })
  
  // Convertir les Decimal en nombres pour les Client Components
  return concerts.map((concert) => ({
    ...concert,
    pricePhysical: Number(concert.pricePhysical),
    priceEticket: Number(concert.priceEticket),
    artist: {
      ...concert.artist,
      // Convertir les Decimal de l'artiste en nombres
      revenueTotal: Number(concert.artist.revenueTotal || 0),
      ticketsSoldTotal: Number(concert.artist.ticketsSoldTotal || 0),
      communityLeads: Number(concert.artist.communityLeads || 0),
      // S'assurer que user est bien un objet plain
      user: concert.artist.user ? {
        id: concert.artist.user.id,
        name: concert.artist.user.name,
        email: concert.artist.user.email,
        image: concert.artist.user.image,
      } : null,
    },
  }))
}

export default async function ConcertsPage() {
  const concerts = await getConcerts()

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="mb-12">
          <h1 className="font-display text-5xl font-bold mb-4">
            Découvrez les <span className="bg-gradient-primary bg-clip-text text-transparent">Concerts Live</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Trouvez votre prochaine expérience musicale inoubliable
          </p>
        </div>

        <ConcertsList concerts={concerts} />
      </div>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xl font-display font-bold">
              <Music className="h-6 w-6 text-primary" />
              <span className="bg-gradient-primary bg-clip-text text-transparent">VYbzzZ</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 VYbzzZ. Vivez la musique en direct comme jamais auparavant.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
