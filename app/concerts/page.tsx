import { Navbar } from "@/components/navbar"
import { ConcertCard } from "@/components/concert-card"
import { prisma } from "@/lib/prisma"
import { Music } from "lucide-react"

async function getConcerts() {
  const concerts = await prisma.concert.findMany({
    where: {
      status: {
        in: ["PUBLISHED", "LIVE"],
      },
    },
    include: {
      artist: true,
    },
    orderBy: {
      date: "asc",
    },
  })
  return concerts
}

export default async function ConcertsPage() {
  const concerts = await getConcerts()

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tous les concerts</h1>
          <p className="text-muted-foreground">
            Découvrez tous nos concerts live et à venir
          </p>
        </div>

        {concerts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {concerts.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/30 rounded-lg">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-medium text-muted-foreground mb-2">
              Aucun concert disponible
            </p>
            <p className="text-sm text-muted-foreground">
              Revenez bientôt pour découvrir nos prochains événements !
            </p>
          </div>
        )}
      </div>

      <footer className="border-t py-8 bg-muted/30 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 VYbzzZ. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
