require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

console.log('🔍 Testing Supabase connection...\n')
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function testConnection() {
  try {
    console.log('\n✅ Step 1: Connecting to database...')
    await prisma.$connect()
    console.log('✅ Connected successfully!\n')

    console.log('✅ Step 2: Running test query...')
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`
    console.log('✅ Query result:', result)

    console.log('\n✅ Step 3: Checking tables...')
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('✅ Tables found:', tables.length)
    tables.forEach(t => console.log('  -', t.table_name))

    console.log('\n✅ Step 4: Counting records...')
    const userCount = await prisma.user.count()
    const artistCount = await prisma.artist.count()
    const concertCount = await prisma.concert.count()

    console.log(`✅ Users: ${userCount}`)
    console.log(`✅ Artists: ${artistCount}`)
    console.log(`✅ Concerts: ${concertCount}`)

    console.log('\n🎉 Database connection is working perfectly!\n')

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    if (error.code) console.error('Error code:', error.code)
    console.error('\nFull error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
