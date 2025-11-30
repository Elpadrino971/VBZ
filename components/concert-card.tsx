"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Euro, User, Music } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useState } from "react"

interface ConcertCardProps {
  concert: {
    id: string
    title: string
    slug: string
    coverUrl: string | null
    date: Date
    duration: number | null
    priceEticket: number
    pricePhysical: number
    status: string
    muxPlaybackId?: string | null
    artist: {
      artistName: string
      photoUrl?: string | null
    }
  }
}

export function ConcertCard({ concert }: ConcertCardProps) {
  const [imageError, setImageError] = useState(false)
  const isLive = concert.status === "LIVE"
  const isPast = concert.status === "ENDED"
  const isStreaming = !!concert.muxPlaybackId && !isLive && !isPast
  
  // Image de fallback si l'image ne charge pas
  const fallbackImage = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=800&fit=crop"

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        {concert.coverUrl && !imageError ? (
          <img
            src={concert.coverUrl}
            alt={concert.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <img
              src={fallbackImage}
              alt={concert.title}
              className="w-full h-full object-cover opacity-80"
            />
            <Music className="h-16 w-16 text-white/80 relative z-10 absolute" />
          </div>
        )}
        {isLive && (
          <Badge className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold animate-pulse">
            LIVE
          </Badge>
        )}
        {isStreaming && (
          <Badge className="absolute top-4 right-4 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
            📺 Disponible
          </Badge>
        )}
        {isPast && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-medium">Concert terminé</span>
          </div>
        )}
      </div>

      <CardHeader>
        <h3 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-1">{concert.title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {concert.artist.photoUrl ? (
            <img
              src={concert.artist.photoUrl}
              alt={concert.artist.artistName}
              className="w-6 h-6 rounded-full object-cover border border-border"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="font-medium">{concert.artist.artistName}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>
            {format(new Date(concert.date), "PPP", { locale: fr })}
          </span>
        </div>
        {concert.duration && (
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{concert.duration} minutes</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-display font-bold text-primary">
            {concert.priceEticket.toFixed(2)} €
          </span>
          <Link href={`/concerts/${concert.slug}`} className="w-auto">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isPast}>
              {isLive ? "Voir le concert" : isStreaming ? "Regarder" : isPast ? "Terminé" : "Réserver"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
