"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Music, Play } from "lucide-react"

interface ArtistContentSlotProps {
  videoUrl?: string | null
  title?: string
}

export function ArtistContentSlot({ videoUrl, title = "Extraits à venir" }: ArtistContentSlotProps) {
  return (
    <Card 
      className="bg-[#111] border-white/10 backdrop-blur-sm"
      style={{ borderRadius: '14px' }}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Music className="h-5 w-5 text-amber-500 dark:text-red-500" />
          <h3 className="text-lg font-display font-bold text-white">
            Contenu de l&apos;artiste
          </h3>
        </div>

        {videoUrl ? (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          </div>
        ) : (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center border border-white/10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                <Play className="h-8 w-8 text-white/40" />
              </div>
              <p className="text-white/60 text-sm font-medium">
                {title}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

