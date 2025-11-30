"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface TipButtonProps {
  concertId: string
  artistId: string
  artistName: string
}

const TIP_AMOUNTS = [2, 5, 10, 20] as const

export function TipButton({ concertId, artistId, artistName }: TipButtonProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleTip = async (amount: number) => {
    if (isProcessing) return

    setIsProcessing(true)
    setSelectedAmount(amount)

    try {
      const response = await fetch("/api/tips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concertId,
          artistId,
          amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du pourboire")
      }

      // Rediriger vers Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.success(`Pourboire de ${amount}€ envoyé avec succès !`)
        setIsOpen(false)
        setSelectedAmount(null)
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du pourboire")
      setSelectedAmount(null)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold"
        style={{ borderRadius: '14px' }}
      >
        <Heart className="mr-2 h-5 w-5" />
        Soutenir {artistName}
      </Button>
    )
  }

  return (
    <Card className="bg-[#111] border-white/10 backdrop-blur-sm" style={{ borderRadius: '14px' }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Envoyer un pourboire
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false)
              setSelectedAmount(null)
            }}
            className="text-white/60 hover:text-white"
          >
            ✕
          </Button>
        </div>
        <p className="text-sm text-white/60 mt-2">
          Montrez votre soutien à {artistName} avec un pourboire
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Paliers de pourboires */}
        <div className="grid grid-cols-2 gap-3">
          {TIP_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              onClick={() => handleTip(amount)}
              disabled={isProcessing}
              variant={selectedAmount === amount ? "default" : "outline"}
              className={`h-16 text-lg font-bold transition-all ${
                selectedAmount === amount
                  ? "bg-amber-500 hover:bg-amber-600 text-black"
                  : "bg-white/5 border-white/20 text-white hover:bg-white/10"
              }`}
              style={{ borderRadius: '14px' }}
            >
              {isProcessing && selectedAmount === amount ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  {amount}€
                </>
              )}
            </Button>
          ))}
        </div>

        {/* Info */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-white/50 text-center">
            Les pourboires sont ajoutés au solde de l&apos;artiste et suivent les mêmes règles de payout que les tickets
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

