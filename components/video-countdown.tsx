"use client"

import { useEffect, useState } from "react"
import { VybzzPlayer } from "./VybzzPlayer"
import { Card, CardContent } from "./ui/card"

interface VideoCountdownProps {
  playbackId: string
  posterUrl?: string | null
  onComplete?: () => void
}

export function VideoCountdown({ playbackId, posterUrl, onComplete }: VideoCountdownProps) {
  const [countdown, setCountdown] = useState(10)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    if (showVideo) return

    console.log("🎬 VideoCountdown démarré avec playbackId:", playbackId)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1
        console.log("⏱️ Compte à rebours:", newCount)
        if (newCount <= 0) {
          clearInterval(timer)
          console.log("✅ Compte à rebours terminé, affichage de la vidéo")
          setShowVideo(true)
          if (onComplete) {
            onComplete()
          }
          return 0
        }
        return newCount
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showVideo, onComplete, playbackId])

  if (showVideo) {
    console.log("🎥 Affichage de VybzzPlayer avec playbackId:", playbackId)
    return (
      <VybzzPlayer
        playbackId={playbackId}
        posterUrl={posterUrl}
        autoplay={true}
        muted={false}
      />
    )
  }

  return (
    <Card 
      className="bg-[#111] border-white/10 backdrop-blur-sm"
      style={{ borderRadius: '14px' }}
    >
      <CardContent className="flex flex-col items-center justify-center py-24">
        <div className="relative w-32 h-32 mb-6">
          {/* Cercle de compte à rebours */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="rgba(251, 191, 36, 0.8)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(countdown / 10) * 339.29} 339.29`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          {/* Nombre au centre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-black text-white">{countdown}</span>
          </div>
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-2">
          Le concert va commencer
        </h3>
        <p className="text-white/60 text-center max-w-md">
          Préparation de la diffusion en cours...
        </p>
      </CardContent>
    </Card>
  )
}

