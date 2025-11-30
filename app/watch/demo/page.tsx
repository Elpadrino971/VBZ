import { ShareButton } from "@/components/share-button"
import { VybzzPlayer } from "@/components/VybzzPlayer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, User, MessageSquare, Music, ExternalLink } from "lucide-react"
import Link from "next/link"

// Playback ID Mux de démonstration
const DEMO_PLAYBACK_ID = "OK72200HGVXAYkTThO8200k3PAT2Dlnx3iTNY2Xg8YCno"

export default function WatchDemoPage() {
  const isLive = true // Simule un concert en direct

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Ambiance visuelle - Gradient radial et grain */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Gradient radial subtil */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
          }}
        />
        {/* Grain subtil */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      {/* Header immersif - semi-transparent, compact */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(6px)',
          height: '64px',
        }}
      >
        <div className="container mx-auto px-4 h-full max-w-[1320px]">
          <div className="flex items-center justify-between h-full">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="VYbzzZ Logo" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-white font-display font-bold text-xl">VYbzzZ</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/concerts">
                <Button 
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium h-10 px-5 text-sm transition-all"
                  style={{ borderRadius: '14px' }}
                >
                  Retour aux concerts
                </Button>
              </Link>
              <Link href="/concerts/demo-artist">
                <Button 
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium h-10 px-5 text-sm transition-all"
                  style={{ borderRadius: '14px' }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Fiche artiste
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-[1320px] pt-20">
        {/* Back Button - plus visible */}
        <div className="mb-6">
          <Link href="/">
            <Button 
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 hover:text-white font-medium h-9 px-4 text-sm transition-all"
              style={{ borderRadius: '14px' }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>

        {/* Header du concert */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-2">
                Concert Live - Démonstration Mux
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  <span>Artiste Démo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>En direct maintenant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>120 min</span>
                </div>
              </div>
            </div>
            {isLive && (
              <Badge 
                className="bg-red-600 text-white text-base px-5 py-2 animate-pulse shadow-lg shadow-red-600/50"
                style={{ borderRadius: '14px' }}
              >
                🔴 EN DIRECT
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
          {/* Colonne principale - Player + Chat + À propos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player - Mux Player Professionnel */}
            <div className="relative">
              {/* Ligne lumineuse subtile derrière le player */}
              <div 
                className="absolute -inset-1 rounded-[18px] opacity-20 blur-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                }}
              />
              {false ? (
                <Card className="bg-[#111] border-white/10 backdrop-blur-sm" style={{ borderRadius: '14px' }}>
                  <CardContent className="flex flex-col items-center justify-center py-24">
                    <Music className="h-16 w-16 text-amber-500 dark:text-red-500 mb-4" />
                    <h3 className="text-xl font-display font-bold text-white mb-2">
                      Player de démonstration
                    </h3>
                    <p className="text-white/60 text-center max-w-md mb-4">
                      Pour tester avec un vrai stream Mux, remplacez <code className="bg-black/50 px-2 py-1 rounded">DEMO_PLAYBACK_ID</code> dans le code par un vrai playback ID Mux.
                    </p>
                    <p className="text-sm text-white/40 text-center">
                      Créez un concert depuis le dashboard artiste pour obtenir un vrai playback ID.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <VybzzPlayer
                  playbackId={DEMO_PLAYBACK_ID}
                  posterUrl={null}
                  autoplay={false}
                  muted={false}
                />
              )}
            </div>

            {/* Chat Live - Plus fun et immersif */}
            <Card 
              className="bg-[#111] border-white/10 backdrop-blur-sm"
              style={{ borderRadius: '14px' }}
            >
              <CardContent className="py-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-6 w-6 text-amber-500 dark:text-red-500" />
                  <h3 className="text-lg font-display font-bold text-white">
                    Chat Live
                  </h3>
                </div>
                <div className="text-center py-12 border-t border-white/10">
                  <p className="text-[#aaa] mb-2 text-base">
                    💬 <strong className="text-white">Chat</strong> bientôt disponible
                  </p>
                  <p className="text-sm text-white/50">
                    Discutez avec d&apos;autres spectateurs pendant le concert
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* À propos - Plus court et orienté action */}
            <Card 
              className="bg-[#111] border-white/10 backdrop-blur-sm"
              style={{ borderRadius: '14px' }}
            >
              <CardContent className="py-6">
                <div className="flex items-center gap-2 mb-3">
                  <Music className="h-5 w-5 text-amber-500 dark:text-red-500" />
                  <h3 className="text-lg font-display font-bold text-white">
                    À propos du concert
                  </h3>
                </div>
                <p className="text-white/70 leading-relaxed mb-4 text-sm">
                  Bienvenue sur la page de démonstration du streaming live VYbzzZ avec Mux. 
                  Mux est une plateforme de streaming vidéo professionnelle qui offre une qualité HD 
                  et une latence réduite pour une expérience optimale.
                </p>
                <Link href="/concerts/demo-artist">
                  <Button 
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium h-9 px-4 text-sm transition-all"
                    style={{ borderRadius: '14px' }}
                  >
                    Voir la fiche artiste
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Partage */}
            <div style={{ borderRadius: '14px' }}>
              <ShareButton />
            </div>
          </div>

          {/* Sidebar - Ticket en premier, plus visible */}
          <div className="space-y-6">
            {/* Ticket Info - Style sombre cohérent */}
            <Card 
              className="bg-[#111] border-white/10 backdrop-blur-sm"
              style={{ borderRadius: '14px' }}
            >
              <CardContent className="py-6">
                <h3 className="text-lg font-display font-bold text-white mb-4">
                  Votre Ticket
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Type</span>
                    <Badge 
                      className="bg-amber-500 dark:bg-red-600 text-black dark:text-white text-xs px-2.5 py-1"
                      style={{ borderRadius: '14px' }}
                    >
                      E-Ticket
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Prix payé</span>
                    <span className="text-white font-bold text-base">
                      15.00 €
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <Link href="/account/tickets">
                      <Button 
                        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium h-10 transition-all"
                        style={{ borderRadius: '14px' }}
                      >
                        Voir tous mes tickets
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
