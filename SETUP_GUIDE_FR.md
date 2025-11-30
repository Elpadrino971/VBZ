# 🚀 Guide de Configuration VYbzzZ

Ce guide vous aidera à configurer et déployer la plateforme VYbzzZ.

## 📦 Ce qui a été construit

### ✅ Fonctionnalités Complètes

**Pour les Utilisateurs:**
- ✅ Inscription et connexion
- ✅ Navigation dans les concerts
- ✅ Achat de tickets (E-ticket -50-70% / Physique)
- ✅ Visualisation des tickets avec QR codes
- ✅ Accès au streaming live YouTube
- ✅ Historique complet des achats

**Pour les Artistes:**
- ✅ Dashboard complet avec statistiques
- ✅ Système de niveaux automatique (Starter/Intermédiaire/Premium)
- ✅ Création de concerts avec double tarification
- ✅ Validation automatique des prix (50-70% de réduction)
- ✅ Suivi des revenus (disponibles + en attente J+21)
- ✅ Essai gratuit 90 jours

**Paiements & Sécurité:**
- ✅ Stripe Checkout intégré
- ✅ Webhook pour traitement automatique
- ✅ Génération QR codes unique par ticket
- ✅ Calcul automatique revenue sharing
- ✅ Système J+21 pour libération des fonds

## ⚙️ Configuration Étape par Étape

### 1. Supabase (Base de données)

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans **Settings** → **Database**                   
4. Copier la **Connection string** (Transaction mode)
5. Remplacer `[YOUR-PASSWORD]` par votre mot de passe
6. Ajouter dans `.env`:
   ```env
   DATABASE_URL="postgresql://postgres.xxx:password@xxx.supabase.co:5432/postgres"
   ```

### 2. Stripe (Paiements)

#### A. Configuration de base

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Activer le **mode test** (toggle en haut à droite)
3. Aller dans **Developers** → **API keys**
4. Copier:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)
5. Ajouter dans `.env`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   ```

#### B. Configuration du Webhook

1. Aller dans **Developers** → **Webhooks**
2. Cliquer **Add endpoint**
3. URL: `https://votre-domaine.com/api/webhooks/stripe`
4. Événements à sélectionner:
   - `checkout.session.completed`
5. Copier le **Signing secret** (whsec_...)
6. Ajouter dans `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

**Pour le développement local:**
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Lancer le webhook en local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. NextAuth (Authentification)

1. Générer une clé secrète:
   ```bash
   openssl rand -base64 32
   ```
2. Ajouter dans `.env`:
   ```env
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="votre-cle-generee"
   ```

### 4. Fichier .env Complet

```env
# Database
DATABASE_URL="postgresql://postgres.xxx:password@xxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-cle-32-caracteres"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🚀 Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Générer le client Prisma
npx prisma generate

# 3. Créer les tables dans Supabase
npx prisma db push

# 4. Lancer le serveur
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🧪 Tester la Plateforme

### Créer un compte artiste

1. Aller sur `/auth/signup`
2. Sélectionner **Type: Artiste**
3. Remplir les informations
4. Se connecter

### Créer un concert

1. Aller sur le dashboard (`/dashboard`)
2. Cliquer **Créer un concert**
3. Remplir:
   - Titre
   - Prix physique: `50.00 €`
   - Prix e-ticket: `15.00 €` (réduction de 70%)
   - Date et heure
4. Publier

### Tester l'achat

1. Se déconnecter
2. Créer un compte **utilisateur**
3. Aller sur le concert créé
4. Acheter un e-ticket
5. Utiliser la carte de test Stripe:
   - Numéro: `4242 4242 4242 4242`
   - Date: n'importe quelle date future
   - CVC: n'importe quel 3 chiffres
6. Valider le paiement
7. Voir le ticket dans `/account/tickets`

### Tester le live streaming

1. En tant qu'artiste, éditer le concert
2. Ajouter une URL YouTube Live
   - Exemple: `https://www.youtube.com/watch?v=jfKfPfyJRdk`
3. En tant qu'utilisateur avec un e-ticket:
   - Aller dans "Mes tickets"
   - Cliquer "Regarder le concert"
   - Le player YouTube s'affiche

## 📊 Fonctionnement du Système

### Niveaux Artistes

| Niveau | Revenue Share | Critères | Abonnement |
|--------|---------------|----------|------------|
| **Starter** | 50/50 | Nouveau | 9,99€/mois après 90j |
| **Intermédiaire** | 60/40 | 100 tickets OU 2000€ | Gratuit |
| **Premium** | 70/30 | 500 tickets OU 10000€ | Gratuit |

### Système J+21

- Les paiements sont bloqués **21 jours**
- Calcul automatique de la part artiste
- Statut: `PENDING` → `AVAILABLE` → `COMPLETED`

### Double Tarification

- **E-ticket**: 50-70% moins cher (recommandé)
- **Physique**: Prix plein
- Validation automatique à la création

## 🚢 Déploiement Vercel

1. Créer un compte sur [vercel.com](https://vercel.com)
2. Connecter votre repository GitHub
3. Ajouter les variables d'environnement (section Settings → Environment Variables)
4. Déployer

⚠️ **Important**: Mettre à jour `NEXTAUTH_URL` et `NEXT_PUBLIC_APP_URL` avec votre domaine Vercel

## 📝 Prochaines Étapes Recommandées

### Priorité Haute
- [ ] **Stripe Connect**: Permettre aux artistes de connecter leur compte bancaire
- [ ] **Upload d'images**: Intégrer un service comme Cloudinary ou AWS S3
- [ ] **Emails**: Envoyer les tickets par email (SendGrid, Resend)

### Priorité Moyenne
- [ ] **Page de gestion concerts**: Éditer/supprimer des concerts
- [ ] **Payout dashboard**: Interface pour retirer les fonds
- [ ] **Analytics**: Graphiques de ventes

### Améliorations Futures
- [ ] **Chat live**: Pendant les concerts
- [ ] **Replay**: Enregistrement des concerts
- [ ] **Notifications push**: Rappels avant concerts
- [ ] **Refund système**: Remboursements

## 🐛 Résolution de Problèmes

### Erreur Prisma
```bash
# Régénérer le client
npx prisma generate

# Reset la DB (⚠️ supprime les données)
npx prisma db push --force-reset
```

### Webhook Stripe ne fonctionne pas
- Vérifier que le webhook secret est correct
- En local, utiliser Stripe CLI
- Vérifier les logs dans Stripe Dashboard → Webhooks

### Erreur d'authentification
- Vérifier que `NEXTAUTH_SECRET` est défini
- Vider les cookies du navigateur
- Redémarrer le serveur

## 📞 Support

Pour toute question technique, consultez:
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation NextAuth](https://next-auth.js.org)

---

**Plateforme développée avec Claude Code**
Version: 1.0.0 | Date: Novembre 2025
