"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Plus, Euro } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreditsWallet() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/credits/balance")
      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance)
      }
    } catch (error) {
      console.error("Error fetching credits balance:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCredits = async (amount: number) => {
    try {
      const response = await fetch("/api/credits/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'ajout de crédits")
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error adding credits:", error)
      alert(error instanceof Error ? error.message : "Une erreur est survenue")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-amber-500" />
          <CardTitle>Mon portefeuille</CardTitle>
        </div>
        <CardDescription>
          Utilisez vos crédits pour acheter des tickets sans sortir de l&apos;application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Solde disponible</p>
            <p className="text-2xl font-bold">
              {loading ? "..." : `${balance !== null ? balance.toFixed(2) : "0.00"} €`}
            </p>
          </div>
          <Euro className="h-8 w-8 text-amber-500" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => handleAddCredits(10)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            +10€
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAddCredits(25)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            +25€
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAddCredits(50)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            +50€
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAddCredits(100)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            +100€
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Les crédits ne sont pas remboursables mais n&apos;expirent pas.
        </p>
      </CardContent>
    </Card>
  )
}

