import OpenAI from "openai"

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY not configured - ChatGPT features will not work")
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export async function generateConcertContent(concert: {
  title: string
  artistName: string
  description?: string | null
  date: Date
  duration?: number | null
}): Promise<string | null> {
  if (!openai) {
    return null
  }

  try {
    const prompt = `Tu es un expert en musique et concerts. Génère une fiche qualitative et engageante pour le concert suivant :

**Artiste :** ${concert.artistName}
**Titre du concert :** ${concert.title}
**Date :** ${new Date(concert.date).toLocaleDateString("fr-FR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})}
${concert.duration ? `**Durée :** ${concert.duration} minutes` : ""}
${concert.description ? `**Description :** ${concert.description}` : ""}

Génère une fiche qualitative qui inclut :
1. Une présentation de l'artiste et de son style musical
2. Ce à quoi les spectateurs peuvent s'attendre (ambiance, setlist potentiel, etc.)
3. Pourquoi ce concert est à ne pas manquer
4. Des informations pratiques et utiles

Le ton doit être enthousiaste mais professionnel, en français. Maximum 500 mots.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en musique et concerts. Tu rédiges des fiches qualitatives, engageantes et informatives pour des concerts en streaming.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || null
  } catch (error) {
    console.error("ChatGPT error:", error)
    return null
  }
}

export async function generateArtistBio(artist: {
  artistName: string
  bio?: string | null
  concertsCount: number
}): Promise<string | null> {
  if (!openai) {
    return null
  }

  try {
    const prompt = `Génère une biographie enrichie et engageante pour l'artiste suivant :

**Nom :** ${artist.artistName}
${artist.bio ? `**Bio actuelle :** ${artist.bio}` : ""}
**Nombre de concerts sur la plateforme :** ${artist.concertsCount}

Génère une biographie qui inclut :
1. Le style musical et l'univers artistique
2. Les influences et inspirations
3. L'expérience live et ce qui rend ses concerts uniques
4. Pourquoi suivre cet artiste

Le ton doit être professionnel mais accessible, en français. Maximum 300 mots.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en musique. Tu rédiges des biographies d'artistes engageantes et professionnelles.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || null
  } catch (error) {
    console.error("ChatGPT error:", error)
    return null
  }
}

