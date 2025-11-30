import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, HelpCircle, Mail, MessageCircle, FileText } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-primary" />
            Support
          </h1>
          <p className="text-muted-foreground">
            Nous sommes là pour vous aider. Trouvez des réponses à vos questions ou contactez-nous.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Mail className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Contactez-nous</CardTitle>
              <CardDescription>
                Envoyez-nous un email et nous vous répondrons dans les plus brefs délais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:contact@vybzzz.com">
                <Button className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  contact@vybzzz.com
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Consultez nos guides et FAQ pour trouver des réponses rapides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/conditions">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Conditions d&apos;utilisation
                  </Button>
                </Link>
                <Link href="/politique">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Politique de confidentialité
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Questions fréquentes</CardTitle>
            <CardDescription>
              Retrouvez les réponses aux questions les plus courantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Comment acheter un ticket ?</h3>
              <p className="text-sm text-muted-foreground">
                Naviguez vers la page du concert qui vous intéresse, choisissez entre un e-ticket (streaming) 
                ou un ticket physique, puis suivez le processus de paiement sécurisé.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Puis-je rembourser mon ticket ?</h3>
              <p className="text-sm text-muted-foreground">
                Les tickets sont non remboursables sauf en cas d&apos;annulation du concert par l&apos;artiste. 
                Dans ce cas, vous serez automatiquement remboursé.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Comment regarder un concert en streaming ?</h3>
              <p className="text-sm text-muted-foreground">
                Une fois votre e-ticket acheté, vous pouvez accéder au streaming depuis la page &quot;Mes tickets&quot; 
                ou directement depuis la page du concert si vous avez un ticket valide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Comment devenir artiste sur VYbzzZ ?</h3>
              <p className="text-sm text-muted-foreground">
                Créez un compte et sélectionnez le rôle &quot;Artiste&quot; lors de l&apos;inscription. 
                Vous bénéficierez d&apos;un essai gratuit de 90 jours pour découvrir la plateforme.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Problème technique lors d&apos;un concert ?</h3>
              <p className="text-sm text-muted-foreground">
                Si vous rencontrez des problèmes techniques, contactez-nous immédiatement à contact@vybzzz.com 
                avec les détails du problème. Nous ferons de notre mieux pour résoudre la situation rapidement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

