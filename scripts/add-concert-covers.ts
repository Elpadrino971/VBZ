import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Images Unsplash pour les concerts (scènes de concerts, musique live)
const concertCovers = [
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop",
]

async function addConcertCovers() {
  console.log("🔍 Recherche des concerts sans image de couverture...\n")
  
  const concerts = await prisma.concert.findMany({
    where: {
      OR: [
        { coverUrl: null },
        { coverUrl: "" },
      ],
      status: {
        in: ["PUBLISHED", "LIVE"],
      },
    },
    include: {
      artist: true,
    },
  })
  
  console.log(`📋 ${concerts.length} concert(s) sans image trouvé(s)\n`)
  
  if (concerts.length === 0) {
    console.log("✅ Tous les concerts ont déjà une image de couverture !")
    await prisma.$disconnect()
    return
  }
  
  for (let i = 0; i < concerts.length; i++) {
    const concert = concerts[i]
    const coverUrl = concertCovers[i % concertCovers.length]
    
    await prisma.concert.update({
      where: { id: concert.id },
      data: { coverUrl },
    })
    
    console.log(`✅ Image ajoutée pour : ${concert.title} (${concert.artist.artistName})`)
  }
  
  console.log(`\n🎉 ${concerts.length} image(s) de couverture ajoutée(s) avec succès !`)
  console.log(`\n🌐 Rafraîchissez la page d'accueil pour voir les changements.`)
  
  await prisma.$disconnect()
}

addConcertCovers()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })

