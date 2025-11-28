import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ticket, QrCode, Calendar, MapPin, Tv, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import Image from "next/image"

async function getUserTickets(userId: string) {
  const tickets = await prisma.ticket.findMany({
    where: { userId },
    include: {
      concert: {
        include: {
          artist: true,
        },
      },
    },
    orderBy: {
      purchaseDate: "desc",
    },
  })

  return tickets
}

export default async function TicketsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const tickets = await getUserTickets(session.user.id)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/account">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au compte
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mes Tickets</h1>
          <p className="text-muted-foreground">
            Tous vos tickets achetés avec leurs QR codes
          </p>
        </div>

        {tickets.length > 0 ? (
          <div className="space-y-6">
            {tickets.map((ticket) => {
              const isUpcoming = new Date(ticket.concert.date) > new Date()
              const isPast = new Date(ticket.concert.date) < new Date()
              const isLive = ticket.concert.status === "LIVE"

              return (
                <Card key={ticket.id} className={isLive ? "border-red-500" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-2xl">
                            {ticket.concert.title}
                          </CardTitle>
                          {isLive && (
                            <Badge className="bg-red-500 animate-pulse">
                              🔴 EN DIRECT
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base">
                          {ticket.concert.artist.artistName}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={ticket.type === "ETICKET" ? "default" : "outline"}
                        className="text-sm"
                      >
                        {ticket.type === "ETICKET" ? (
                          <><Tv className="mr-1 h-3 w-3" /> E-Ticket</>
                        ) : (
                          <><MapPin className="mr-1 h-3 w-3" /> Physique</>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Ticket Info */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">
                              {format(
                                new Date(ticket.concert.date),
                                "PPP 'à' HH:mm",
                                { locale: fr }
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {isPast
                                ? "Concert terminé"
                                : isLive
                                ? "En cours maintenant !"
                                : "À venir"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Ticket className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {Number(ticket.pricePaid).toFixed(2)} €
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Acheté le{" "}
                              {format(
                                new Date(ticket.purchaseDate),
                                "PPP",
                                { locale: fr }
                              )}
                            </p>
                          </div>
                        </div>

                        {ticket.type === "ETICKET" && (
                          <div className="pt-4">
                            {isLive || isUpcoming ? (
                              <Link
                                href={`/watch/${ticket.concert.slug}`}
                                className="block"
                              >
                                <Button className="w-full" size="lg">
                                  {isLive
                                    ? "🔴 Regarder Maintenant"
                                    : "Voir le concert"}
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full"
                                size="lg"
                                disabled
                              >
                                Concert terminé
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg">
                        <div className="mb-4 flex items-center gap-2">
                          <QrCode className="h-5 w-5 text-muted-foreground" />
                          <p className="font-medium">QR Code du Ticket</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <QRCodeDisplay data={ticket.qrCode} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 text-center">
                          Présentez ce QR code à l&apos;entrée
                        </p>
                        {ticket.isUsed && (
                          <Badge variant="outline" className="mt-2">
                            ✓ Utilisé
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Aucun ticket acheté
              </h3>
              <p className="text-muted-foreground mb-6 text-center">
                Découvrez nos concerts et achetez vos premiers tickets !
              </p>
              <Link href="/concerts">
                <Button>Voir les concerts</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Client component for QR code display
function QRCodeDisplay({ data }: { data: string }) {
  // In a real app, you would use the qrcode library to generate the actual QR code image
  // For now, we'll use a placeholder
  return (
    <div className="w-48 h-48 bg-white flex items-center justify-center border-2 border-gray-200">
      <div className="text-center p-4">
        <QrCode className="h-24 w-24 mx-auto mb-2 text-gray-400" />
        <p className="text-xs text-gray-500 break-all">{data.slice(0, 20)}...</p>
      </div>
    </div>
  )
}
