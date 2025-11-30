"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Info,
  Music,
  Calendar,
  Clock,
  Euro,
  Video,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { format, parse, isValid, isFuture } from "date-fns"
import { fr } from "date-fns/locale"

const DURATION_OPTIONS = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 heure" },
  { value: "90", label: "1h30" },
  { value: "120", label: "2 heures" },
]

export default function NewConcertPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricePhysical: "",
    priceEticket: "",
    date: "",
    time: "",
    duration: "90",
    coverUrl: "",
  })

  // Calculer le prix recommandé pour e-ticket (60% de réduction par défaut)
  const calculateRecommendedPrice = (physicalPrice: number): number => {
    if (isNaN(physicalPrice) || physicalPrice <= 0) return 0
    return Math.round((physicalPrice * 0.4) * 100) / 100 // 60% de réduction
  }

  // Calculer le pourcentage de réduction
  const calculateDiscount = (): number => {
    const physical = parseFloat(formData.pricePhysical)
    const eticket = parseFloat(formData.priceEticket)
    if (!isNaN(physical) && !isNaN(eticket) && physical > 0) {
      return Math.round(((physical - eticket) / physical) * 100)
    }
    return 0
  }

  // Obtenir le jour de la semaine formaté
  const getFormattedDate = (): string => {
    if (!formData.date) return ""
    try {
      const date = parse(formData.date, "yyyy-MM-dd", new Date())
      if (isValid(date)) {
        return format(date, "EEEE d MMMM yyyy", { locale: fr })
      }
    } catch {}
    return ""
  }

  // Validation des champs
  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return "Le titre est obligatoire"
    }
    if (formData.title.length < 3) {
      return "Le titre doit contenir au moins 3 caractères"
    }
    if (!formData.coverUrl.trim()) {
      return "L&apos;image de couverture est obligatoire"
    }
    if (!formData.date) {
      return "La date est obligatoire"
    }
    if (!formData.time) {
      return "L&apos;heure est obligatoire"
    }

    // Vérifier que la date est dans le futur
    const concertDateTime = new Date(`${formData.date}T${formData.time}`)
    if (!isFuture(concertDateTime)) {
      return "La date et l&apos;heure doivent être dans le futur"
    }

    const physicalPrice = parseFloat(formData.pricePhysical)
    const eticketPrice = parseFloat(formData.priceEticket)

    if (isNaN(physicalPrice) || physicalPrice < 1) {
      return "Le prix physique doit être d&apos;au moins 1€"
    }
    if (physicalPrice > 300) {
      return "Le prix physique ne peut pas dépasser 300€"
    }
    if (isNaN(eticketPrice) || eticketPrice < 1) {
      return "Le prix e-ticket doit être d'au moins 1€"
    }
    if (eticketPrice >= physicalPrice) {
      return "Le prix e-ticket doit être inférieur au prix physique"
    }

    const discount = calculateDiscount()
    if (discount < 30 || discount > 70) {
      return "La réduction e-ticket doit être entre 30% et 70%"
    }

    return null
  }

  // Gérer le changement d'URL d'image
  useEffect(() => {
    if (formData.coverUrl) {
      // Vérifier si c'est une URL valide
      try {
        new URL(formData.coverUrl)
        setImagePreview(formData.coverUrl)
      } catch {
        setImagePreview(null)
      }
    } else {
      setImagePreview(null)
    }
  }, [formData.coverUrl])

  // Appliquer le prix recommandé
  const applyRecommendedPrice = () => {
    const physical = parseFloat(formData.pricePhysical)
    if (!isNaN(physical) && physical > 0) {
      const recommended = calculateRecommendedPrice(physical)
      setFormData({ ...formData, priceEticket: recommended.toFixed(2) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setLoading(true)

    try {
      const physicalPrice = parseFloat(formData.pricePhysical)
      const eticketPrice = parseFloat(formData.priceEticket)
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
          coverUrl: formData.coverUrl || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue")
        setShowConfirm(false)
        return
      }

      router.push(`/dashboard/concerts/${data.concert.id}`)
    } catch (error) {
      setError("Une erreur est survenue")
      setShowConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  const discount = calculateDiscount()
  const recommendedPrice = calculateRecommendedPrice(parseFloat(formData.pricePhysical) || 0)
  const formattedDate = getFormattedDate()
  const minDate = new Date().toISOString().split("T")[0] // Date minimale = aujourd'hui

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Header Professionnel */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-black">Créer un nouveau concert</h1>
              <p className="text-muted-foreground mt-1">
                Configurez votre concert live et définissez vos tarifs. Une fois créé, vous pourrez activer le streaming HD professionnel.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale - Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Card className="border-destructive bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <p className="font-medium">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 1 : Informations du concert */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Informations du concert
                  </CardTitle>
                  <CardDescription>
                    Titre, description et image de couverture de votre concert
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre du concert *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Ex: Concert Live Acoustique 2025"
                      className="mt-1"
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
                      placeholder="Décrivez votre concert, le style musical, les morceaux prévus..."
                      className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="coverUrl">Image de couverture *</Label>
                    <Input
                      id="coverUrl"
                      type="url"
                      value={formData.coverUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, coverUrl: e.target.value })
                      }
                      placeholder="https://exemple.com/image.jpg"
                      className="mt-1"
                      required
                    />
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Aperçu de l&apos;image :</p>
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                        <Image
                          src={imagePreview}
                          alt="Aperçu"
                          fill
                          className="object-cover"
                          onError={() => setImagePreview(null)}
                        />
                        </div>
                      </div>
                    )}
                    {!imagePreview && formData.coverUrl && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>URL d&apos;image invalide</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Section 2 : Planification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Planification
                  </CardTitle>
                  <CardDescription>
                    Date, heure et durée de votre concert
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        min={minDate}
                        className="mt-1"
                        required
                      />
                      {formattedDate && (
                        <p className="text-sm text-muted-foreground mt-2 font-medium capitalize">
                          📅 {formattedDate}
                        </p>
                      )}
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
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration">Durée du concert *</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) =>
                        setFormData({ ...formData, duration: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionnez la durée" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3 : Billetterie */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Billetterie
                  </CardTitle>
                  <CardDescription>
                    Définissez vos tarifs pour les tickets physiques et e-tickets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricePhysical">Prix Ticket Physique (€) *</Label>
                      <Input
                        id="pricePhysical"
                        type="number"
                        step="0.01"
                        min="1"
                        max="300"
                        value={formData.pricePhysical}
                        onChange={(e) =>
                          setFormData({ ...formData, pricePhysical: e.target.value })
                        }
                        placeholder="50.00"
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Prix minimum : 1€ • Maximum : 300€
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="priceEticket">Prix E-ticket (€) *</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="priceEticket"
                          type="number"
                          step="0.01"
                          min="1"
                          value={formData.priceEticket}
                          onChange={(e) =>
                            setFormData({ ...formData, priceEticket: e.target.value })
                          }
                          placeholder="15.00"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={applyRecommendedPrice}
                          className="whitespace-nowrap"
                        >
                          Prix recommandé
                        </Button>
                      </div>
                      {recommendedPrice > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Prix recommandé : {recommendedPrice.toFixed(2)}€ (60% de réduction)
                        </p>
                      )}
                    </div>
                  </div>

                  {discount > 0 && (
                    <div
                      className={`p-4 rounded-lg border ${
                        discount >= 50 && discount <= 70
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                          : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Réduction e-ticket : {discount}%
                          </p>
                          {discount >= 50 && discount <= 70 ? (
                            <p className="text-sm text-muted-foreground mt-1">
                              ✅ Tarification idéale ! Les e-tickets sont entre 50% et 70% moins chers.
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">
                              ⚠️ Recommandé : entre 50% et 70% de réduction pour encourager le streaming.
                            </p>
                          )}
                        </div>
                        {discount >= 50 && discount <= 70 && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section 4 : Streaming pro */}
              <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <Video className="h-5 w-5" />
                    Streaming Live Professionnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium">
                        Une fois le concert créé, vous pourrez activer le streaming HD professionnel via Mux.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Aucun branding externe</li>
                        <li>Qualité HD optimale</li>
                        <li>Latence réduite</li>
                        <li>Clé RTMP pour OBS Studio</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 5 : Actions */}
              <Card className="sticky bottom-0 bg-background border-t shadow-lg">
                <CardContent className="pt-6">
                  {showConfirm ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="font-medium mb-2">Confirmer la création du concert ?</p>
                        <p className="text-sm text-muted-foreground">
                          Vérifiez bien toutes les informations avant de continuer.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowConfirm(false)}
                          className="flex-1"
                        >
                          Retour
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                        >
                          {loading ? "Création..." : "Confirmer et créer"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <Link href="/dashboard" className="flex-1">
                        <Button type="button" variant="outline" className="w-full">
                          Annuler
                        </Button>
                      </Link>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                      >
                        {loading ? "Création..." : "Créer le concert"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Colonne droite - Prévisualisation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Aperçu du concert</CardTitle>
                <CardDescription>
                  Prévisualisation de votre concert
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.title || formData.coverUrl ? (
                  <div className="space-y-4">
                    {imagePreview && (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                        <Image
                          src={imagePreview}
                          alt="Aperçu"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {formData.title && (
                      <div>
                        <h3 className="font-semibold text-lg">{formData.title}</h3>
                        {formattedDate && (
                          <p className="text-sm text-muted-foreground mt-1 capitalize">
                            📅 {formattedDate}
                            {formData.time && ` à ${formData.time}`}
                          </p>
                        )}
                        {formData.duration && (
                          <p className="text-sm text-muted-foreground mt-1">
                            ⏱️ {DURATION_OPTIONS.find((d) => d.value === formData.duration)?.label || `${formData.duration} min`}
                          </p>
                        )}
                      </div>
                    )}
                    {(formData.pricePhysical || formData.priceEticket) && (
                      <div className="pt-4 border-t space-y-2">
                        {formData.pricePhysical && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ticket physique</span>
                            <span className="font-semibold">{parseFloat(formData.pricePhysical) || 0}€</span>
                          </div>
                        )}
                        {formData.priceEticket && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">E-ticket</span>
                            <span className="font-semibold text-green-600">
                              {parseFloat(formData.priceEticket) || 0}€
                              {discount > 0 && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  -{discount}%
                                </Badge>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Remplissez le formulaire pour voir l&apos;aperçu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
