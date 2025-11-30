require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

console.log('DATABASE_URL from env:', process.env.DATABASE_URL)

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function main() {
  try {
    console.log('Attempting to connect to database...')
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')

    const userCount = await prisma.user.count()
    console.log(`User count: ${userCount}`)

  } catch (error) {
    console.error('❌ Database connection error:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
