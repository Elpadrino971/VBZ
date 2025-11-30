import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConditionsPage() {
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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl">Conditions d&apos;utilisation</CardTitle>
            </div>
            <p className="text-muted-foreground mt-2">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptation des conditions</h2>
              <p>
                En accédant et en utilisant la plateforme VYbzzZ, vous acceptez d&apos;être lié par ces conditions d&apos;utilisation. 
                Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Description du service</h2>
              <p>
                VYbzzZ est une plateforme de streaming de concerts en direct qui permet aux utilisateurs d&apos;acheter des tickets 
                pour assister à des concerts en ligne et aux artistes de diffuser leurs performances en direct.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Compte utilisateur</h2>
              <p>
                Pour utiliser certains services, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité 
                de vos identifiants et de toutes les activités qui se produisent sous votre compte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Achat de tickets</h2>
              <p>
                Les tickets achetés sur VYbzzZ sont non remboursables sauf en cas d&apos;annulation du concert par l&apos;artiste. 
                Les prix sont indiqués en euros TTC. Les paiements sont sécurisés via Stripe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Propriété intellectuelle</h2>
              <p>
                Tout le contenu de la plateforme, y compris les logos, textes, graphiques et vidéos, est la propriété de VYbzzZ 
                ou de ses partenaires. Vous ne pouvez pas reproduire, distribuer ou utiliser ce contenu sans autorisation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Limitation de responsabilité</h2>
              <p>
                VYbzzZ ne peut être tenu responsable des interruptions de service, des problèmes techniques ou de la qualité 
                du streaming qui pourraient survenir lors d&apos;un concert.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Modifications</h2>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur 
                publication sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Contact</h2>
              <p>
                Pour toute question concernant ces conditions, veuillez nous contacter à{" "}
                <a href="mailto:contact@vybzzz.com" className="text-primary hover:underline">
                  contact@vybzzz.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

