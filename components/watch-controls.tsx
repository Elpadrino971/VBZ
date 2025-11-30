"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Share2, Monitor, Sun, Moon } from "lucide-react"
import { useRouter } from "next/navigation"

interface WatchControlsProps {
  concertId: string
  initialLikes: number
  userLiked: boolean
  concertSlug: string
}

export function WatchControls({ 
  concertId, 
  initialLikes, 
  userLiked: initialUserLiked,
  concertSlug 
}: WatchControlsProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [userLiked, setUserLiked] = useState(initialUserLiked)
  const [isLiking, setIsLiking] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const router = useRouter()

  const handleLike = async () => {
    if (isLiking) return
    
    setIsLiking(true)
    const wasLiked = userLiked
    const newLiked = !wasLiked
    
    // Optimistic update
    setUserLiked(newLiked)
    setLikes(prev => newLiked ? prev + 1 : prev - 1)

    try {
      const response = await fetch(`/api/concerts/${concertId}/like`, {
        method: newLiked ? "POST" : "DELETE",
      })

      if (!response.ok) {
        // Revert on error
        setUserLiked(wasLiked)
        setLikes(prev => newLiked ? prev - 1 : prev + 1)
      }
    } catch (error) {
      // Revert on error
      setUserLiked(wasLiked)
      setLikes(prev => newLiked ? prev - 1 : prev + 1)
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/watch/${concertSlug}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Regardez ce concert sur VYbzzZ",
          text: "Venez regarder ce concert en streaming HD !",
          url,
        })
      } catch (error) {
        // User cancelled or error
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const handleCast = () => {
    // Try to use native casting (AirPlay/Chromecast)
    const video = document.querySelector<HTMLVideoElement>("video")
    if (video) {
      // For AirPlay (Safari/iOS)
      if ('webkitShowPlaybackTargetPicker' in video && typeof (video as any).webkitShowPlaybackTargetPicker === 'function') {
        (video as any).webkitShowPlaybackTargetPicker()
        return
      }
      
      // For Chromecast, open in new window as fallback
      // In production, you'd integrate the Cast SDK
      const videoUrl = `${window.location.origin}/watch/${concertSlug}`
      window.open(videoUrl, "_blank", "width=1920,height=1080")
    } else {
      // Fallback: open in new window
      const videoUrl = `${window.location.origin}/watch/${concertSlug}`
      window.open(videoUrl, "_blank", "width=1920,height=1080")
    }
  }

  const handleBrightnessChange = (value: number) => {
    setBrightness(value)
    const video = document.querySelector("video")
    if (video) {
      video.style.filter = `brightness(${value}%)`
    }
  }

  useEffect(() => {
    const video = document.querySelector("video")
    if (video) {
      video.style.filter = `brightness(${brightness}%)`
    }
  }, [brightness])

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Like Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLiking}
        className={`bg-white/10 hover:bg-white/20 border border-white/20 text-white h-9 px-4 ${
          userLiked ? "text-red-500 hover:text-red-400" : ""
        }`}
        style={{ borderRadius: '14px' }}
      >
        <Heart className={`h-4 w-4 mr-2 ${userLiked ? "fill-current" : ""}`} />
        <span>{likes}</span>
      </Button>

      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-9 px-4"
        style={{ borderRadius: '14px' }}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Partager
      </Button>

      {/* Cast Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCast}
        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-9 px-4"
        style={{ borderRadius: '14px' }}
      >
        <Monitor className="h-4 w-4 mr-2" />
        Envoyer sur écran
      </Button>

      {/* Brightness Control */}
      <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-[14px] px-3 py-1.5">
        <Moon className="h-4 w-4 text-white/70" />
        <input
          type="range"
          min="50"
          max="150"
          value={brightness}
          onChange={(e) => handleBrightnessChange(Number(e.target.value))}
          className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <Sun className="h-4 w-4 text-white/70" />
      </div>
    </div>
  )
}

