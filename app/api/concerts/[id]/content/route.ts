import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateConcertContent } from "@/lib/chatgpt"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const concert = await prisma.concert.findUnique({
      where: { id: params.id },
      include: { artist: true },
    })

    if (!concert) {
      return NextResponse.json({ error: "Concert non trouvé" }, { status: 404 })
    }

    // Vérifier si le contenu existe déjà
    let content = await prisma.concertContent.findUnique({
      where: { concertId: concert.id },
    })

    // Si pas de contenu, en générer un
    if (!content) {
      const generatedContent = await generateConcertContent({
        title: concert.title,
        artistName: concert.artist.artistName,
        description: concert.description,
        date: concert.date,
        duration: concert.duration,
      })

      if (generatedContent) {
        content = await prisma.concertContent.create({
          data: {
            concertId: concert.id,
            content: generatedContent,
            model: "gpt-4",
          },
        })
      }
    }

    return NextResponse.json({ content: content?.content || null })
  } catch (error) {
    console.error("Get concert content error:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du contenu" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const concert = await prisma.concert.findUnique({
      where: { id: params.id },
      include: { artist: true },
    })

    if (!concert) {
      return NextResponse.json({ error: "Concert non trouvé" }, { status: 404 })
    }

    // Régénérer le contenu
    const generatedContent = await generateConcertContent({
      title: concert.title,
      artistName: concert.artist.artistName,
      description: concert.description,
      date: concert.date,
      duration: concert.duration,
    })

    if (!generatedContent) {
      return NextResponse.json({ error: "Impossible de générer le contenu" }, { status: 500 })
    }

    // Mettre à jour ou créer le contenu
    const content = await prisma.concertContent.upsert({
      where: { concertId: concert.id },
      update: {
        content: generatedContent,
        model: "gpt-4",
        updatedAt: new Date(),
      },
      create: {
        concertId: concert.id,
        content: generatedContent,
        model: "gpt-4",
      },
    })

    return NextResponse.json({ content: content.content })
  } catch (error) {
    console.error("Generate concert content error:", error)
    return NextResponse.json({ error: "Erreur lors de la génération du contenu" }, { status: 500 })
  }
}

