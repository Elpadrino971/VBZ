"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Wallet, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Euro, 
  CheckCircle2,
  ArrowRight,
  Info,
  Zap,
  Loader2,
  CheckCircle
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { daysUntilRelease as calculateDaysUntilRelease } from "@/lib/payout-calculator"

interface PayoutDashboardProps {
  artist: {
    id: string
    artistName: string
    level: string
    revenueTotal: number
  }
  availableAmount: number
  waitingAmount: number
  totalYearAmount: number
  availablePayouts: Array<{
    id: string
    amount: number
    releaseDate: Date
    isFirstPayout: boolean
    daysUntilRelease: number
    concert: {
      title: string
      date: Date
    }
  }>
  waitingPayouts: Array<{
    id: string
    amount: number
    releaseDate: Date
    isFirstPayout: boolean
    daysUntilRelease: number
    concert: {
      title: string
      date: Date
    }
  }>
}

export function PayoutDashboard({
  artist,
  availableAmount,
  waitingAmount,
  totalYearAmount,
  availablePayouts,
  waitingPayouts,
}: PayoutDashboardProps) {
  const isPremium = artist.level === "PREMIUM"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleTransfer = async () => {
    if (availableAmount < 1) {
      setError("Le montant minimum de retrait est de 1€.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/stripe/connect/transfer", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du transfert")
      }

      setSuccess(data.message || `Transfert de ${data.amount.toFixed(2)}€ effectué avec succès.`)
      
      // Recharger la page après 2 secondes pour voir les mises à jour
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-black mb-2">Mes Paiements</h1>
        <p className="text-muted-foreground">
          Gérez vos revenus et suivez vos paiements
        </p>
      </div>

      {/* Section 1 : Résumé */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Solde Disponible */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Disponible
            </CardTitle>
            <CardDescription>Montant retirable maintenant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-black text-green-600 mb-4">
              {availableAmount.toFixed(2)} €
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleTransfer}
              disabled={loading || availableAmount < 1}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transfert en cours...
                </>
              ) : (
                "Retirer maintenant"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Solde en Attente */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              En attente
            </CardTitle>
            <CardDescription>Déblocage en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-black text-amber-600 mb-4">
              {waitingAmount.toFixed(2)} €
            </div>
            {waitingPayouts.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Prochain déblocage : {format(waitingPayouts[0].releaseDate, "PPP", { locale: fr })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Cumulé Annuel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Total {new Date().getFullYear()}
            </CardTitle>
            <CardDescription>Revenus cumulés cette année</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-black mb-4">
              {totalYearAmount.toFixed(2)} €
            </div>
            <div className="text-sm text-muted-foreground">
              {artist.revenueTotal.toFixed(2)} € au total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2 : Solde Disponible */}
      {availablePayouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solde Disponible</CardTitle>
            <CardDescription>
              {availablePayouts.length} paiement(s) disponible(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availablePayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">{payout.concert.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(payout.concert.date, "PPP", { locale: fr })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      {Number(payout.amount).toFixed(2)} €
                    </div>
                    <Badge className="bg-green-600 mt-1">Disponible</Badge>
                  </div>
                </div>
              ))}
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mt-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            <div className="mt-6">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                size="lg"
                onClick={handleTransfer}
                disabled={loading || availableAmount < 1}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transfert en cours...
                  </>
                ) : (
                  "Transférer vers mon compte bancaire"
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Stripe enverra dans 2 à 3 jours ouvrés
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 3 : Solde en Attente */}
      {waitingPayouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solde en Attente</CardTitle>
            <CardDescription>
              {waitingPayouts.length} paiement(s) en attente de déblocage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {waitingPayouts.map((payout) => {
                const daysLeft = calculateDaysUntilRelease(payout.releaseDate)
                const totalDays = payout.daysUntilRelease
                const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100))

                return (
                  <div
                    key={payout.id}
                    className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="font-semibold">{payout.concert.title}</span>
                          {payout.isFirstPayout && (
                            <Badge variant="outline" className="text-xs">
                              Premier paiement
                            </Badge>
                          )}
                          {isPremium && !payout.isFirstPayout && (
                            <Badge className="bg-purple-600 text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Accéléré
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Concert : {format(payout.concert.date, "PPP", { locale: fr })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-amber-600">
                          {Number(payout.amount).toFixed(2)} €
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Déblocage prévu : {format(payout.releaseDate, "PPP", { locale: fr })}
                        </span>
                        <span className="font-medium">
                          {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Info className="h-3 w-3" />
                        <span>
                          {payout.isFirstPayout
                            ? "Premier paiement : 14 jours (règle Stripe)"
                            : isPremium
                            ? "Déblocage accéléré : 3 jours (compte Pro)"
                            : "Déblocage standard : 7 jours après la fin du concert"}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4 : Informations */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Informations sur les paiements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Pour garantir des paiements sûrs et éviter les litiges,</strong> les revenus sont disponibles{" "}
            <strong>7 jours après la fin du concert</strong>.
          </p>
          <p>
            <strong>Premier paiement : 14 jours</strong> (règle Stripe Connect obligatoire).
          </p>
          {isPremium ? (
            <p className="flex items-center gap-2 text-purple-600 font-semibold">
              <Zap className="h-4 w-4" />
              <strong>Déblocage accéléré J+3 disponible</strong> pour votre compte Premium (70/30).
            </p>
          ) : (
            <p>
              <strong>Déblocage accéléré →</strong> disponible pour les comptes Pro (70/30).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Historique */}
      {availablePayouts.length === 0 && waitingPayouts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun paiement en cours</h3>
            <p className="text-muted-foreground text-center mb-6">
              Vos revenus apparaîtront ici une fois que vos concerts seront terminés.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

