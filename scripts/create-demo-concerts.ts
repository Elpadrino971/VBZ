import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function createDemoConcerts() {
  console.log("🎵 Création de concerts de démonstration...\n")
  
  // Vérifier s'il y a des artistes
  const artists = await prisma.artist.findMany({
    take: 5,
  })
  
  if (artists.length === 0) {
    console.log("❌ Aucun artiste trouvé. Création d'artistes de démonstration...\n")
    
    const hashedPassword = await hash("demo123", 10)
    
    const demoArtists = [
      {
        email: "demo1@vybzzz.com",
        name: "Luna Star",
        artistName: "Luna Star",
        bio: "Chanteuse pop indépendante",
        photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=faces",
      },
      {
        email: "demo2@vybzzz.com",
        name: "Alex Rivers",
        artistName: "Alex Rivers",
        bio: "Auteur-compositeur-interprète rock",
        photoUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop&crop=faces",
      },
      {
        email: "demo3@vybzzz.com",
        name: "Sophie Chen",
        artistName: "Sophie Chen",
        bio: "Pianiste et chanteuse de jazz",
        photoUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop&crop=faces",
      },
    ]
    
    for (const artistData of demoArtists) {
      const user = await prisma.user.create({
        data: {
          email: artistData.email,
          name: artistData.name,
          passwordHash: hashedPassword,
          role: "ARTIST",
          artist: {
            create: {
              artistName: artistData.artistName,
              bio: artistData.bio,
              photoUrl: artistData.photoUrl,
              level: "STARTER",
              trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: {
          artist: true,
        },
      })
      artists.push(user.artist!)
      console.log(`✅ Artiste créé: ${artistData.artistName}`)
    }
  }
  
  // Images de couverture pour les concerts
  const concertCovers = [
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&h=800&fit=crop",
  ]
  
  // Créer des concerts de démonstration
  const demoConcerts = [
    {
      title: "Concert Live - Luna Star",
      slug: "concert-live-luna-star",
      coverUrl: concertCovers[0],
      description: "Un concert exceptionnel en streaming HD",
      pricePhysical: 50,
      priceEticket: 20,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
      duration: 120,
      status: "PUBLISHED" as const,
    },
    {
      title: "Rock Night - Alex Rivers",
      slug: "rock-night-alex-rivers",
      coverUrl: concertCovers[1],
      description: "Une soirée rock inoubliable",
      pricePhysical: 45,
      priceEticket: 18,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
      duration: 90,
      status: "PUBLISHED" as const,
    },
    {
      title: "Jazz Session - Sophie Chen",
      slug: "jazz-session-sophie-chen",
      coverUrl: concertCovers[2],
      description: "Une session jazz intimiste",
      pricePhysical: 40,
      priceEticket: 15,
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Dans 21 jours
      duration: 60,
      status: "PUBLISHED" as const,
    },
    {
      title: "Pop Festival - Luna Star",
      slug: "pop-festival-luna-star",
      coverUrl: concertCovers[3],
      description: "Festival pop avec plusieurs artistes",
      pricePhysical: 60,
      priceEticket: 25,
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
      duration: 180,
      status: "PUBLISHED" as const,
    },
  ]
  
  console.log(`\n🎵 Création de ${demoConcerts.length} concert(s)...\n`)
  
  for (let i = 0; i < demoConcerts.length; i++) {
    const concertData = demoConcerts[i]
    const artist = artists[i % artists.length]
    
    const concert = await prisma.concert.create({
      data: {
        ...concertData,
        artistId: artist.id,
      },
    })
    
    console.log(`✅ Concert créé: ${concert.title} (${artist.artistName})`)
  }
  
  console.log(`\n🎉 ${demoConcerts.length} concert(s) créé(s) avec succès !`)
  console.log(`\n🌐 Rafraîchissez la page d'accueil pour voir les concerts avec leurs images.`)
  
  await prisma.$disconnect()
}

createDemoConcerts()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })

