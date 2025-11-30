"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConcertContentProps {
  concertId: string
}

export function ConcertContent({ concertId }: ConcertContentProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContent()
  }, [concertId])

  const fetchContent = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/concerts/${concertId}/content`)
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      } else {
        setError("Impossible de charger le contenu")
      }
    } catch (err) {
      setError("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch(`/api/concerts/${concertId}/content`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la génération")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération")
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !content) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleRegenerate} className="mt-4 w-full" disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer le contenu
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!content) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Fiche qualitative
          </CardTitle>
          <CardDescription>
            Contenu généré par IA pour vous donner plus d&apos;informations sur ce concert
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRegenerate} className="w-full" disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer le contenu
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Fiche qualitative
            </CardTitle>
            <CardDescription>
              Contenu généré par IA pour vous donner plus d&apos;informations sur ce concert
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRegenerate}
            disabled={generating}
            title="Régénérer le contenu"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
            {content}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

