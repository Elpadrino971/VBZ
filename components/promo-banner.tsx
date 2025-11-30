"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

interface PromoBannerProps {
  imageUrl?: string | null
  videoUrl?: string | null
  title?: string
  description?: string
  ctaText?: string
  ctaUrl?: string
}

export function PromoBanner({
  imageUrl,
  videoUrl,
  title = "Découvrez nos offres",
  description,
  ctaText = "En savoir plus",
  ctaUrl = "/",
}: PromoBannerProps) {
  // Si pas de contenu, ne rien afficher
  if (!imageUrl && !videoUrl) {
    return null
  }

  return (
    <Card 
      className="bg-[#111] border-white/10 backdrop-blur-sm overflow-hidden"
      style={{ borderRadius: '14px' }}
    >
      <div className="relative aspect-video">
        {videoUrl ? (
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {title && (
            <h3 className="text-xl font-display font-bold text-white mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-white/80 text-sm mb-4">
              {description}
            </p>
          )}
          {ctaUrl && (
            <Link href={ctaUrl} target="_blank" rel="noopener noreferrer">
              <Button 
                className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-medium"
                style={{ borderRadius: '14px' }}
              >
                {ctaText}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}

