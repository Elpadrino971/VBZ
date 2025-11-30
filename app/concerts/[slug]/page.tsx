import { notFound } from "next/navigation"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { VybzzPlayer } from "@/components/VybzzPlayer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConcertCard } from "@/components/concert-card"
import { ConcertContent } from "@/components/concert-content"
import { Calendar, Clock, MapPin, User, Ticket, Tv, Music } from "lucide-react"
import { CheckoutButton } from "@/components/checkout-button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { auth } from "@/lib/auth"

async function getConcert(slug: string) {
  const concert = await prisma.concert.findUnique({
    where: { slug },
    include: {
      artist: {
        include: {
          concerts: {
            where: {
              status: "PUBLISHED",
            },
            orderBy: {
              date: "asc",
            },
            take: 4,
            include: {
              artist: true,
            },
          },
        },
      },
    },
  })

  return concert
}

export default async function ConcertDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const concert = await getConcert(params.slug)
  const session = await auth()

  if (!concert) {
    notFound()
  }

  const isLive = concert.status === "LIVE"
  const isPast = concert.status === "ENDED"
  const discount = Math.round(
    ((Number(concert.pricePhysical) - Number(concert.priceEticket)) /
      Number(concert.pricePhysical)) *
      100
  )

  // Vérifier si l'utilisateur a un ticket pour ce concert
  let hasTicket = false
  if (session) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        concertId: concert.id,
        userId: session.user.id,
        type: "ETICKET",
      },
    })
    hasTicket = !!ticket
  }

  // Other concerts by the same artist (excluding current one)
  // Convertir les Decimal en nombres pour les Client Components
  const otherConcerts = concert.artist.concerts
    .filter((c) => c.id !== concert.id)
    .map((c) => ({
      ...c,
      pricePhysical: Number(c.pricePhysical),
      priceEticket: Number(c.priceEticket),
    }))
  
  // Convertir aussi le concert principal pour éviter les erreurs
  const concertWithNumbers = {
    ...concert,
    pricePhysical: Number(concert.pricePhysical),
    priceEticket: Number(concert.priceEticket),
  }
  
  // Afficher le player si l'utilisateur a un ticket ET qu'il y a un playbackId
  const canWatch = hasTicket && !!concert.muxPlaybackId

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Concert Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player ou Cover Image */}
            {canWatch ? (
              <div className="relative">
                <VybzzPlayer
                  playbackId={concert.muxPlaybackId!}
                  posterUrl={concert.coverUrl}
                  autoplay={false}
                  muted={false}
                />
                {isLive && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-red-500 animate-pulse text-white text-lg px-4 py-2">
                      🔴 EN DIRECT
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-purple-400 to-blue-500">
                {concert.coverUrl ? (
                  <Image
                    src={concert.coverUrl}
                    alt={concert.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Music className="h-24 w-24 text-white opacity-50" />
                  </div>
                )}
                {isLive && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 animate-pulse text-white text-lg px-4 py-2">
                      🔴 EN DIRECT
                    </Badge>
                  </div>
                )}
                {isPast && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      Concert terminé
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Concert Info */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{concert.title}</h1>

              <div className="flex items-center gap-3 mb-6">
                <Link
                  href={`/artists/${concert.artist.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {concert.artist.artistName}
                  </span>
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(concert.date), "PPP", { locale: fr })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Heure</p>
                    <p className="font-medium">
                      {format(new Date(concert.date), "HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>

                {concert.duration && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Durée</p>
                      <p className="font-medium">{concert.duration} minutes</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton Regarder si l'utilisateur a un ticket */}
              {hasTicket && concert.muxPlaybackId && (
                <div className="mb-6">
                  <Link href={`/watch/${concert.slug}`}>
                    <Button size="lg" className="w-full sm:w-auto">
                      <Tv className="mr-2 h-5 w-5" />
                      {isLive ? "Regarder le live" : "Regarder le concert"}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Description */}
              {concert.description && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-3">À propos</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {concert.description}
                  </p>
                </div>
              )}
            </div>

            {/* Artist Bio */}
            {concert.artist.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>À propos de {concert.artist.artistName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {concert.artist.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Other Concerts */}
            {otherConcerts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Autres concerts de {concert.artist.artistName}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {otherConcerts.slice(0, 2).map((otherConcert) => (
                    <ConcertCard key={otherConcert.id} concert={otherConcert} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Ticket Purchase */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* E-Ticket Card */}
              <Card className="border-primary border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Tv className="h-5 w-5 text-primary" />
                        E-Ticket Streaming
                      </CardTitle>
                      <CardDescription>Regardez le concert en live</CardDescription>
                    </div>
                    <Badge className="bg-green-500">-{discount}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      {concertWithNumbers.priceEticket.toFixed(2)} €
                    </p>
                    <p className="text-sm text-muted-foreground line-through">
                      {concertWithNumbers.pricePhysical.toFixed(2)} €
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Accès au stream live professionnel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Qualité vidéo HD</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Ticket avec QR code unique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Regardez depuis chez vous</span>
                    </li>
                  </ul>

                  {session ? (
                    <CheckoutButton concertId={concert.id} disabled={isPast}>
                      Acheter un E-Ticket
                    </CheckoutButton>
                  ) : (
                    <Link href="/auth/signin">
                      <Button className="w-full" size="lg">
                        Connectez-vous pour acheter
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Physical Ticket Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Ticket Physique
                  </CardTitle>
                  <CardDescription>Assistez au concert sur place</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">
                      {concertWithNumbers.pricePhysical.toFixed(2)} €
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Accès physique au concert</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Expérience live en présentiel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Ticket avec QR code unique</span>
                    </li>
                  </ul>

                  {session ? (
                    <CheckoutButton 
                      concertId={concert.id} 
                      disabled={isPast}
                      variant="outline"
                      ticketType="physical"
                    >
                      Acheter un Ticket Physique
                    </CheckoutButton>
                  ) : (
                    <Link href="/auth/signin">
                      <Button variant="outline" className="w-full" size="lg">
                        Connectez-vous pour acheter
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Astuce:</strong> Les e-tickets sont parfaits si
                    vous ne pouvez pas vous déplacer. Économisez jusqu&apos;à {discount}%
                    tout en profitant du concert en qualité HD !
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Fiche qualitative générée par ChatGPT */}
        <div className="mt-8">
          <ConcertContent concertId={concert.id} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 VYbzzZ. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
