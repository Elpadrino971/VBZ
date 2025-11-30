"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Ticket } from "lucide-react"

interface CheckoutButtonProps {
  concertId: string
  disabled?: boolean
  children?: React.ReactNode
  variant?: "default" | "outline"
  ticketType?: "eticket" | "physical"
}

export function CheckoutButton({ 
  concertId, 
  disabled, 
  children, 
  variant = "default",
  ticketType = "eticket"
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (disabled || loading) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("concertId", concertId)

      const endpoint = ticketType === "eticket" 
        ? "/api/checkout/eticket" 
        : "/api/checkout/physical"

      console.log("🚀 Envoi de la requête checkout vers:", endpoint)
      console.log("📦 Concert ID:", concertId)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Accept": "application/json",
        },
        body: formData,
      })

      console.log("📥 Réponse reçue - Status:", response.status)
      console.log("📥 Réponse - OK:", response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Données reçues:", data)
        
        // L'API retourne maintenant { url: "..." } pour les requêtes fetch
        if (data.url) {
          console.log("🔗 Redirection vers:", data.url)
          window.location.href = data.url
          return
        } else {
          console.error("❌ Pas d&apos;URL dans la réponse:", data)
          alert(`Erreur : URL de paiement non reçue. Réponse: ${JSON.stringify(data)}`)
          setLoading(false)
        }
      } else {
        // Si erreur
        const errorText = await response.text()
        console.error("❌ Erreur HTTP:", response.status)
        console.error("❌ Contenu de l'erreur:", errorText)
        
        let errorMessage = "Une erreur est survenue lors du paiement"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        
        alert(`Erreur ${response.status}: ${errorMessage}`)
        setLoading(false)
      }
    } catch (error) {
      console.error("❌ Exception lors du checkout:", error)
      alert(`Erreur: ${error instanceof Error ? error.message : "Une erreur est survenue lors du paiement"}`)
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className="w-full"
      size="lg"
      variant={variant}
    >
      {loading ? (
        "Redirection..."
      ) : (
        <>
          <Ticket className="mr-2 h-5 w-5" />
          {children || (ticketType === "eticket" ? "Acheter un E-Ticket" : "Acheter un Ticket Physique")}
        </>
      )}
    </Button>
  )
}

