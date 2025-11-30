import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { CreditsWallet } from "@/components/credits-wallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Wallet, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CreditsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/account">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au compte
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-amber-500" />
            Mon portefeuille
          </h1>
          <p className="text-muted-foreground">
            Gérez vos crédits pour acheter des tickets sans sortir de l&apos;application
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <CreditsWallet />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Comment ça marche ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">💳 Ajoutez des crédits</h3>
                <p className="text-sm text-muted-foreground">
                  Rechargez votre portefeuille avec des montants de 10€ à 100€. Les crédits sont ajoutés instantanément après paiement.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎫 Utilisez vos crédits</h3>
                <p className="text-sm text-muted-foreground">
                  Lors de l&apos;achat d&apos;un ticket, choisissez de payer avec vos crédits. Plus besoin de sortir de l&apos;application !
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">⏰ Pas d&apos;expiration</h3>
                <p className="text-sm text-muted-foreground">
                  Vos crédits ne sont pas remboursables mais n&apos;expirent jamais. Utilisez-les quand vous voulez.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

