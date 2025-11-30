import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration Prisma avec gestion d'erreur robuste et connection pooling
const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// Connection pooling pour la production (Vercel)
if (process.env.NODE_ENV === 'production') {
  // En production, utiliser le pooler Supabase (port 6543)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('pgbouncer=true')) {
    console.warn('⚠️  DATABASE_URL devrait utiliser le pooler Supabase (port 6543) en production')
  }
}

// Ne pas connecter automatiquement au démarrage
// La connexion se fera à la première requête
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}

export const prisma = prismaClient
