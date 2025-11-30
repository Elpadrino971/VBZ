import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ScrollToTop } from '@/components/scroll-to-top'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VYbzzZ - Concerts Live & Streaming',
  description: 'Découvrez des concerts live exclusifs en streaming. Achetez vos billets (e-tickets ou physiques) et vivez une expérience musicale unique. Plateforme française de streaming de concerts.',
  keywords: ['concerts', 'live', 'streaming', 'billets', 'e-tickets', 'musique', 'artistes', 'spectacle'],
  authors: [{ name: 'VYbzzZ' }],
  creator: 'VYbzzZ',
  publisher: 'VYbzzZ',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  openGraph: {
    title: 'VYbzzZ - Concerts Live & Streaming',
    description: 'Découvrez des concerts live exclusifs en streaming. Achetez vos billets et vivez une expérience musicale unique.',
    url: '/',
    siteName: 'VYbzzZ',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VYbzzZ - Concerts Live en Streaming',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VYbzzZ - Concerts Live & Streaming',
    description: 'Découvrez des concerts live exclusifs en streaming. Achetez vos billets et vivez une expérience musicale unique.',
    images: ['/og-image.jpg'],
    creator: '@vybzzz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'votre-code-verification-google',
    // yandex: 'votre-code-verification-yandex',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}
