"use client"

import { useState, useMemo } from "react"
import { ConcertCard } from "@/components/concert-card"
import { Input } from "@/components/ui/input"
import { Search, Music } from "lucide-react"

interface Concert {
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

interface ConcertsListProps {
  concerts: Concert[]
}

export function ConcertsList({ concerts }: ConcertsListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConcerts = useMemo(() => {
    if (searchQuery.trim() === "") {
      return concerts
    }
    const query = searchQuery.toLowerCase()
    return concerts.filter(
      (concert) =>
        concert.title.toLowerCase().includes(query) ||
        concert.artist.artistName.toLowerCase().includes(query)
    )
  }, [searchQuery, concerts])

  return (
    <>
      <div className="relative max-w-xl mb-12">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher des concerts ou des artistes..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredConcerts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredConcerts.map((concert) => (
            <ConcertCard key={concert.id} concert={concert} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">
            {searchQuery
              ? "Aucun concert trouvé correspondant à votre recherche"
              : "Aucun concert disponible pour le moment"}
          </p>
        </div>
      )}
    </>
  )
}

