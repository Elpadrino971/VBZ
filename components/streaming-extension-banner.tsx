"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, Calendar, Euro } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface StreamingExtensionBannerProps {
  concertId: string
  concertTitle: string
  currentEndDate: Date
  extensionPricePerDay: number
  onExtensionPurchased?: () => void
}

export function StreamingExtensionBanner({
  concertId,
  concertTitle,
  currentEndDate,
  extensionPricePerDay,
  onExtensionPurchased,
}: StreamingExtensionBannerProps) {
  const [selectedOption, setSelectedOption] = useState<"week" | "twoWeeks" | "month">("week")
  const [loading, setLoading] = useState(false)

  const extensionOptions = [
    { 
      id: "week" as const,
      days: 7, 
      label: "1 semaine", 
      price: 6.93, // 0.99€ × 7 jours
      popular: true 
    },
    { 
      id: "twoWeeks" as const,
      days: 14, 
      label: "2 semaines", 
      price: 13.86 // 0.99€ × 14 jours
    },
    { 
      id: "month" as const,
      days: 30, 
      label: "1 mois", 
      price: 29.70 // 0.99€ × 30 jours
    },
  ]

  const selectedOptionData = extensionOptions.find(opt => opt.id === selectedOption)!
  const selectedDays = selectedOptionData.days

  // Utiliser le prix fixe de l'option sélectionnée (0.99€/jour)
  const totalPrice = selectedOptionData.price
  const newEndDate = new Date(currentEndDate)
  newEndDate.setDate(newEndDate.getDate() + selectedDays)

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/streaming/extension", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          concertId,
          days: selectedDays,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          alert("Erreur : URL de paiement non reçue")
        }
      } else {
        const error = await response.json().catch(() => ({ error: "Une erreur est survenue" }))
        alert(error.error || "Une erreur est survenue lors du paiement")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card 
      className="bg-gradient-to-br from-amber-500/10 to-red-600/10 dark:from-red-600/10 dark:to-red-700/10 border-2 border-amber-500/30 dark:border-red-600/30 backdrop-blur-sm"
      style={{ borderRadius: '14px' }}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 dark:bg-red-600/20">
            <Zap className="h-5 w-5 text-amber-600 dark:text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-white mb-1">
              Prolonger le streaming
            </h3>
            <p className="text-white/70 text-sm">
              Le streaming se termine le {format(currentEndDate, "PPP", { locale: fr })}
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <p className="text-white/80 text-sm mb-3 font-medium">
              Choisissez la durée d&apos;extension :
            </p>
            <div className="flex flex-wrap gap-2">
              {extensionOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedOption === option.id
                      ? "bg-amber-500 dark:bg-red-600 border-amber-600 dark:border-red-700 text-white"
                      : "bg-white/5 border-white/20 text-white/70 hover:border-white/40"
                  }`}
                  style={{ borderRadius: '10px' }}
                >
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{option.label}</span>
                      {option.popular && (
                        <Badge className="bg-white/20 text-xs px-1.5 py-0.5">Populaire</Badge>
                      )}
                    </div>
                    <span className="text-xs opacity-80">{option.price.toFixed(2)} €</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10" style={{ borderRadius: '10px' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Clock className="h-4 w-4" />
                <span>Nouvelle date de fin</span>
              </div>
              <span className="text-white font-bold">
                {format(newEndDate, "PPP", { locale: fr })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Euro className="h-4 w-4" />
                <span>Prix total</span>
              </div>
              <span className="text-2xl font-display font-black text-amber-500 dark:text-red-500">
                {totalPrice.toFixed(2)} €
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-xs text-white/60">
                0,99 € par jour × {selectedDays} jours = {totalPrice.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-amber-500 dark:bg-red-600 hover:bg-amber-600 dark:hover:bg-red-700 text-black dark:text-white font-bold"
          style={{ borderRadius: '14px' }}
        >
          {loading ? "Redirection vers le paiement..." : `Prolonger de ${selectedDays} jours`}
        </Button>

        <p className="text-xs text-white/50 text-center mt-3">
          Paiement sécurisé via Stripe • Accès immédiat après paiement
        </p>
      </CardContent>
    </Card>
  )
}

