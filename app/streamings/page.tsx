import { Navbar } from "@/components/navbar"
import { ConcertCard } from "@/components/concert-card"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Tv, Play, Clock, User } from "lucide-react"
import Link from "next/link"

async function getAvailableStreamings() {
  try {
    // Récupérer tous les concerts avec un muxPlaybackId (assets/streamings disponibles)
    const streamings = await prisma.concert.findMany({
      where: {
        muxPlaybackId: {
          not: null,
        },
        status: {
          in: ["PUBLISHED", "LIVE", "ENDED"],
        },
      },
      include: {
        artist: {
          select: {
            id: true,
            artistName: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
    // Convertir Decimal en Number pour les prix
    return streamings.map((s) => ({
      ...s,
      priceEticket: Number(s.priceEticket),
      pricePhysical: Number(s.pricePhysical),
    }))
  } catch (error) {
    console.error("Error fetching streamings:", error)
    return []
  }
}

export default async function StreamingsPage() {
  const streamings = await getAvailableStreamings()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-[1320px]">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 dark:from-red-600 dark:to-red-700">
              <Tv className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-black text-foreground">
                Streamings Disponibles
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Regardez vos concerts préférés en streaming HD
              </p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-amber-500/50 via-transparent to-transparent dark:from-red-600/50 w-full mt-6"></div>
        </div>

        {/* Streamings Grid */}
        {streamings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {streamings.map((streaming) => (
              <ConcertCard key={streaming.id} concert={streaming} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
              <Tv className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Aucun streaming disponible
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Les streamings apparaîtront ici une fois que les artistes auront publié leurs concerts avec des vidéos.
            </p>
            <Link href="/concerts">
              <Button className="bg-primary text-primary-foreground">
                <Play className="mr-2 h-4 w-4" />
                Découvrir les concerts
              </Button>
            </Link>
          </div>
        )}

        {/* Info Section */}
        {streamings.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Streaming HD</h3>
                <p className="text-muted-foreground text-sm">
                  Qualité vidéo optimale pour une expérience immersive
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Disponible 24/7</h3>
                <p className="text-muted-foreground text-sm">
                  Regardez quand vous voulez, où vous voulez
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Accès illimité</h3>
                <p className="text-muted-foreground text-sm">
                  Avec votre ticket, regardez autant de fois que vous voulez
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 VYbzzZ. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

