import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PolitiquePage() {
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
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl">Politique de confidentialité</CardTitle>
            </div>
            <p className="text-muted-foreground mt-2">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Collecte des données</h2>
              <p>
                Nous collectons les informations que vous nous fournissez lors de la création de votre compte, 
                de l&apos;achat de tickets et de l&apos;utilisation de nos services. Cela inclut votre nom, 
                adresse email, et informations de paiement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Utilisation des données</h2>
              <p>
                Vos données personnelles sont utilisées pour :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gérer votre compte et vos achats</li>
                <li>Vous envoyer des confirmations et notifications</li>
                <li>Améliorer nos services</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Partage des données</h2>
              <p>
                Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations avec :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nos prestataires de services (Stripe pour les paiements, Resend pour les emails)</li>
                <li>Les autorités légales si requis par la loi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Sécurité</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles 
                contre tout accès non autorisé, altération, divulgation ou destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Vos droits</h2>
              <p>
                Conformément au RGPD, vous avez le droit de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accéder à vos données personnelles</li>
                <li>Rectifier vos données</li>
                <li>Demander la suppression de vos données</li>
                <li>Vous opposer au traitement de vos données</li>
                <li>Demander la portabilité de vos données</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
              <p>
                Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme. 
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Contact</h2>
              <p>
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
                veuillez nous contacter à{" "}
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

