import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function updateConcertWithMux() {
  const playbackId = "OK72200HGVXAYkTThO8200k3PAT2Dlnx3iTNY2Xg8YCno"
  
  console.log("🔍 Recherche des concerts...")
  
  // Trouver tous les concerts PUBLISHED
  const concerts = await prisma.concert.findMany({
    where: {
      status: "PUBLISHED",
    },
    take: 10,
  })
  
  console.log(`\n📋 ${concerts.length} concert(s) trouvé(s) :\n`)
  
  concerts.forEach((concert, index) => {
    console.log(`${index + 1}. ${concert.title}`)
    console.log(`   Slug: ${concert.slug}`)
    console.log(`   Date: ${concert.date.toISOString()}`)
    console.log(`   Status: ${concert.status}`)
    console.log(`   Playback ID actuel: ${concert.muxPlaybackId || "Aucun"}`)
    console.log("")
  })
  
  if (concerts.length === 0) {
    console.log("❌ Aucun concert trouvé. Créez d'abord un concert depuis le dashboard.")
    await prisma.$disconnect()
    return
  }
  
  // Mettre à jour le premier concert sans playback ID
  const concertToUpdate = concerts.find(c => !c.muxPlaybackId) || concerts[0]
  
  console.log(`\n✅ Mise à jour du concert : ${concertToUpdate.title}`)
  console.log(`   Playback ID : ${playbackId}\n`)
  
  await prisma.concert.update({
    where: { id: concertToUpdate.id },
    data: {
      muxPlaybackId: playbackId,
      status: "PUBLISHED", // S'assurer qu'il est publié
    },
  })
  
  console.log("✅ Concert mis à jour avec succès !")
  console.log(`\n🌐 Le concert devrait maintenant apparaître sur :`)
  console.log(`   - Page d'accueil : http://localhost:3001`)
  console.log(`   - Page du concert : http://localhost:3001/concerts/${concertToUpdate.slug}`)
  console.log(`   - Page watch : http://localhost:3001/watch/${concertToUpdate.slug}`)
  
  await prisma.$disconnect()
}

updateConcertWithMux()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })

