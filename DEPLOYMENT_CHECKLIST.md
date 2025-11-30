# 🚀 Checklist de Déploiement VYbzzZ

## 🎉 V1 COMPLÈTE - Toutes les fonctionnalités sont implémentées !

### ✅ Fonctionnalités V1 Implémentées
- ✅ **Stripe Connect** - Onboarding artistes avec compte bancaire
- ✅ **Système de crédits** - Wallet utilisateur pour éviter la sortie de l'application
- ✅ **API ChatGPT** - Génération automatique de fiches qualitatives sous les concerts (✅ clé configurée)
- ✅ **Emails Resend** - 4 types d'emails (confirmation compte, reset password, tickets, fin concert)
- ✅ **Rate Limiting** - Protection des routes critiques avec Upstash Redis
- ✅ **Sentry** - Monitoring d'erreurs configuré
- ✅ **Pages légales** - 4 pages complètes (CGU, politique, mentions, support)
- ✅ **Optimisations homepage** - Max-width ajusté pour meilleure concentration

## ✅ Tests Effectués

### 1. Build de Production
- ✅ Build Next.js réussi (avec warnings mineurs)
- ⚠️ Warnings à corriger :
  - Apostrophes non échappées dans plusieurs fichiers
  - Utilisation de `<img>` au lieu de `<Image>` de Next.js
  - Import `SunOff` corrigé (remplacé par `Moon`)

### 2. Variables d'Environnement Requises

#### Base de données
- `DATABASE_URL` - URL PostgreSQL (Supabase)

#### NextAuth
- `NEXTAUTH_URL` - URL de l'application (ex: `https://vybzzz.com`)
- `NEXTAUTH_SECRET` - Secret généré avec `openssl rand -base64 32`

#### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Clé publique Stripe
- `STRIPE_SECRET_KEY` - Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret du webhook Stripe

#### Mux
- `MUX_TOKEN_ID` - Token ID Mux
- `MUX_TOKEN_SECRET` - Token Secret Mux
- `MUX_WEBHOOK_SECRET` - Secret du webhook Mux (optionnel)

#### Application
- `NEXT_PUBLIC_APP_URL` - URL publique de l'application

#### OpenAI (✅ Configuré)
- `OPENAI_API_KEY` - Clé API OpenAI pour génération de contenu ChatGPT

#### Resend (Recommandé)
- `RESEND_API_KEY` - Clé API Resend pour l'envoi d'emails

#### Upstash Redis (Optionnel - pour rate limiting)
- `UPSTASH_REDIS_REST_URL` - URL REST Redis
- `UPSTASH_REDIS_REST_TOKEN` - Token REST Redis

#### Sentry (Optionnel - pour monitoring)
- `NEXT_PUBLIC_SENTRY_DSN` - DSN Sentry pour tracking d'erreurs

### 3. Configuration Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer le schéma à la base de données
npx prisma db push

# (Optionnel) Seed la base de données
npm run prisma:seed
```

### 4. Webhooks à Configurer

#### Stripe Webhook
- URL: `https://votre-domaine.com/api/webhooks/stripe`
- Événements:
  - `checkout.session.completed`
- Secret: Copier dans `STRIPE_WEBHOOK_SECRET`

#### Mux Webhook (Optionnel)
- URL: `https://votre-domaine.com/api/mux/webhook`
- Secret: Configurer dans `MUX_WEBHOOK_SECRET`

### 5. Configuration Next.js

Le fichier `next.config.ts` est déjà configuré avec :
- Images distantes autorisées (Unsplash)
- Configuration pour production

### 6. Sécurité

- ✅ `.env` dans `.gitignore`
- ✅ Middleware d'authentification configuré
- ✅ Validation Zod sur les routes API
- ✅ Vérification des signatures webhook (Stripe, Mux)

## 🔧 Corrections à Appliquer Avant Déploiement

### 1. Erreurs de Build (Critique)

#### Apostrophes non échappées
Fichiers à corriger :
- `app/page.tsx` (lignes 208, 341, 413, 595)
- `app/dashboard/concerts/new/page.tsx` (lignes 313, 327, 643)
- `app/dashboard/payouts/page.tsx` (ligne 151)
- `app/concerts/[slug]/page.tsx` (ligne 124)

**Solution:** Remplacer `'` par `&apos;` ou utiliser des guillemets doubles.

#### Utilisation de `<img>` au lieu de `<Image>`
Fichiers concernés :
- `app/page.tsx`
- `app/concerts/[slug]/page.tsx`
- `app/dashboard/concerts/new/page.tsx`

**Solution:** Importer `Image` de `next/image` et remplacer les balises `<img>`.

### 2. Warnings (Non-bloquant)

- ⚠️ `bcryptjs` et `Prisma` utilisent des APIs Node.js non supportées dans Edge Runtime
  - **Impact:** Les routes API utilisant `auth.ts` ne peuvent pas utiliser Edge Runtime
  - **Solution:** Garder le runtime Node.js par défaut (déjà le cas)

- ⚠️ Hook `useEffect` avec dépendance manquante dans `app/dashboard/concerts/[id]/page.tsx`
  - **Solution:** Ajouter `fetchConcert` aux dépendances ou utiliser `useCallback`

## 📋 Checklist Pré-Déploiement

### Base de données
- [ ] Base de données PostgreSQL créée (Supabase recommandé)
- [ ] `DATABASE_URL` configurée dans les variables d'environnement
- [ ] Migration Prisma appliquée (`npx prisma db push`)
- [ ] Client Prisma généré (`npx prisma generate`)

### Stripe
- [ ] Compte Stripe créé
- [ ] Clés API configurées (mode test puis production)
- [ ] Webhook configuré avec l'URL de production
- [ ] `STRIPE_WEBHOOK_SECRET` configuré

### Mux
- [ ] Compte Mux créé
- [ ] Tokens API configurés
- [ ] Webhook configuré (optionnel)

### NextAuth
- [ ] `NEXTAUTH_URL` configuré avec l'URL de production
- [ ] `NEXTAUTH_SECRET` généré et configuré

### Application
- [ ] `NEXT_PUBLIC_APP_URL` configuré
- [ ] Build de production réussi (`npm run build`)
- [ ] Tests fonctionnels effectués

### Sécurité
- [ ] Variables d'environnement sécurisées (pas dans le code)
- [ ] HTTPS activé
- [ ] CORS configuré si nécessaire

## 🚀 Déploiement Recommandé

### Vercel (Recommandé pour Next.js)

1. **Connecter le repository**
   ```bash
   vercel
   ```

2. **Configurer les variables d'environnement**
   - Dans le dashboard Vercel : Settings → Environment Variables
   - Ajouter toutes les variables listées ci-dessus

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Post-deploy**
   ```bash
   # Dans Vercel, ajouter une commande post-deploy
   npx prisma generate
   npx prisma db push
   ```

### Alternative: Autres plateformes

- **Netlify:** Configuration similaire à Vercel
- **Railway:** Support PostgreSQL natif
- **Render:** Bonne intégration avec PostgreSQL

## 📊 Monitoring Recommandé

### À Ajouter Après Déploiement

1. **Sentry** - Gestion des erreurs
   ```bash
   npm install @sentry/nextjs
   ```

2. **Vercel Analytics** - Analytics de performance
   ```bash
   npm install @vercel/analytics
   ```

3. **Logs** - Monitoring des webhooks Stripe/Mux

## 🔍 Tests Post-Déploiement

- [ ] Page d'accueil accessible
- [ ] Authentification fonctionnelle
- [ ] Création de compte utilisateur
- [ ] Création de compte artiste
- [ ] Création de concert
- [ ] Achat de ticket (mode test Stripe)
- [ ] Webhook Stripe fonctionnel
- [ ] Streaming Mux fonctionnel
- [ ] Dashboard artiste accessible
- [ ] Page de visualisation de concert

## 🐛 Problèmes Connus

1. **Edge Runtime Warnings**
   - Les routes API utilisant `bcryptjs` ne peuvent pas utiliser Edge Runtime
   - **Status:** Non-bloquant, fonctionne avec Node.js runtime

2. **Images non optimisées**
   - Utilisation de `<img>` au lieu de `<Image>` Next.js
   - **Impact:** Performance légèrement réduite
   - **Priorité:** Moyenne

## 📝 Notes Importantes

- Le port par défaut est `3001` (modifiable dans `package.json`)
- Les webhooks Stripe doivent être configurés avec l'URL de production
- Le système de payout nécessite que les concerts soient marqués comme `ENDED` pour créer les payouts
- Les extensions de streaming sont disponibles 7 jours après la fin du concert

## 🎯 Améliorations Futures Recommandées

1. ~~**Rate Limiting**~~ ✅ **FAIT**
   - Rate limiting implémenté avec `@upstash/ratelimit`
   - Protection sur auth, checkout, création concert, tips

2. ~~**Email Notifications**~~ ✅ **FAIT**
   - Emails Resend implémentés (confirmation compte, reset password, tickets, fin concert)

3. **Image Upload**
   - Intégrer Cloudinary ou S3 pour l'upload d'images
   - Actuellement seulement les URLs sont supportées

4. ~~**Monitoring**~~ ✅ **FAIT**
   - Sentry configuré pour le tracking d'erreurs
   - Prêt à l'usage (nécessite `NEXT_PUBLIC_SENTRY_DSN`)

5. **Tests**
   - Ajouter des tests unitaires et d'intégration
   - Tests E2E avec Playwright ou Cypress

6. **Performance**
   - Optimiser les images avec Next.js Image
   - Ajouter du caching pour les données fréquentes

7. **SEO**
   - Ajouter des meta tags dynamiques
   - Sitemap et robots.txt

8. **Accessibilité**
   - Audit d'accessibilité (WCAG)
   - Améliorer le contraste et la navigation au clavier

