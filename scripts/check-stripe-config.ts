import Stripe from "stripe"

async function checkStripeConfig() {
  console.log("🔍 Vérification de la configuration Stripe...\n")
  
  const secretKey = process.env.STRIPE_SECRET_KEY
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  
  if (!secretKey) {
    console.error("❌ STRIPE_SECRET_KEY n'est pas définie dans .env")
    return
  }
  
  if (!publishableKey) {
    console.error("❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY n'est pas définie dans .env")
    return
  }
  
  console.log("✅ Variables d'environnement trouvées")
  console.log(`   Secret Key: ${secretKey.substring(0, 12)}...`)
  console.log(`   Publishable Key: ${publishableKey.substring(0, 12)}...`)
  
  // Vérifier le format
  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    console.error("\n❌ Format de clé invalide !")
    console.error("   La Secret Key doit commencer par 'sk_test_' (mode test) ou 'sk_live_' (mode production)")
    return
  }
  
  if (!publishableKey.startsWith("pk_test_") && !publishableKey.startsWith("pk_live_")) {
    console.error("\n❌ Format de clé invalide !")
    console.error("   La Publishable Key doit commencer par 'pk_test_' (mode test) ou 'pk_live_' (mode production)")
    return
  }
  
  const isTestMode = secretKey.startsWith("sk_test_")
  console.log(`\n📊 Mode: ${isTestMode ? "TEST" : "PRODUCTION"}`)
  
  // Tester la connexion à Stripe
  try {
    console.log("\n🔄 Test de connexion à Stripe...")
    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia",
    })
    
    // Faire une requête simple pour vérifier la clé
    const account = await stripe.accounts.retrieve()
    console.log("✅ Connexion réussie !")
    console.log(`   Compte Stripe: ${account.id}`)
    console.log(`   Pays: ${account.country}`)
    
  } catch (error: any) {
    console.error("\n❌ Erreur de connexion à Stripe:")
    if (error.message) {
      console.error(`   ${error.message}`)
    }
    if (error.message?.includes("Invalid API Key")) {
      console.error("\n💡 Solution:")
      console.error("   1. Allez sur https://dashboard.stripe.com/test/apikeys")
      console.error("   2. Assurez-vous que le mode TEST est activé")
      console.error("   3. Régénérez votre Secret Key si nécessaire")
      console.error("   4. Copiez la nouvelle clé dans votre fichier .env")
      console.error("   5. Redémarrez le serveur (npm run dev)")
    }
  }
}

checkStripeConfig()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })

