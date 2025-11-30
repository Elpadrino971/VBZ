import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function createTestConcert() {
  const playbackId = "OK72200HGVXAYkTThO8200k3PAT2Dlnx3iTNY2Xg8YCno"
  
  console.log("🔍 Recherche d'un artiste...")
  
  // Trouver le premier artiste disponible
  const artist = await prisma.artist.findFirst({
    include: {
      user: true,
    },
  })
  
  if (!artist) {
    console.log("❌ Aucun artiste trouvé. Créez d'abord un compte artiste.")
    await prisma.$disconnect()
    return
  }
  
  console.log(`✅ Artiste trouvé : ${artist.artistName}\n`)
  
  // Créer un concert de test
  const concertDate = new Date()
  concertDate.setDate(concertDate.getDate() + 7) // Dans 7 jours
  
  const slug = `concert-test-mux-${Date.now()}`
  
  console.log("🎵 Création du concert de test...")
  console.log(`   Titre : Concert Test Mux`)
  console.log(`   Date : ${concertDate.toLocaleDateString("fr-FR")}`)
  console.log(`   Playback ID : ${playbackId}\n`)
  
  const concert = await prisma.concert.create({
    data: {
      artistId: artist.id,
      title: "Concert Test Mux - Streaming Live",
      slug,
      description: "Concert de test pour vérifier le streaming Mux. Profitez d'une expérience de streaming HD professionnelle !",
      pricePhysical: 50,
      priceEticket: 20, // 60% de réduction
      date: concertDate,
      duration: 90,
      coverUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop",
      muxPlaybackId: playbackId,
      status: "PUBLISHED",
    },
  })
  
  console.log("✅ Concert créé avec succès !\n")
  console.log("🌐 Le concert est maintenant disponible sur :")
  console.log(`   - Page d'accueil : http://localhost:3001`)
  console.log(`   - Page du concert : http://localhost:3001/concerts/${concert.slug}`)
  console.log(`   - Page watch : http://localhost:3001/watch/${concert.slug}`)
  console.log(`\n💡 Pour voir le player :`)
  console.log(`   1. Achetez un ticket E-Ticket depuis la page du concert`)
  console.log(`   2. Le player s'affichera automatiquement`)
  
  await prisma.$disconnect()
}

createTestConcert()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })

