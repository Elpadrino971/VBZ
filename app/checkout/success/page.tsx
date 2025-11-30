"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Ticket, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [concertSlug, setConcertSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID manquant")
      setLoading(false)
      return
    }

    // Vérifier et créer le ticket si nécessaire
    const verifyAndCreateTicket = async () => {
      try {
        const response = await fetch(`/api/checkout/verify-session?session_id=${sessionId}`)
        const data = await response.json()

        if (response.ok) {
          console.log("✅ Ticket vérifié/créé:", data)
          if (data.concertSlug) {
            setConcertSlug(data.concertSlug)
            // Rediriger automatiquement vers la page de visualisation après 2 secondes
            setTimeout(() => {
              router.push(`/watch/${data.concertSlug}`)
            }, 2000)
          }
        } else {
          console.error("❌ Erreur:", data.error)
          setError(data.error || "Erreur lors de la création du ticket")
        }
      } catch (err) {
        console.error("❌ Erreur:", err)
        setError("Erreur lors de la vérification du paiement")
      } finally {
        setLoading(false)
      }
    }

    verifyAndCreateTicket()
  }, [sessionId, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Paiement réussi !</CardTitle>
          <CardDescription>
            Votre ticket a été créé avec succès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Vérification du paiement et création du ticket...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900">
                <strong>Erreur :</strong> {error}
              </p>
              <p className="text-sm text-red-700 mt-2">
                Le paiement a été validé mais le ticket n&apos;a pas pu être créé automatiquement.
                Contactez le support si le problème persiste.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Votre ticket vous attend !</strong>
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Consultez vos tickets et votre QR code dans votre compte.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {concertSlug ? (
              <>
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Redirection vers le concert dans quelques secondes...
                </p>
                <Link href={`/watch/${concertSlug}`} className="block">
                  <Button className="w-full" size="lg">
                    <Ticket className="mr-2 h-5 w-5" />
                    Accéder au concert maintenant
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/account/tickets" className="block">
                <Button className="w-full" size="lg" disabled={loading}>
                  <Ticket className="mr-2 h-5 w-5" />
                  Voir mes tickets
                </Button>
              </Link>
            )}
            <Link href="/" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
