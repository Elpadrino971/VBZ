"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ShareButton() {
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      alert("Lien copié dans le presse-papiers !")
    }
  }

  return (
    <Card 
      className="bg-[#111] border-white/10 backdrop-blur-sm"
      style={{ borderRadius: '14px' }}
    >
      <CardContent className="py-6">
        <h3 className="text-lg font-display font-bold text-white mb-4">
          Partager
        </h3>
        <p className="text-sm text-white/60 mb-4">
          Invitez vos amis à regarder ce concert
        </p>
        <Button
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium h-10 transition-all"
          onClick={handleShare}
          style={{ borderRadius: '14px' }}
        >
          Copier le lien
        </Button>
      </CardContent>
    </Card>
  )
}
