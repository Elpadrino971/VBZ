import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { ParallaxLogo } from "@/components/parallax-logo"
import { ConcertCard } from "@/components/concert-card"
import { FAQ } from "@/components/faq"
import { VybzzPlayer } from "@/components/VybzzPlayer"
import { Music, Ticket, Tv, TrendingUp, Radio, Sparkles, Users, Bell, Calendar, Mail, HelpCircle, FileText, Shield, ShieldCheck, Zap, ShoppingCart, Play, Star } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getUpcomingConcerts() {
  try {
    // Afficher TOUS les concerts PUBLISHED (pas seulement ceux à venir)
    const concerts = await prisma.concert.findMany({
      where: {
        status: {
          in: ["PUBLISHED", "LIVE"], // Inclure les concerts publiés et en live
        },
      },
      include: {
        artist: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        date: "desc", // Plus récents en premier
      },
      take: 8, // Augmenter à 8 pour plus de visibilité
    })
  
    // Ajouter des images par défaut si manquantes
    const defaultCovers = [
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=800&fit=crop",
    ]
    
    return concerts.map((concert, index) => ({
      ...concert,
      coverUrl: concert.coverUrl || defaultCovers[index % defaultCovers.length],
      // Convertir les Decimal en nombres pour les Client Components
      pricePhysical: Number(concert.pricePhysical),
      priceEticket: Number(concert.priceEticket),
      // Convertir aussi les Decimal dans l'objet artist inclus
      artist: {
        ...concert.artist,
        revenueTotal: Number(concert.artist.revenueTotal),
      },
    }))
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des concerts:", error)
    // Retourner un tableau vide en cas d'erreur pour éviter que l'application plante
    return []
  }
}

async function getPopularArtists() {
  try {
    // Récupérer les artistes avec le plus de concerts publiés
    const artists = await prisma.artist.findMany({
      where: {
        concerts: {
          some: {
            status: {
              in: ["PUBLISHED", "LIVE"],
            },
          },
        },
      },
      include: {
        concerts: {
          where: {
            status: {
              in: ["PUBLISHED", "LIVE"],
            },
          },
        },
        user: true,
      },
      orderBy: {
        ticketsSoldTotal: "desc",
      },
      take: 4,
    })
    
    // Ajouter des photos fictives si manquantes
    const artistPhotos = [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop&crop=faces",
    ]
    
    return artists.map((artist, index) => ({
      ...artist,
      photoUrl: artist.photoUrl || artistPhotos[index % artistPhotos.length],
      // Convertir les Decimal en nombres pour les Client Components
      revenueTotal: Number(artist.revenueTotal),
      // Convertir aussi les Decimal dans les concerts inclus si nécessaire
      concerts: artist.concerts.map(concert => ({
        ...concert,
        pricePhysical: Number(concert.pricePhysical),
        priceEticket: Number(concert.priceEticket),
      })),
    }))
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des artistes:", error)
    // Retourner un tableau vide en cas d'erreur
    return []
  }
}

async function getAvailableStreamings() {
  try {
    // Récupérer les concerts avec un muxPlaybackId (assets/streamings disponibles)
    // Inclure tous les statuts sauf DRAFT pour les streamings disponibles
    const streamings = await prisma.concert.findMany({
    where: {
      muxPlaybackId: {
        not: null,
      },
      status: {
        in: ["PUBLISHED", "LIVE", "ENDED"], // Inclure les concerts publiés, en live, ou terminés avec un asset
      },
    },
    include: {
      artist: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  })
  
  // Ajouter des images par défaut si manquantes
  const defaultCovers = [
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=800&fit=crop",
  ]
  
  return streamings.map((streaming, index) => ({
    ...streaming,
    coverUrl: streaming.coverUrl || defaultCovers[index % defaultCovers.length],
    // Convertir les Decimal en nombres pour les Client Components
    pricePhysical: Number(streaming.pricePhysical),
    priceEticket: Number(streaming.priceEticket),
    // Convertir aussi les Decimal dans l'objet artist inclus
    artist: {
      ...streaming.artist,
      revenueTotal: Number(streaming.artist.revenueTotal),
    },
  }))
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des streamings:", error)
    // Retourner un tableau vide en cas d'erreur
    return []
  }
}

export default async function HomePage() {
  const upcomingConcerts = await getUpcomingConcerts()
  const availableStreamings = await getAvailableStreamings()
  const popularArtists = await getPopularArtists()
  
  // Debug: log pour vérifier les concerts trouvés
  console.log("Concerts disponibles:", upcomingConcerts.length)
  console.log("Streamings disponibles:", availableStreamings.length)
  console.log("Artistes populaires:", popularArtists.length)

  return (
    <div className="min-h-screen">
      {/* 🔥 7. Bandeau en haut */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-red-600 dark:to-red-700 text-black dark:text-white py-2 text-center text-sm font-bold animate-slide-up">
        <div className="container mx-auto px-4">
          🎫 Nouvelle plateforme : Vivez les concerts en live depuis chez vous • Early Access disponible maintenant
        </div>
      </div>

      <Navbar />

      {/* Hero Section - Vibe Concert Live */}
      <section className="relative min-h-screen flex items-center justify-center overflow-x-hidden pt-24">
        {/* Image de fond avec overlay sombre pour ambiance live */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Concert background" 
            fill
            className="object-cover"
            priority
          />
          {/* Overlay noir 60% pour créer l'ambiance live */}
          <div className="absolute inset-0 bg-black/60" />
          {/* Dégradé noir → bordeaux → doré sur 60% de la hauteur - Personnalité VYbzzZ */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.85) 10%, rgba(101, 30, 30, 0.8) 25%, rgba(139, 69, 19, 0.7) 40%, rgba(184, 134, 11, 0.6) 50%, rgba(251, 191, 36, 0.4) 60%, rgba(251, 191, 36, 0.1) 70%, transparent 100%)'
            }}
          />
          {/* Accent doré vibrant pour l'identité VYbzzZ */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 z-10 relative text-center">
          {/* Fade radial lumineux derrière le texte */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 201, 74, 0.25) 0%, transparent 70%)',
              transform: 'translateY(-10%)'
            }}
          />
          
          {/* Titre principal avec logo animé */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6 animate-fade-in relative z-10">
            <ParallaxLogo />
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl leading-[1.1] tracking-tight text-center">
              <span className="block">Vivez les concerts</span>
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] inline-block animate-glow" style={{ filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.4))' }}>
                EN LIVE
              </span>
            </h1>
          </div>
          
          {/* Sous-titre plus lisible et impactant */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white mb-3 max-w-3xl mx-auto animate-slide-up font-bold drop-shadow-xl">
            De n&apos;importe où, quand vous voulez
          </p>
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto animate-slide-up drop-shadow-lg">
            Streaming HD • Artistes exclusifs • Communauté vibrante
          </p>

          {/* 🔥 4. Badges de confiance */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Paiements sécurisés
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
              <Zap className="h-4 w-4" />
              Streaming HD sans pub
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
              <Music className="h-4 w-4" />
              Artistes indépendants
            </div>
          </div>

          {/* CTA ajustés */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/concerts">
              <Button size="lg" className="bg-amber-500 dark:bg-red-600 hover:bg-amber-600 dark:hover:bg-red-700 text-black dark:text-white font-black text-lg md:text-xl shadow-2xl hover:shadow-amber-500/50 dark:hover:shadow-red-600/50 w-full sm:w-auto px-10 py-6 border-0 rounded-xl transform hover:scale-105 transition-all duration-300">
                <Music className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                DÉCOUVRIR LES CONCERTS
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="border-4 border-white text-white bg-white/5 hover:bg-white/15 backdrop-blur-md font-black text-lg md:text-xl w-full sm:w-auto px-10 py-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                CRÉER UN COMPTE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 🔥 2. Social Proof - Bande de chiffres/bénéfices */}
      <section className="py-8 md:py-12 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-[#1A0A0A] dark:to-[#2A0A0A] border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-[1100px]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-black text-amber-600 dark:text-red-500 mb-2">+120</div>
              <div className="text-sm md:text-base text-foreground font-medium">Artistes inscrits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-black text-amber-600 dark:text-red-500 mb-2">HD</div>
              <div className="text-sm md:text-base text-foreground font-medium">Streaming qualité</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-black text-amber-600 dark:text-red-500 mb-2">24/7</div>
              <div className="text-sm md:text-base text-foreground font-medium">Disponible partout</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-black text-amber-600 dark:text-red-500 mb-2">0</div>
              <div className="text-sm md:text-base text-foreground font-medium">Latence / Pub</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-black text-amber-600 dark:text-red-500 mb-2">100%</div>
              <div className="text-sm md:text-base text-foreground font-medium">Tickets sécurisés</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🧪 TEST - Live Stream Gratuit (à retirer après les tests) */}
      <section className="py-8 md:py-12 bg-black border-t border-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-4 text-center">
            <Badge className="bg-red-600 text-white mb-2">🔴 LIVE GRATUIT - TEST</Badge>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white mb-2">
              Regardez maintenant en direct
            </h2>
            <p className="text-gray-400 text-sm">
              Clip de test - Accès libre et gratuit
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <VybzzPlayer 
              playbackId="Ixf100DM00MIBOSiPjVkEfbToOgso01NuVin19ugUXbjQA"
              autoplay={false}
              muted={false}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 md:py-12 bg-card/50 dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-[1100px]">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-xl bg-[#FFC42E] dark:bg-red-600 mb-4 shadow-lg dark:shadow-red-600/30" style={{ boxShadow: '0 8px 24px rgba(255, 196, 46, 0.3)' }}>
                <Radio className="h-14 w-14 md:h-16 md:w-16 text-black dark:text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-black text-foreground">HD Instantanée</h3>
              <p className="text-sm md:text-base text-foreground/80 font-medium leading-relaxed">
                Streaming ultra-HD en direct
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-xl bg-[#FFC42E] dark:bg-red-600 mb-4 shadow-lg dark:shadow-red-600/30" style={{ boxShadow: '0 8px 24px rgba(255, 196, 46, 0.3)' }}>
                <Sparkles className="h-14 w-14 md:h-16 md:w-16 text-black dark:text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-black text-foreground">Live Immersif</h3>
              <p className="text-sm md:text-base text-foreground/80 font-medium leading-relaxed">
                Expérience immersive en temps réel
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-xl bg-[#FFC42E] dark:bg-red-600 mb-4 shadow-lg dark:shadow-red-600/30" style={{ boxShadow: '0 8px 24px rgba(255, 196, 46, 0.3)' }}>
                <Users className="h-14 w-14 md:h-16 md:w-16 text-black dark:text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-black text-foreground">Artistes Émergents</h3>
              <p className="text-sm md:text-base text-foreground/80 font-medium leading-relaxed">
                Découvrez les talents de demain
              </p>
            </div>
          </div>
        </div>
      </section>

          {/* Upcoming Concerts */}
          <section className="py-8 md:py-12 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-3xl md:text-4xl font-black text-foreground">
                Concerts à venir <span className="inline-block animate-bounce">🎵</span>
              </h2>
              <Link href="/concerts">
                <Button variant="outline">Voir tout</Button>
              </Link>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base mb-3">Ne manque pas les prochains lives</p>
            <div className="h-px bg-gray-200 dark:bg-gray-800 w-full"></div>
          </div>

          {upcomingConcerts.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {upcomingConcerts.map((concert) => (
                  <ConcertCard key={concert.id} concert={concert} />
                ))}
              </div>
              {upcomingConcerts.length >= 8 && (
                <div className="mt-8 text-center">
                  <Link href="/concerts">
                    <Button variant="outline" size="lg">
                      Voir tous les concerts ({upcomingConcerts.length}+)
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="py-16">
              {/* Placeholder cards stylées */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse border border-gray-200">
                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300" />
                    <div className="p-6 space-y-3">
                      <div className="h-5 bg-gray-300 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 mt-4" />
                      <div className="h-10 bg-gray-300 rounded mt-4" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Message engageant avec illustration */}
              <div className="text-center max-w-2xl mx-auto">
                {/* Illustration empty state style scène - réduite de 10-15% */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 md:w-26 md:h-26 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center border-4 border-amber-200">
                      <div className="text-4xl md:text-5xl">🎤</div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 text-xl">🎧</div>
                    <div className="absolute -top-2 -left-2 text-lg">🎵</div>
                  </div>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-black text-foreground mb-3">
                  Aucun concert prévu…
                  <br />
                  <span className="text-amber-600 font-semibold">pour l&apos;instant 🎧</span>
                </h3>
                <p className="text-base md:text-lg text-foreground/70 mb-6 font-medium leading-relaxed">
                  Active les notifications pour être parmi les premiers informés.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-6 text-lg">
                    <Bell className="mr-2 h-5 w-5" />
                    Activer les notifications
                  </Button>
                  <Button variant="outline" className="border-2 border-gray-300 font-semibold px-8 py-6 text-lg">
                    Explorer les artistes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 🔥 3. Comment ça marche - 3 étapes */}
      <section className="py-10 md:py-14 bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-[1100px]">
          <h2 className="font-display text-3xl md:text-4xl font-black text-center mb-12 text-foreground">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500 dark:bg-red-600 text-black dark:text-white mb-4 shadow-lg">
                <ShoppingCart className="h-10 w-10" />
              </div>
              <div className="text-2xl font-display font-black text-foreground mb-2">1️⃣ Choisissez un concert</div>
              <p className="text-muted-foreground leading-relaxed">
                Parcourez notre catalogue et sélectionnez le concert qui vous intéresse
              </p>
            </div>
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500 dark:bg-red-600 text-black dark:text-white mb-4 shadow-lg">
                <Ticket className="h-10 w-10" />
              </div>
              <div className="text-2xl font-display font-black text-foreground mb-2">2️⃣ Achetez votre ticket</div>
              <p className="text-muted-foreground leading-relaxed">
                Optez pour un e-ticket (50-70% moins cher) ou un ticket physique
              </p>
            </div>
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500 dark:bg-red-600 text-black dark:text-white mb-4 shadow-lg">
                <Play className="h-10 w-10" />
              </div>
              <div className="text-2xl font-display font-black text-foreground mb-2">3️⃣ Regardez le live en HD</div>
              <p className="text-muted-foreground leading-relaxed">
                Profitez du concert en streaming HD depuis n&apos;importe quel appareil
              </p>
            </div>
          </div>
        </div>
      </section>

          {/* Streamings disponibles - Assets Mux */}
          {availableStreamings.length > 0 && (
            <section className="py-8 md:py-12 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-background to-muted/30">
              <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-3xl md:text-4xl font-black text-foreground">
                  Streamings disponibles <span className="inline-block">📺</span>
                </h2>
                <Link href="/streamings">
                  <Button variant="outline">Voir tout</Button>
                </Link>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base mb-3">
                Regardez maintenant - Streaming HD disponible immédiatement
              </p>
              <div className="h-px bg-gray-200 dark:bg-gray-800 w-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {availableStreamings.map((streaming) => (
                <ConcertCard key={streaming.id} concert={streaming} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🔥 6. Artistes populaires */}
      {popularArtists.length > 0 && (
        <section className="py-10 md:py-14 bg-gray-50 dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-3xl md:text-4xl font-black text-foreground">
                  🎤 Artistes populaires
                </h2>
                <Link href="/concerts">
                  <Button variant="outline">Voir tout</Button>
                </Link>
              </div>
              <p className="text-muted-foreground text-base mb-3">
                Découvrez ceux qui font vibrer la communauté
              </p>
              <div className="h-px bg-gray-200 dark:bg-gray-800 w-full"></div>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {popularArtists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/concerts`}
                  className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg text-center"
                >
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <Image
                      src={artist.photoUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=faces"}
                      alt={artist.artistName}
                      fill
                      className="rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-colors shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                      <Music className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                    {artist.artistName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {artist.concerts.length} concert{artist.concerts.length > 1 ? "s" : ""}
                  </p>
                  {artist.ticketsSoldTotal > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {artist.ticketsSoldTotal} ticket{artist.ticketsSoldTotal > 1 ? "s" : ""} vendu{artist.ticketsSoldTotal > 1 ? "s" : ""}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

          {/* CTA Section */}
          <section className="py-10 md:py-14 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0A0A0A]">
            <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center rounded-xl p-8 md:p-12 border border-gray-200 dark:border-gray-800 max-w-3xl mx-auto" style={{ backgroundColor: '#FFFBF0', boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="font-display text-2xl md:text-3xl font-black mb-3 text-foreground flex items-center justify-center gap-2">
              <span className="text-xl md:text-2xl">🎤</span>
              Prêt à vivre la musique
              <br />
              <span className="text-amber-600">en direct ?</span>
            </h2>
            <p className="text-base md:text-lg text-foreground/70 mb-8 font-medium max-w-xl mx-auto">
              Rejoignez la communauté VYbzzZ et découvrez les concerts live dès maintenant
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-amber-500 dark:bg-red-600 hover:bg-amber-600 dark:hover:bg-red-700 text-black dark:text-white font-black text-lg md:text-xl px-10 py-6 shadow-xl hover:shadow-2xl dark:hover:shadow-red-600/50 transform hover:scale-105 transition-all duration-300 rounded-lg border-0">
                CRÉER UN COMPTE GRATUIT
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 🔥 1. FAQ - Avant le footer */}
      <section className="py-12 md:py-16 bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-[1100px]">
          <h2 className="font-display text-3xl md:text-4xl font-black text-center mb-4 text-foreground">
            Questions fréquentes
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Tout ce que vous devez savoir sur VYbzzZ
          </p>
          <FAQ />
        </div>
      </section>

          {/* Footer */}
          <footer className="border-t border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-[#1A1A1A] py-10 md:py-14">
            <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-2xl font-display font-black">
                <Music className="h-7 w-7 text-[#FFC42E] dark:text-red-600" />
                <span className="text-foreground">VYbzzZ</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Plateforme de concerts live et streaming HD.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Vivez la musique en direct comme jamais auparavant. Streaming HD, concerts exclusifs, communauté vibrante.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h4 className="font-display font-bold text-foreground text-lg mb-4">Informations</h4>
              <div className="flex flex-col gap-3">
                <Link href="/conditions" className="flex items-center gap-2 text-muted-foreground hover:text-[#FFC42E] dark:hover:text-red-500 transition-colors text-sm">
                  <FileText className="h-4 w-4" />
                  Conditions d&apos;utilisation
                </Link>
                <Link href="/mentions" className="flex items-center gap-2 text-muted-foreground hover:text-[#FFC42E] dark:hover:text-red-500 transition-colors text-sm">
                  <FileText className="h-4 w-4" />
                  Mentions légales
                </Link>
                <Link href="/politique" className="flex items-center gap-2 text-muted-foreground hover:text-[#FFC42E] dark:hover:text-red-500 transition-colors text-sm">
                  <Shield className="h-4 w-4" />
                  Politique de confidentialité
                </Link>
                <Link href="/support" className="flex items-center gap-2 text-muted-foreground hover:text-[#FFC42E] dark:hover:text-red-500 transition-colors text-sm">
                  <HelpCircle className="h-4 w-4" />
                  Support
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-display font-bold text-foreground text-lg mb-4">Contact</h4>
              <div className="flex flex-col gap-3">
                <a href="mailto:contact@vybzzz.com" className="flex items-center gap-2 text-muted-foreground hover:text-[#FFC42E] dark:hover:text-red-500 transition-colors text-sm">
                  <Mail className="h-4 w-4" />
                  contact@vybzzz.com
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-300 dark:border-gray-700 pt-8">
            <p className="text-center text-muted-foreground text-sm font-medium">
              © VYbzzZ 2025 – Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
