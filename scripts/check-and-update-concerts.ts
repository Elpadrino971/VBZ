import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkAndUpdateConcerts() {
  const playbackId = "OK72200HGVXAYkTThO8200k3PAT2Dlnx3iTNY2Xg8YCno"
  
  console.log("🔍 Recherche de TOUS les concerts...\n")
  
  // Trouver TOUS les concerts (même DRAFT)
  const allConcerts = await prisma.concert.findMany({
    include: {
      artist: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  })
  
  console.log(`📋 ${allConcerts.length} concert(s) trouvé(s) au total :\n`)
  
  if (allConcerts.length === 0) {
    console.log("❌ Aucun concert trouvé dans la base de données.")
    console.log("💡 Créez d'abord un concert depuis le dashboard : /dashboard/concerts/new")
    await prisma.$disconnect()
    return
  }
  
  allConcerts.forEach((concert, index) => {
    console.log(`${index + 1}. ${concert.title}`)
    console.log(`   Slug: ${concert.slug}`)
    console.log(`   Status: ${concert.status}`)
    console.log(`   Date: ${concert.date.toISOString()}`)
    console.log(`   Artiste: ${concert.artist.artistName}`)
    console.log(`   Playback ID: ${concert.muxPlaybackId || "❌ Aucun"}`)
    console.log("")
  })
  
  // Trouver les concerts sans playback ID
  const concertsWithoutPlayback = allConcerts.filter(c => !c.muxPlaybackId)
  
  if (concertsWithoutPlayback.length > 0) {
    console.log(`\n✅ ${concertsWithoutPlayback.length} concert(s) sans playback ID trouvé(s).`)
    console.log(`📝 Mise à jour du premier concert : ${concertsWithoutPlayback[0].title}\n`)
    
    await prisma.concert.update({
      where: { id: concertsWithoutPlayback[0].id },
      data: {
        muxPlaybackId: playbackId,
        status: "PUBLISHED", // Publier le concert
      },
    })
    
    console.log("✅ Concert mis à jour avec succès !")
    console.log(`\n🌐 Le concert devrait maintenant apparaître sur :`)
    console.log(`   - Page d'accueil : http://localhost:3000 (section "Streamings disponibles")`)
    console.log(`   - Page du concert : http://localhost:3000/concerts/${concertsWithoutPlayback[0].slug}`)
    console.log(`   - Page watch : http://localhost:3000/watch/${concertsWithoutPlayback[0].slug}`)
  } else {
    console.log("\n✅ Tous les concerts ont déjà un playback ID.")
    console.log("💡 Si les streamings ne s'affichent pas, vérifiez que le statut est 'PUBLISHED'")
  }
  
  // Vérifier les concerts avec playback ID mais pas PUBLISHED
  const concertsWithPlaybackButNotPublished = allConcerts.filter(
    c => c.muxPlaybackId && c.status !== "PUBLISHED"
  )
  
  if (concertsWithPlaybackButNotPublished.length > 0) {
    console.log(`\n⚠️  ${concertsWithPlaybackButNotPublished.length} concert(s) avec playback ID mais pas PUBLISHED :`)
    concertsWithPlaybackButNotPublished.forEach(c => {
      console.log(`   - ${c.title} (${c.status})`)
    })
    console.log("\n💡 Ces concerts ne s'afficheront pas sur la home.")
  }
  
  await prisma.$disconnect()
}

checkAndUpdateConcerts()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })

