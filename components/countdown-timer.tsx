"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface CountdownTimerProps {
  targetDate: Date
  onComplete?: () => void
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
        })
        if (onComplete) {
          onComplete()
        }
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds, isLive: false })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onComplete])

  if (timeLeft.isLive) {
    return (
      <Badge 
        className="bg-red-600 text-white text-base px-5 py-2 animate-pulse shadow-lg shadow-red-600/50"
        style={{ borderRadius: '14px' }}
      >
        🔴 EN DIRECT MAINTENANT
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-white/60 text-sm font-medium">Début dans :</span>
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 min-w-[60px] text-center">
            <div className="text-2xl font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</div>
            <div className="text-xs text-white/60 uppercase">jours</div>
          </div>
        )}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-xs text-white/60 uppercase">heures</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs text-white/60 uppercase">min</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 min-w-[60px] text-center">
          <div className="text-2xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs text-white/60 uppercase">sec</div>
        </div>
      </div>
    </div>
  )
}

