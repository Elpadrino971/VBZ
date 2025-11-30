# 🚀 Guide de Déploiement VYbzzZ - AUJOURD'HUI

## ⏱️ Temps total: **10-15 minutes**

---

## ✅ **Étape 1: Préparer la Base de Données Supabase** (5 min)

### 1.1 Exécuter le Script SQL

1. **Ouvrez Supabase Dashboard**
   - https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez SQL Editor**
   - Menu gauche > SQL Editor
   - Cliquez "New query"

3. **Copiez le script SQL**
   - Ouvrez le fichier `prisma/manual-migration.sql`
   - Copiez **TOUT le contenu** (Ctrl+A, Ctrl+C)

4. **Collez et exécutez**
   - Collez dans l'éditeur SQL
   - Cliquez **"Run"** (ou Ctrl+Enter)
   - ✅ Vous devriez voir: **"Success. No rows returned"**

5. **Vérifiez les tables**
   - Menu gauche > Table Editor
   - Vous devriez voir: User, Artist, Concert, Ticket, Payout, Tip, etc.

✅ **Base de données prête!**

---

## 🌐 **Étape 2: Déployer sur Vercel** (5 min)

### 2.1 Pusher le Code

```bash
git add -A
git commit -m "Ready for production deployment"
git push origin claude/concert-streaming-platform-016GBjGFnakC5resobPtSwKs
```

### 2.2 Créer le Projet Vercel

1. **Allez sur Vercel**
   - https://vercel.com/new

2. **Importez le Repository**
   - Connectez votre compte GitHub si ce n'est pas fait
   - Cherchez "VBZ" ou "Elpadrino971/VBZ"
   - Cliquez **"Import"**

3. **Configurez le Projet**
   - **Project Name**: `vybzzz-platform` (ou votre choix)
   - **Framework Preset**: Next.js (détecté automatiquement)
   - **Root Directory**: `.` (par défaut)
   - **Build Command**: `npm run build` (par défaut)

### 2.3 Ajouter les Variables d'Environnement

Cliquez sur **"Environment Variables"** et ajoutez **UNE PAR UNE**:

```bash
# DATABASE
DATABASE_URL=postgresql://postgres:SAHiCnSD-6P%21hTJ@db.ffdsvnesjkfdrjxdbmmq.supabase.co:5432/postgres

# NEXTAUTH (⚠️ CHANGEZ l'URL après le déploiement)
NEXTAUTH_SECRET=dHxE+rjbYGezetJeOfmGn3y9bycT+ZFKVxzh//mtrW4=
NEXTAUTH_URL=https://vybzzz-platform.vercel.app
NEXT_PUBLIC_APP_URL=https://vybzzz-platform.vercel.app

# STRIPE (⚠️ Copiez depuis votre fichier .env local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# MUX (⚠️ Copiez depuis votre fichier .env local)
MUX_TOKEN_ID=xxxxx
MUX_TOKEN_SECRET=xxxxx
MUX_WEBHOOK_SECRET=xxxxx

# UPSTASH REDIS (⚠️ Copiez depuis votre fichier .env local)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# RESEND (⚠️ Copiez depuis votre fichier .env local)
RESEND_API_KEY=re_xxxxx

# OPENAI (⚠️ Copiez depuis votre fichier .env local)
OPENAI_API_KEY=sk-proj-xxxxx

# SENTRY (⚠️ Copiez depuis votre fichier .env local)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.us.sentry.io/xxxxx
```

**⚠️ IMPORTANT**: Pour `NEXTAUTH_URL` et `NEXT_PUBLIC_APP_URL`:
- Mettez temporairement: `https://vybzzz-platform.vercel.app`
- Après le déploiement, vous aurez l'URL exacte de Vercel
- Vous devrez la mettre à jour

### 2.4 Déployer

1. Cliquez **"Deploy"**
2. ⏱️ Attendez 2-3 minutes (compilation)
3. ✅ **Déploiement réussi!**

---

## 🔧 **Étape 3: Configuration Post-Déploiement** (3 min)

### 3.1 Mettre à Jour les URLs

1. **Copiez votre URL Vercel**
   - Exemple: `https://vybzzz-platform-abc123.vercel.app`

2. **Allez dans Settings > Environment Variables**
   - Modifiez `NEXTAUTH_URL` avec votre vraie URL
   - Modifiez `NEXT_PUBLIC_APP_URL` avec votre vraie URL
   - Cliquez "Save"

3. **Redéployez**
   - Allez sur Deployments
   - Cliquez "Redeploy" sur le dernier déploiement

### 3.2 Configurer le Webhook Stripe

1. **Allez sur Stripe Dashboard**
   - https://dashboard.stripe.com/test/webhooks

2. **Créez un Endpoint**
   - Cliquez "Add endpoint"
   - URL: `https://votre-url-vercel.app/api/webhooks/stripe`
   - Events: Sélectionnez:
     - `checkout.session.completed`
     - `account.updated`
     - `payment_intent.succeeded`

3. **Copiez le Signing Secret**
   - Cliquez sur votre endpoint
   - Copiez le "Signing secret" (commence par `whsec_`)
   - Retournez sur Vercel > Settings > Environment Variables
   - Mettez à jour `STRIPE_WEBHOOK_SECRET` avec la nouvelle valeur
   - Redéployez

### 3.3 Réactiver le Middleware

Votre middleware d'authentification est désactivé. Pour le réactiver:

1. Ouvrez `middleware.ts`
2. Décommentez le code original
3. Commentez la version temporaire
4. Commit et push:

```bash
git add middleware.ts
git commit -m "Re-enable authentication middleware"
git push
```

Vercel redéploiera automatiquement.

---

## ✅ **Étape 4: Tester l'Application** (2 min)

### 4.1 Tester la Homepage

Ouvrez: `https://votre-url-vercel.app`

✅ Vous devriez voir la page d'accueil VYbzzZ

### 4.2 Tester l'Image Open Graph

Ouvrez: `https://votre-url-vercel.app/api/og?type=concert&title=Test+Concert&artist=Artiste&date=Aujourd'hui&price=20`

✅ Vous devriez voir l'image générée automatiquement!

### 4.3 Créer un Compte

1. Allez sur `/auth/signup`
2. Créez un compte
3. ✅ Vous devriez recevoir un email (si Resend est configuré)

### 4.4 Devenir Artiste

1. Allez sur `/dashboard`
2. Créez votre profil artiste
3. Créez un concert de test

### 4.5 Tester un Achat

1. Achetez un e-ticket
2. Utilisez la carte de test Stripe: `4242 4242 4242 4242`
3. Date: n'importe quelle date future
4. CVC: 123
5. ✅ Vous devriez recevoir un ticket avec QR code!

---

## 🎯 **Checklist Complète**

Avant de dire "C'EST EN PROD":

- [ ] Base de données créée sur Supabase (script SQL exécuté)
- [ ] Déployé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] URLs mises à jour (NEXTAUTH_URL, NEXT_PUBLIC_APP_URL)
- [ ] Webhook Stripe configuré
- [ ] Middleware réactivé
- [ ] Homepage accessible
- [ ] API Open Graph fonctionne
- [ ] Signup/Login fonctionne
- [ ] Création de profil artiste OK
- [ ] Création de concert OK
- [ ] Achat de ticket OK (avec Stripe test)
- [ ] QR code généré
- [ ] Email de confirmation reçu (si Resend configuré)

---

## 🚨 **Problèmes Courants**

### Erreur "Prisma Client not found"

**Solution**: Vérifiez que `DATABASE_URL` est bien configurée dans Vercel

### Erreur d'authentification

**Solution**: Vérifiez `NEXTAUTH_SECRET` et `NEXTAUTH_URL`

### Paiement ne fonctionne pas

**Solution**:
1. Vérifiez `STRIPE_SECRET_KEY` et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. Configurez le webhook Stripe avec la bonne URL

### Images OG ne s'affichent pas

**Solution**:
1. Vérifiez `NEXT_PUBLIC_APP_URL` (sans / à la fin)
2. Testez `/api/og` directement

---

## 📊 **Monitoring Post-Déploiement**

### Vercel Dashboard

- **Déploiements**: Vérifiez les builds
- **Analytics**: Suivez le trafic
- **Logs**: Debuggez les erreurs

### Supabase Dashboard

- **Database**: Vérifiez les données
- **Auth**: Suivez les utilisateurs
- **Logs**: Debuggez les requêtes

### Stripe Dashboard

- **Payments**: Suivez les paiements
- **Customers**: Gérez les clients
- **Events**: Debuggez les webhooks

---

## 🎉 **VOUS ÊTES EN PROD!**

Votre plateforme VYbzzZ est maintenant live! 🚀

**Prochaines étapes:**

1. **Testez tout en profondeur**
2. **Invitez des beta testeurs**
3. **Configurez un nom de domaine custom** (optionnel)
4. **Activez les services en production**:
   - Stripe: Passez en mode Live
   - Mux: Passez en production
   - Resend: Vérifiez votre domaine email

5. **Marketing:**
   - Partagez sur les réseaux sociaux
   - Invitez les premiers artistes
   - Testez le partage des concerts (Open Graph!)

---

## 🆘 **Besoin d'Aide?**

Si vous rencontrez un problème:

1. **Vérifiez les logs Vercel**: Dashboard > Deployments > Logs
2. **Vérifiez Supabase**: Dashboard > Database > Tables
3. **Testez les webhooks Stripe**: Dashboard > Webhooks > Events

**Bonne chance! Votre plateforme va cartonner! 🎸🎤🚀**
