"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Info } from "lucide-react"
import Link from "next/link"

export default function NewConcertPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricePhysical: "",
    priceEticket: "",
    date: "",
    time: "",
    duration: "",
    youtubeUrl: "",
    coverUrl: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate prices
      const physicalPrice = parseFloat(formData.pricePhysical)
      const eticketPrice = parseFloat(formData.priceEticket)

      if (isNaN(physicalPrice) || isNaN(eticketPrice)) {
        setError("Les prix doivent être des nombres valides")
        setLoading(false)
        return
      }

      if (eticketPrice >= physicalPrice) {
        setError("Le prix e-ticket doit être inférieur au prix physique (50-70% recommandé)")
        setLoading(false)
        return
      }

      // Calculate discount percentage
      const discount = ((physicalPrice - eticketPrice) / physicalPrice) * 100

      if (discount < 30 || discount > 70) {
        setError("La réduction e-ticket devrait être entre 30% et 70%")
        setLoading(false)
        return
      }

      // Combine date and time
      const concertDateTime = new Date(`${formData.date}T${formData.time}`)

      const response = await fetch("/api/concerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          pricePhysical: physicalPrice,
          priceEticket: eticketPrice,
          date: concertDateTime.toISOString(),
          duration: formData.duration ? parseInt(formData.duration) : null,
          youtubeUrl: formData.youtubeUrl || null,
          coverUrl: formData.coverUrl || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue")
        return
      }

      router.push("/dashboard/concerts")
    } catch (error) {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const calculateDiscount = () => {
    const physical = parseFloat(formData.pricePhysical)
    const eticket = parseFloat(formData.priceEticket)

    if (!isNaN(physical) && !isNaN(eticket) && physical > 0) {
      return Math.round(((physical - eticket) / physical) * 100)
    }
    return 0
  }

  const discount = calculateDiscount()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Créer un nouveau concert</CardTitle>
            <CardDescription>
              Configurez votre concert live et définissez les tarifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre du concert *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Concert Live Acoustique 2025"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Décrivez votre concert..."
                    className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <Label htmlFor="coverUrl">Image de couverture (URL)</Label>
                  <Input
                    id="coverUrl"
                    type="url"
                    value={formData.coverUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, coverUrl: e.target.value })
                    }
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="time">Heure *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Durée (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="90"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Les e-tickets doivent être 50-70% moins chers que les tickets
                    physiques pour encourager le streaming
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pricePhysical">Prix Ticket Physique (€) *</Label>
                    <Input
                      id="pricePhysical"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pricePhysical}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePhysical: e.target.value,
                        })
                      }
                      placeholder="50.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="priceEticket">Prix E-ticket (€) *</Label>
                    <Input
                      id="priceEticket"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.priceEticket}
                      onChange={(e) =>
                        setFormData({ ...formData, priceEticket: e.target.value })
                      }
                      placeholder="15.00"
                      required
                    />
                  </div>
                </div>

                {discount > 0 && (
                  <div
                    className={`p-3 rounded-md ${
                      discount >= 50 && discount <= 70
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      Réduction e-ticket: {discount}%
                    </p>
                    {discount >= 50 && discount <= 70 ? (
                      <p className="text-xs mt-1">Tarification idéale !</p>
                    ) : (
                      <p className="text-xs mt-1">
                        Recommandé: entre 50% et 70% de réduction
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* YouTube URL */}
              <div>
                <Label htmlFor="youtubeUrl">URL YouTube Live (optionnel)</Label>
                <Input
                  id="youtubeUrl"
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, youtubeUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/live/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Vous pourrez aussi l&apos;ajouter plus tard
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Création..." : "Créer le concert"}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
