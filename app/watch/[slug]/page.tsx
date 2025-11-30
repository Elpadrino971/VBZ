import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ShareButton } from "@/components/share-button"
import { VybzzPlayer } from "@/components/VybzzPlayer"
import { WatchControls } from "@/components/watch-controls"
import { LiveChat } from "@/components/live-chat"
import { TipButton } from "@/components/tip-button"
import { CountdownTimer } from "@/components/countdown-timer"
import { PromoBanner } from "@/components/promo-banner"
import { ArtistContentSlot } from "@/components/artist-content-slot"
import { VideoCountdown } from "@/components/video-countdown"
import { StreamingExtensionBanner } from "@/components/streaming-extension-banner"
import { ScrollToTopOnMount } from "@/components/scroll-to-top-on-mount"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Calendar, Clock, User, MessageSquare, Music, ExternalLink } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

async function getConcertAndVerifyAccess(slug: string, userId: string) {
  const concert = await prisma.concert.findUnique({
    where: { slug },
    include: {
      artist: true,
    },
  })

  if (!concert) {
    return { concert: null, hasAccess: false }
  }

  // Check if user has an e-ticket for this concert
  const ticket = await prisma.ticket.findFirst({
    where: {
      concertId: concert.id,
      userId,
      type: "ETICKET",
    },
  })

  // Get likes count and user like status (with error handling)
  let likesCount = 0
  let userLiked = false
  let comments: Array<{
    id: string
    content: string
    createdAt: string
    user: {
      name: string | null
      email: string
    }
  }> = []

  try {
    // Try to get likes count (with individual error handling)
    try {
      likesCount = await prisma.concertLike.count({
        where: { concertId: concert.id },
      })
    } catch (e) {
      console.warn("ConcertLike table may not exist:", e)
      likesCount = 0
    }

    // Try to get user like status
    try {
      const like = await prisma.concertLike.findUnique({
        where: {
          concertId_userId: {
            concertId: concert.id,
            userId,
          },
        },
      })
      userLiked = !!like
    } catch (e) {
      console.warn("Error checking user like:", e)
      userLiked = false
    }

    // Get recent comments
    try {
      const commentsData = await prisma.comment.findMany({
        where: { concertId: concert.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      })

      comments = commentsData.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        user: {
          name: c.user.name,
          email: c.user.email,
        },
      }))
    } catch (e) {
      console.warn("Comment table may not exist:", e)
      comments = []
    }
  } catch (error: any) {
    console.error("Error fetching likes/comments:", error?.message || error)
    // Continue with default values
  }

  return {
    concert,
    hasAccess: !!ticket,
    ticket,
    likesCount,
    userLiked,
    comments,
  }
}

export default async function WatchPage({
  params,
}: {
  params: { slug: string }
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const { concert, hasAccess, ticket, likesCount, userLiked, comments } = await getConcertAndVerifyAccess(
    params.slug,
    session.user.id
  )

  if (!concert) {
    notFound()
  }

  if (!hasAccess) {
    redirect(`/concerts/${concert.slug}`)
  }

  const isLive = concert.status === "LIVE"
  const isPast = concert.status === "ENDED"
  
  // 🎯 DEMO: Pour "Pop Festival", utiliser le playback ID spécifique
  const isPopFestival = concert.title.toLowerCase().includes("pop festival")
  // ⚠️ IMPORTANT: Ceci est le PLAYBACK ID (pas l'Asset ID)
  // Asset ID: 57ut402qsICLhgpsc3au25x9BjRQZWakk9vWyG00OAaJY
  // Playback ID public: 01c02msAhj7ug800qbzrvHkTNx4JZn79TBsCC8xtV7tc5k
  const demoPlaybackId = "01c02msAhj7ug800qbzrvHkTNx4JZn79TBsCC8xtV7tc5k"
  // Pour Pop Festival, TOUJOURS utiliser le playback ID de démo, peu importe ce qui est en base
  const effectivePlaybackId = isPopFestival ? demoPlaybackId : concert.muxPlaybackId
  // Pour Pop Festival, on a toujours un stream avec le demoPlaybackId
  const hasStream = isPopFestival ? true : !!concert.muxPlaybackId
  
  // 🎯 Pour Pop Festival, TOUJOURS afficher le compte à rebours de 10 secondes
  const showCountdown = isPopFestival
  
  // Calculer la date de fin du streaming (7 jours après le concert par défaut)
  const streamingEndDate = concert.streamingEndDate || (() => {
    const endDate = new Date(concert.date)
    endDate.setDate(endDate.getDate() + 7)
    return endDate
  })()
  
  // Date jusqu'à laquelle le streaming est prolongé (si extension payée)
  const streamingExtendedUntil = concert.streamingExtendedUntil
  
  // Date de fin effective du streaming
  const effectiveEndDate = streamingExtendedUntil || streamingEndDate
  
  // Vérifier si le streaming est encore disponible
  const now = new Date()
  const isStreamingAvailable = isPast && hasStream && now <= effectiveEndDate
  const canExtendStreaming = isPast && hasStream && now > effectiveEndDate
  
  // Prix par jour d'extension (par défaut 0.99€/jour)
  const extensionPricePerDay = Number(concert.extensionPricePerDay || 0.99)
  
  const isUpcoming = !isLive && !isPast && new Date(concert.date) > new Date()

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ScrollToTopOnMount />
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
              <Link href={`/concerts/${concert.slug}`}>
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
          <Link href="/account/tickets">
            <Button 
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 hover:text-white font-medium h-9 px-4 text-sm transition-all"
              style={{ borderRadius: '14px' }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à mes tickets
            </Button>
          </Link>
        </div>

        {/* Header du concert */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-2">
                {concert.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  <span>{concert.artist.artistName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {format(new Date(concert.date), "PPP 'à' HH:mm", { locale: fr })}
                  </span>
                </div>
                {concert.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{concert.duration} min</span>
                  </div>
                )}
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
            {isPast && (
              <Badge 
                className="bg-gray-600 text-white text-base px-5 py-2"
                style={{ borderRadius: '14px' }}
              >
                Concert terminé
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
          {/* Colonne principale - Player + Chat + À propos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player - Mux Player Professionnel */}
            <div className="mb-6">
              {isLive || (isPopFestival && hasStream) ? (
                /* Concert en LIVE ou Pop Festival → afficher le player avec compte à rebours si Pop Festival */
                <div className="relative">
                  {/* Ligne lumineuse subtile derrière le player */}
                  <div 
                    className="absolute -inset-1 rounded-[18px] opacity-20 blur-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                    }}
                  />
                  {showCountdown && effectivePlaybackId ? (
                    /* Pour Pop Festival, toujours afficher le VideoCountdown */
                    <VideoCountdown
                      playbackId={effectivePlaybackId}
                      posterUrl={concert.coverUrl}
                    />
                  ) : hasStream && effectivePlaybackId ? (
                    /* Pour les autres concerts LIVE, afficher directement le player */
                    <VybzzPlayer
                      playbackId={effectivePlaybackId}
                      posterUrl={concert.coverUrl}
                      autoplay={true}
                      muted={false}
                    />
                  ) : (
                    <Card 
                      className="bg-[#111] border-white/10 backdrop-blur-sm"
                      style={{ borderRadius: '14px' }}
                    >
                      <CardContent className="flex flex-col items-center justify-center py-24">
                        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                        <h3 className="text-xl font-display font-bold text-white mb-2">
                          Stream en cours de démarrage
                        </h3>
                        <p className="text-white/60 text-center max-w-md">
                          Le stream live va commencer dans quelques instants...
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : isPast ? (
                /* Concert terminé - Gérer le streaming disponible ou l'extension */
                <div className="space-y-6">
                  {isStreamingAvailable ? (
                    /* Streaming encore disponible (dans les 7 jours ou extension active) */
                    <>
                      <div className="relative">
                        <div 
                          className="absolute -inset-1 rounded-[18px] opacity-20 blur-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                          }}
                        />
                        {showCountdown && effectivePlaybackId ? (
                          /* Pour Pop Festival, toujours afficher le VideoCountdown */
                          <VideoCountdown
                            playbackId={effectivePlaybackId}
                            posterUrl={concert.coverUrl}
                          />
                        ) : effectivePlaybackId ? (
                          /* Pour les autres concerts terminés, afficher le player */
                          <VybzzPlayer
                            playbackId={effectivePlaybackId}
                            posterUrl={concert.coverUrl}
                            autoplay={false}
                            muted={false}
                          />
                        ) : null}
                      </div>
                      <Card 
                        className="bg-blue-500/10 border-blue-500/30 backdrop-blur-sm"
                        style={{ borderRadius: '14px' }}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">
                                Streaming disponible jusqu&apos;au {format(effectiveEndDate, "PPP", { locale: fr })}
                              </p>
                              <p className="text-white/60 text-sm mt-1">
                                Profitez du replay pendant encore {Math.ceil((effectiveEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} jour(s)
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : canExtendStreaming ? (
                    /* Streaming expiré - Proposer l'extension */
                    <>
                      <Card 
                        className="bg-[#111] border-white/10 backdrop-blur-sm"
                        style={{ borderRadius: '14px' }}
                      >
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <AlertCircle className="h-12 w-12 text-white/30 mb-4" />
                          <h3 className="text-xl font-display font-bold text-white mb-2">
                            Streaming expiré
                          </h3>
                          <p className="text-white/60 text-center max-w-md mb-6">
                            Le streaming gratuit de 7 jours est terminé. Prolongez-le pour continuer à regarder !
                          </p>
                        </CardContent>
                      </Card>
                      <StreamingExtensionBanner
                        concertId={concert.id}
                        concertTitle={concert.title}
                        currentEndDate={effectiveEndDate}
                        extensionPricePerDay={extensionPricePerDay}
                      />
                    </>
                  ) : (
                    /* Pas de stream disponible */
                    <Card 
                      className="bg-[#111] border-white/10 backdrop-blur-sm"
                      style={{ borderRadius: '14px' }}
                    >
                      <CardContent className="flex flex-col items-center justify-center py-24">
                        <AlertCircle className="h-16 w-16 text-white/30 mb-4" />
                        <h3 className="text-xl font-display font-bold text-white mb-2">
                          Concert terminé
                        </h3>
                        <p className="text-white/60 text-center max-w-md mb-6">
                          Ce concert est maintenant terminé. Merci d&apos;avoir participé !
                        </p>
                        <Link href="/concerts">
                          <Button 
                            className="bg-amber-500 dark:bg-red-600 hover:bg-amber-600 dark:hover:bg-red-700 text-black dark:text-white"
                            style={{ borderRadius: '14px' }}
                          >
                            Découvrir d&apos;autres concerts
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                /* Concert à venir → Afficher le VideoCountdown pour Pop Festival, sinon le CountdownTimer normal */
                <div className="space-y-6">
                  {showCountdown && hasStream && effectivePlaybackId ? (
                    /* Pour Pop Festival, afficher le VideoCountdown de 10 secondes */
                    <div className="relative">
                      <div 
                        className="absolute -inset-1 rounded-[18px] opacity-20 blur-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                        }}
                      />
                      <VideoCountdown
                        playbackId={effectivePlaybackId}
                        posterUrl={concert.coverUrl}
                        key={`countdown-${effectivePlaybackId}`}
                      />
                    </div>
                  ) : (
                    /* Pour les autres concerts, afficher le CountdownTimer normal */
                    <Card 
                      className="bg-[#111] border-white/10 backdrop-blur-sm"
                      style={{ borderRadius: '14px' }}
                    >
                      <CardContent className="py-8">
                        <div className="flex flex-col items-center justify-center text-center">
                          <h3 className="text-2xl font-display font-bold text-white mb-6">
                            Le concert commence bientôt
                          </h3>
                          <CountdownTimer targetDate={concert.date} />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 2️⃣ Emplacement pub propre */}
                  {(concert.promoImageUrl || concert.promoVideoUrl) && (
                    <PromoBanner
                      imageUrl={concert.promoImageUrl}
                      videoUrl={concert.promoVideoUrl}
                      title={concert.promoTitle || undefined}
                      description={concert.promoDescription || undefined}
                      ctaText={concert.promoCtaText || undefined}
                      ctaUrl={concert.promoCtaUrl || undefined}
                    />
                  )}

                  {/* 3️⃣ Slot bonus "contenu de l'artiste" */}
                  <ArtistContentSlot
                    videoUrl={concert.artistContentVideoUrl}
                    title="Extraits à venir"
                  />
                </div>
              )}
            </div>

            {/* Contrôles : Like, Partage, Cast, Luminosité */}
            {hasStream && !isPast && (
              <div className="mb-4">
                <WatchControls
                  concertId={concert.id}
                  initialLikes={likesCount}
                  userLiked={userLiked}
                  concertSlug={concert.slug}
                />
              </div>
            )}

            {/* Bouton pourboire */}
            {hasStream && !isPast && (
              <div className="mb-4">
                <TipButton
                  concertId={concert.id}
                  artistId={concert.artistId}
                  artistName={concert.artist.artistName}
                />
              </div>
            )}

            {/* Chat Live */}
            {hasStream && !isPast && (
              <LiveChat
                concertId={concert.id}
                initialComments={comments}
              />
            )}

            {/* À propos - Plus court et orienté action */}
            {concert.description && (
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
                  <p className="text-white/70 leading-relaxed mb-4 text-sm line-clamp-4">
                    {concert.description}
                  </p>
                  <Link href={`/concerts/${concert.slug}`}>
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
            )}

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
                      {Number(ticket?.pricePaid || 0).toFixed(2)} €
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
