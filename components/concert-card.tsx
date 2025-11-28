import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Euro, User } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

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
    artist: {
      artistName: string
    }
  }
}

export function ConcertCard({ concert }: ConcertCardProps) {
  const isLive = concert.status === "LIVE"
  const isPast = concert.status === "ENDED"

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-gradient-to-br from-purple-400 to-blue-500">
        {concert.coverUrl ? (
          <img
            src={concert.coverUrl}
            alt={concert.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-white text-4xl font-bold opacity-50">
              {concert.title.charAt(0)}
            </span>
          </div>
        )}
        {isLive && (
          <Badge className="absolute top-2 right-2 bg-red-500 animate-pulse">
            🔴 EN DIRECT
          </Badge>
        )}
        {isPast && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-medium">Concert terminé</span>
          </div>
        )}
      </div>

      <CardHeader>
        <h3 className="text-xl font-bold line-clamp-1">{concert.title}</h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-3 w-3 mr-1" />
          {concert.artist.artistName}
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
        <div className="pt-2 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">E-ticket (streaming)</span>
            <span className="font-bold text-primary">
              {concert.priceEticket.toFixed(2)} €
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ticket physique</span>
            <span className="font-semibold">
              {concert.pricePhysical.toFixed(2)} €
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/concerts/${concert.slug}`} className="w-full">
          <Button className="w-full" disabled={isPast}>
            {isLive ? "Voir le concert" : "Réserver"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
