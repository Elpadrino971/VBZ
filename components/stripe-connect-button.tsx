"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, ExternalLink, Wallet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface StripeConnectButtonProps {
  stripeAccountId: string | null
}

export function StripeConnectButton({ stripeAccountId }: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la connexion à Stripe")
      }

      // Rediriger vers Stripe Connect
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      setLoading(false)
    }
  }

  if (stripeAccountId) {
    return (
      <Card className="border-green-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle>Compte bancaire connecté</CardTitle>
          </div>
          <CardDescription>
            Votre compte Stripe Connect est configuré. Vous pouvez recevoir des paiements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleConnect}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Gérer mon compte Stripe
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <CardTitle>Connecter votre compte bancaire</CardTitle>
        </div>
        <CardDescription>
          Vous devez connecter votre compte bancaire via Stripe Connect pour recevoir vos paiements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={handleConnect}
          className="w-full bg-amber-500 hover:bg-amber-600 text-black"
          disabled={loading}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {loading ? "Connexion en cours..." : "Connecter mon compte bancaire"}
        </Button>
        <p className="text-sm text-muted-foreground">
          La connexion se fait via Stripe Connect, un service sécurisé et fiable utilisé par des milliers de plateformes.
        </p>
      </CardContent>
    </Card>
  )
}

