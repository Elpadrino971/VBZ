import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Ticket } from "lucide-react"

export default function CheckoutSuccessPage() {
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Votre ticket vous attend !</strong>
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Consultez vos tickets et votre QR code dans votre compte.
            </p>
          </div>

          <div className="space-y-2">
            <Link href="/account/tickets" className="block">
              <Button className="w-full" size="lg">
                <Ticket className="mr-2 h-5 w-5" />
                Voir mes tickets
              </Button>
            </Link>
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
