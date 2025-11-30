import { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

export function generateConcertMetadata(concert: {
  title: string
  slug: string
  artist: {
    artistName: string
  }
  description?: string | null
  coverUrl?: string | null
  date: Date
  priceEticket: number
}): Metadata {
  const concertDate = new Date(concert.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const ogImageUrl = concert.coverUrl
    ? concert.coverUrl
    : `${APP_URL}/api/og?type=concert&title=${encodeURIComponent(
        concert.title
      )}&artist=${encodeURIComponent(
        concert.artist.artistName
      )}&date=${encodeURIComponent(concertDate)}&price=${concert.priceEticket}`

  const title = `${concert.title} - ${concert.artist.artistName} | VYbzzZ`
  const description =
    concert.description ||
    `Découvrez le concert ${concert.title} de ${concert.artist.artistName} en live streaming. E-ticket à partir de ${concert.priceEticket}€. ${concertDate}.`

  return {
    title,
    description,
    keywords: [
      concert.artist.artistName,
      concert.title,
      'concert',
      'live',
      'streaming',
      'billets',
      'e-tickets',
    ],
    openGraph: {
      title,
      description,
      url: `/concerts/${concert.slug}`,
      siteName: 'VYbzzZ',
      locale: 'fr_FR',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${concert.title} - ${concert.artist.artistName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@vybzzz',
    },
  }
}

export function generateArtistMetadata(artist: {
  artistName: string
  bio?: string | null
  photoUrl?: string | null
  _count?: {
    concerts: number
  }
}): Metadata {
  const ogImageUrl = artist.photoUrl
    ? artist.photoUrl
    : `${APP_URL}/api/og?type=artist&artist=${encodeURIComponent(artist.artistName)}`

  const title = `${artist.artistName} - Artiste | VYbzzZ`
  const description =
    artist.bio ||
    `Découvrez ${artist.artistName} sur VYbzzZ. ${
      artist._count?.concerts
        ? `${artist._count.concerts} concert${artist._count.concerts > 1 ? 's' : ''} disponible${
            artist._count.concerts > 1 ? 's' : ''
          } en streaming.`
        : 'Concerts live en streaming.'
    }`

  return {
    title,
    description,
    keywords: [artist.artistName, 'artiste', 'concerts', 'live', 'streaming'],
    openGraph: {
      title,
      description,
      url: `/artists/${artist.artistName}`,
      siteName: 'VYbzzZ',
      locale: 'fr_FR',
      type: 'profile',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: artist.artistName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@vybzzz',
    },
  }
}

export function generateWatchMetadata(concert: {
  title: string
  slug: string
  artist: {
    artistName: string
  }
  coverUrl?: string | null
  description?: string | null
}): Metadata {
  const ogImageUrl = concert.coverUrl
    ? concert.coverUrl
    : `${APP_URL}/api/og?type=concert&title=${encodeURIComponent(
        concert.title
      )}&artist=${encodeURIComponent(concert.artist.artistName)}`

  const title = `🔴 LIVE: ${concert.title} - ${concert.artist.artistName} | VYbzzZ`
  const description =
    concert.description || `Regardez maintenant le concert live de ${concert.artist.artistName}.`

  return {
    title,
    description,
    keywords: [
      concert.artist.artistName,
      concert.title,
      'concert',
      'live',
      'streaming',
      'en direct',
    ],
    openGraph: {
      title,
      description,
      url: `/watch/${concert.slug}`,
      siteName: 'VYbzzZ',
      locale: 'fr_FR',
      type: 'video.other',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${concert.title} - ${concert.artist.artistName} LIVE`,
        },
      ],
    },
    twitter: {
      card: 'player',
      title,
      description,
      images: [ogImageUrl],
      creator: '@vybzzz',
      players: {
        playerUrl: `${APP_URL}/watch/${concert.slug}`,
        streamUrl: ogImageUrl,
        width: 1280,
        height: 720,
      },
    },
  }
}
