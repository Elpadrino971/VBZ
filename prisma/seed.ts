import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Début du seed de la base de données...")

  // Nettoyer les données existantes (optionnel - commentez si vous voulez garder les données)
  console.log("🧹 Nettoyage des anciennes données...")
  await prisma.ticket.deleteMany()
  await prisma.concert.deleteMany()
  await prisma.payout.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.user.deleteMany()

  // Créer des utilisateurs artistes
  const hashedPassword = await bcrypt.hash("password123", 10)

  const artistsData = [
    {
      email: "luna@vybzzz.com",
      name: "Luna Martinez",
      artistName: "Luna",
      bio: "Chanteuse pop indépendante, spécialisée dans les ballades émotionnelles et les mélodies entraînantes. Découvrez son univers musical unique.",
      photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      level: "PREMIUM" as const,
    },
    {
      email: "djmax@vybzzz.com",
      name: "Max Dubois",
      artistName: "DJ Max",
      bio: "DJ et producteur électronique, créateur de sets énergiques qui font danser. Spécialiste de la house et de la techno.",
      photoUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
      level: "INTERMEDIATE" as const,
    },
    {
      email: "soulband@vybzzz.com",
      name: "Soul Collective",
      artistName: "Soul Collective",
      bio: "Groupe de soul et R&B moderne, composé de 5 musiciens talentueux. Leur musique transporte et émeut.",
      photoUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
      level: "STARTER" as const,
    },
    {
      email: "rockstar@vybzzz.com",
      name: "Alex Rivers",
      artistName: "Alex Rivers",
      bio: "Auteur-compositeur-interprète rock alternatif. Des textes percutants et des mélodies puissantes.",
      photoUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop",
      level: "PREMIUM" as const,
    },
    {
      email: "jazzy@vybzzz.com",
      name: "Sophie Chen",
      artistName: "Sophie Chen",
      bio: "Pianiste et chanteuse de jazz, elle revisite les classiques avec une touche moderne et personnelle.",
      photoUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop",
      level: "INTERMEDIATE" as const,
    },
  ]

  console.log("👤 Création des artistes...")
  const artists = []

  for (const artistData of artistsData) {
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
            level: artistData.level,
            trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
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

  // Créer des concerts
  console.log("🎵 Création des concerts...")

  const concertsData = [
    {
      artistIndex: 0, // Luna
      title: "Luna - Concert Intime",
      description: "Un concert acoustique exceptionnel où Luna interprétera ses plus belles compositions dans une ambiance intimiste. Venez découvrir ses nouvelles chansons en avant-première.",
      pricePhysical: 45,
      priceEticket: 18,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
      duration: 90,
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop",
      status: "PUBLISHED" as const,
    },
    {
      artistIndex: 0, // Luna
      title: "Luna - Live Session",
      description: "Session live exclusive avec Luna. Questions-réponses avec l'artiste et interprétation de ses hits.",
      pricePhysical: 35,
      priceEticket: 12,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
      duration: 60,
      coverUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=600&fit=crop",
      status: "PUBLISHED" as const,
    },
    {
      artistIndex: 1, // DJ Max
      title: "DJ Max - Set Électro",
      description: "Un set électro énergique de 2h avec DJ Max. Préparez-vous à danser toute la nuit sur ses meilleurs mixes et ses nouvelles productions.",
      pricePhysical: 50,
      priceEticket: 20,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
      duration: 120,
      coverUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop",
      status: "PUBLISHED" as const,
    },
    {
      artistIndex: 1, // DJ Max
      title: "DJ Max - After Hours",
      description: "Session après-midi avec DJ Max. Mix exclusif house et techno, avec des invités surprises.",
      pricePhysical: 40,
      priceEticket: 15,
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Dans 21 jours
      duration: 90,
      coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=600&fit=crop",
      status: "PUBLISHED" as const,
    },
    {
      artistIndex: 2, // Soul Collective
      title: "Soul Collective - Soirée Soul",
      description: "Une soirée inoubliable avec Soul Collective. Leur répertoire de soul et R&B moderne vous fera voyager. Ambiance chaleureuse garantie.",
      pricePhysical: 55,
      priceEticket: 22,
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Dans 10 jours
      duration: 105,
      coverUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=600&fit=crop",
      status: "PUBLISHED" as const,
    },
    {
      artistIndex: 3, // Alex Rivers
      title: "Alex Rivers - Rock Session",
      description: "Concert rock alternatif avec Alex Rivers. Des riffs puissants, des textes percutants, une énergie débordante. Ne manquez pas ce show !",
      pricePhysical: 48,
      priceEticket: 19,
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // Dans 12 jours
      duration: 95,
      coverUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&h=600&fit=crop",
      status: "PUBLISHED" as const,
    },
    {
      artistIndex: 3, // Alex Rivers
      title: "Alex Rivers - Unplugged",
      description: "Version acoustique de ses plus grands titres. Une expérience intimiste et émotionnelle avec Alex Rivers.",
      pricePhysical: 42,
      priceEticket: 16,
      date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // Dans 18 jours
      duration: 75,
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop",
      status: "PUBLISHED" as const,
    },
    {
      artistIndex: 4, // Sophie Chen
      title: "Sophie Chen - Jazz Night",
      description: "Une soirée jazz élégante avec Sophie Chen au piano. Revisitez les classiques du jazz avec une interprétation moderne et raffinée.",
      pricePhysical: 60,
      priceEticket: 25,
      date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // Dans 9 jours
      duration: 90,
      coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&h=600&fit=crop",
      status: "PUBLISHED" as const,
    },
    {
      artistIndex: 4, // Sophie Chen
      title: "Sophie Chen - Duo Intime",
      description: "Concert en duo avec un contrebassiste invité. Des arrangements minimalistes qui mettent en valeur la voix et le piano de Sophie.",
      pricePhysical: 50,
      priceEticket: 20,
      date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // Dans 16 jours
      duration: 80,
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop",
      status: "PUBLISHED" as const,
    },
    {
      artistIndex: 0, // Luna
      title: "Luna - Concert de Noël",
      description: "Concert spécial de fin d'année avec Luna. Ambiance festive et chaleureuse, avec des reprises de chansons de Noël revisitées.",
      pricePhysical: 55,
      priceEticket: 22,
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
      duration: 100,
      coverUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&h=600&fit=crop",
      status: "PUBLISHED" as const,
    },
  ]

  for (const concertData of concertsData) {
    const artist = artists[concertData.artistIndex]
    const slug = concertData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now()

    await prisma.concert.create({
      data: {
        artistId: artist.id,
        title: concertData.title,
        slug,
        description: concertData.description,
        pricePhysical: concertData.pricePhysical,
        priceEticket: concertData.priceEticket,
        date: concertData.date,
        duration: concertData.duration,
        coverUrl: concertData.coverUrl,
        status: concertData.status,
      },
    })
    console.log(`✅ Concert créé: ${concertData.title}`)
  }

  // Créer un utilisateur test (non-artiste)
  console.log("👤 Création d'un utilisateur test...")
  await prisma.user.create({
    data: {
      email: "user@vybzzz.com",
      name: "Test User",
      passwordHash: hashedPassword,
      role: "USER",
    },
  })
  console.log("✅ Utilisateur test créé: user@vybzzz.com")

  console.log("\n🎉 Seed terminé avec succès!")
  console.log("\n📋 Comptes créés:")
  console.log("   Artistes:")
  artistsData.forEach((a) => {
    console.log(`   - ${a.email} (mot de passe: password123)`)
  })
  console.log("   Utilisateur:")
  console.log("   - user@vybzzz.com (mot de passe: password123)")
  console.log(`\n🎵 ${concertsData.length} concerts créés`)
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


