import * as fs from "fs"
import * as path from "path"

const envPath = path.join(process.cwd(), ".env")

console.log("🔍 Vérification du fichier .env...\n")

if (!fs.existsSync(envPath)) {
  console.error("❌ Fichier .env non trouvé")
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, "utf-8")
const lines = envContent.split("\n")

console.log("📄 Lignes contenant STRIPE_SECRET_KEY :\n")

lines.forEach((line, index) => {
  if (line.includes("STRIPE_SECRET_KEY")) {
    console.log(`Ligne ${index + 1}:`)
    console.log(`  ${line}`)
    
    const match = line.match(/STRIPE_SECRET_KEY\s*=\s*["']?([^"'\n]+)["']?/)
    if (match) {
      const key = match[1]
      console.log(`\n  Longueur: ${key.length} caractères`)
      console.log(`  Début: ${key.substring(0, 20)}...`)
      
      if (key.length < 50) {
        console.log(`\n  ⚠️  ATTENTION: La clé semble trop courte !`)
        console.log(`     Une vraie clé Stripe fait environ 107 caractères.`)
        console.log(`     Si vous voyez 'sk_test_...' avec des points,`)
        console.log(`     c'est un placeholder qu'il faut remplacer.`)
      } else if (key.startsWith("sk_test_51")) {
        console.log(`\n  ✅ Format correct (clé test valide)`)
      } else if (key.startsWith("sk_test_")) {
        console.log(`\n  ⚠️  Format commence par sk_test_ mais pas sk_test_51`)
        console.log(`     Vérifiez que c'est bien une clé valide.`)
      } else {
        console.log(`\n  ❌ Format invalide - doit commencer par sk_test_ ou sk_live_`)
      }
    }
    console.log("")
  }
})

console.log("\n💡 Pour obtenir une nouvelle clé Stripe :")
console.log("   1. https://dashboard.stripe.com/test/apikeys")
console.log("   2. Mode TEST activé")
console.log("   3. Cliquez sur 'Reveal test key' ou 'Create secret key'")
console.log("   4. Copiez la clé complète (pas juste 'sk_test_...')")

