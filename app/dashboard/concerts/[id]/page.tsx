"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Video, Copy, Check, AlertCircle, Radio, Upload, Play } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Concert {
  id: string
  title: string
  slug: string
  description: string | null
  date: string
  duration: number | null
  status: string
  muxLiveStreamId: string | null
  muxPlaybackId: string | null
  muxStreamKey: string | null
}

export default function ConcertManagePage() {
  const params = useParams()
  const router = useRouter()
  const concertId = params.id as string

  const [concert, setConcert] = useState<Concert | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingStream, setCreatingStream] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const [playbackIdInput, setPlaybackIdInput] = useState("")
  const [associatingAsset, setAssociatingAsset] = useState(false)
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [settingLive, setSettingLive] = useState(false)

  const fetchConcert = async () => {
    try {
      const response = await fetch(`/api/concerts/${concertId}`)
      if (!response.ok) {
        throw new Error("Concert non trouvé")
      }
      const data = await response.json()
      setConcert(data)
    } catch (error) {
      setError("Erreur lors du chargement du concert")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConcert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concertId])

  const handleCreateStream = async () => {
    setCreatingStream(true)
    setError("")

    try {
      const response = await fetch("/api/mux/create-live-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concertId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du stream")
      }

      // Recharger les données du concert
      await fetchConcert()
    } catch (error: any) {
      setError(error.message || "Erreur lors de la création du stream")
    } finally {
      setCreatingStream(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAssociateAsset = async () => {
    if (!playbackIdInput.trim()) {
      setError("Veuillez entrer un playback ID")
      return
    }

    setAssociatingAsset(true)
    setError("")

    try {
      const response = await fetch(`/api/concerts/${concertId}/mux-asset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playbackId: playbackIdInput.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l&apos;association de l&apos;asset")
      }

      // Recharger les données du concert
      await fetchConcert()
      setPlaybackIdInput("")
      setShowAssetForm(false)
    } catch (error: any) {
      setError(error.message || "Erreur lors de l&apos;association de l&apos;asset")
    } finally {
      setAssociatingAsset(false)
    }
  }

  const handleSetLive = async () => {
    setSettingLive(true)
    setError("")

    try {
      const response = await fetch(`/api/concerts/${concertId}/set-live`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du passage en LIVE")
      }

      // Recharger les données du concert
      await fetchConcert()
    } catch (error: any) {
      setError(error.message || "Erreur lors du passage en LIVE")
    } finally {
      setSettingLive(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center py-20">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!concert) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center py-20">
            <p className="text-destructive">Concert non trouvé</p>
            <Link href="/dashboard/concerts">
              <Button className="mt-4">Retour aux concerts</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const hasStream = !!concert.muxPlaybackId
  const rtmpUrl = "rtmp://global-live.mux.com:5222/app"

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/concerts">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux concerts
            </Button>
          </Link>
          <h1 className="text-3xl font-display font-bold mb-2">{concert.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {format(new Date(concert.date), "PPP 'à' HH:mm", { locale: fr })}
            </span>
            <Badge variant="outline">{concert.status}</Badge>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stream Mux Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Vidéo Mux
                </CardTitle>
                <CardDescription>
                  Configurez votre stream live ou associez une vidéo uploadée sur Mux
                </CardDescription>
              </div>
              {hasStream && (
                <Badge className="bg-green-600">Vidéo configurée</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!hasStream ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Créez un stream Mux live professionnel pour votre concert. Aucun branding externe, 
                    qualité HD optimale, latence réduite.
                  </p>
                  <Button onClick={handleCreateStream} disabled={creatingStream} className="w-full sm:w-auto">
                    {creatingStream ? "Création..." : "Créer un stream live Mux"}
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium mb-1 flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Ou associer une vidéo uploadée sur Mux
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Si vous avez déjà uploadé une vidéo sur Mux, associez-la ici
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowAssetForm(!showAssetForm)}
                    >
                      {showAssetForm ? "Masquer" : "Associer une vidéo"}
                    </Button>
                  </div>
                  
                  {showAssetForm && (
                    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Playback ID de votre vidéo Mux
                        </label>
                        <Input
                          placeholder="Ex: OK72200HGVXAYkTThO8200k3PAT2Dlnx3iTNY2Xg8YCno"
                          value={playbackIdInput}
                          onChange={(e) => setPlaybackIdInput(e.target.value)}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Trouvez votre Playback ID dans votre dashboard Mux
                        </p>
                      </div>
                      <Button
                        onClick={handleAssociateAsset}
                        disabled={associatingAsset || !playbackIdInput.trim()}
                        className="w-full"
                      >
                        {associatingAsset ? "Association..." : "Associer la vidéo"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Playback ID */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Playback ID (pour le player)
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      {concert.muxPlaybackId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(concert.muxPlaybackId!)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ce Playback ID est automatiquement utilisé dans le player
                  </p>
                </div>

                {/* RTMP URL */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    URL de Stream RTMP (pour OBS/encoder)
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                      {rtmpUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(rtmpUrl)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    URL fixe à utiliser dans OBS Studio
                  </p>
                </div>

                {/* Stream Key */}
                {concert.muxStreamKey && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Stream Key
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-sm">
                        {concert.muxStreamKey}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(concert.muxStreamKey!)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clé de stream à utiliser avec l&apos;URL RTMP
                    </p>
                  </div>
                )}

                {/* Instructions */}
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Radio className="h-4 w-4" />
                      Comment streamer avec OBS Studio
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Ouvrez OBS Studio</li>
                      <li>Allez dans Paramètres → Stream</li>
                      <li>Service : Personnalisé</li>
                      <li>Serveur : <code className="bg-background px-1 rounded">{rtmpUrl}</code></li>
                      <li>Clé de stream : Copiez la Stream Key ci-dessus</li>
                      <li>Cliquez sur OK et démarrez le stream</li>
                    </ol>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="pt-4 border-t space-y-3">
                  {concert.status === "PUBLISHED" && concert.muxLiveStreamId && (
                    <Button
                      onClick={handleSetLive}
                      disabled={settingLive}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {settingLive ? "Vérification..." : "🔴 Passer en LIVE"}
                    </Button>
                  )}
                  <Link href={`/watch/${concert.slug}`} target="_blank">
                    <Button variant="outline" className="w-full">
                      Prévisualiser le player
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

