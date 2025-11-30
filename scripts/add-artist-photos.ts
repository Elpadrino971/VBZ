import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Photos Unsplash pour les artistes (variées et professionnelles)
const artistPhotos = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces",
]

async function addArtistPhotos() {
  console.log("🔍 Recherche des artistes sans photo...\n")
  
  const artists = await prisma.artist.findMany({
    where: {
      OR: [
        { photoUrl: null },
        { photoUrl: "" },
      ],
    },
  })
  
  console.log(`📋 ${artists.length} artiste(s) sans photo trouvé(s)\n`)
  
  if (artists.length === 0) {
    console.log("✅ Tous les artistes ont déjà une photo !")
    await prisma.$disconnect()
    return
  }
  
  for (let i = 0; i < artists.length; i++) {
    const artist = artists[i]
    const photoUrl = artistPhotos[i % artistPhotos.length]
    
    await prisma.artist.update({
      where: { id: artist.id },
      data: { photoUrl },
    })
    
    console.log(`✅ Photo ajoutée pour : ${artist.artistName}`)
  }
  
  console.log(`\n🎉 ${artists.length} photo(s) ajoutée(s) avec succès !`)
  
  await prisma.$disconnect()
}

addArtistPhotos()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })

