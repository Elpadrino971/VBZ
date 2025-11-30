import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MentionsPage() {
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
              <CardTitle className="text-3xl">Mentions légales</CardTitle>
            </div>
            <p className="text-muted-foreground mt-2">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Éditeur</h2>
              <p>
                <strong>VYbzzZ</strong>
                <br />
                Plateforme de concerts live et streaming HD
                <br />
                Email :{" "}
                <a href="mailto:contact@vybzzz.com" className="text-primary hover:underline">
                  contact@vybzzz.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Directeur de publication</h2>
              <p>
                Le directeur de publication est le représentant légal de VYbzzZ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Hébergement</h2>
              <p>
                Cette plateforme est hébergée sur Vercel et utilise les services suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Base de données : Supabase (PostgreSQL)</li>
                <li>Paiements : Stripe</li>
                <li>Streaming : Mux</li>
                <li>Emails : Resend</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur 
                et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents 
                téléchargeables et les représentations iconographiques et photographiques.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Protection des données</h2>
              <p>
                Conformément à la loi &quot;Informatique et Libertés&quot; du 6 janvier 1978 modifiée et au Règlement Général 
                sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression 
                des données qui vous concernent. Pour plus d&apos;informations, consultez notre{" "}
                <Link href="/politique" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
              <p>
                Ce site utilise des cookies pour améliorer l&apos;expérience utilisateur. En continuant à naviguer sur ce site, 
                vous acceptez l&apos;utilisation de cookies conformément à notre politique de confidentialité.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Contact</h2>
              <p>
                Pour toute question concernant ces mentions légales, veuillez nous contacter à{" "}
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

