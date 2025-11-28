import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

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

  return {
    concert,
    hasAccess: !!ticket,
    ticket,
  }
}

function extractYouTubeVideoId(url: string): string | null {
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
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

  const { concert, hasAccess, ticket } = await getConcertAndVerifyAccess(
    params.slug,
    session.user.id
  )

  if (!concert) {
    notFound()
  }

  if (!hasAccess) {
    redirect(`/concerts/${concert.slug}`)
  }

  const videoId = concert.youtubeUrl
    ? extractYouTubeVideoId(concert.youtubeUrl)
    : null

  const isLive = concert.status === "LIVE"
  const isPast = concert.status === "ENDED"

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {concert.title}
              </h1>
              <p className="text-gray-400">{concert.artist.artistName}</p>
            </div>
            {isLive && (
              <Badge className="bg-red-500 text-white text-lg px-4 py-2 animate-pulse">
                🔴 EN DIRECT
              </Badge>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="mb-6">
          {videoId && !isPast ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}${
                  isLive ? "?autoplay=1" : ""
                }`}
                title={concert.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : isPast ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-24">
                <AlertCircle className="h-16 w-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Concert terminé
                </h3>
                <p className="text-gray-400 text-center">
                  Ce concert est maintenant terminé. Merci d&apos;avoir participé !
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-24">
                <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Stream non configuré
                </h3>
                <p className="text-gray-400 text-center">
                  L&apos;artiste n&apos;a pas encore configuré le lien YouTube Live.
                  <br />
                  Revenez plus tard !
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Placeholder */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-gray-400">
                💬 <strong className="text-white">Chat</strong> bientôt
                disponible
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Discutez avec d&apos;autres spectateurs pendant le concert
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Concert Info */}
        {concert.description && (
          <Card className="bg-gray-900 border-gray-700 mt-6">
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                À propos du concert
              </h3>
              <p className="text-gray-300 whitespace-pre-line">
                {concert.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
