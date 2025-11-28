# VYbzzZ - Plateforme de Concerts Live & Streaming

Plateforme moderne de concerts en streaming avec billetterie intégrée, système de paiement pour artistes, et modèle freemium.

## 🚀 Stack Technique

- **Framework:** Next.js 15 (App Router)
- **Langage:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **Base de données:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentification:** NextAuth.js v5
- **Paiements:** Stripe Connect
- **Streaming:** YouTube Live (embed)
- **QR Codes:** qrcode.js

## 📋 Fonctionnalités

### Utilisateurs
- ✅ Authentification (email/password)
- ✅ Navigation et découverte de concerts
- ✅ Achat de tickets (physique ou e-ticket) via Stripe
- ✅ Visualisation des concerts live (YouTube embed)
- ✅ Historique des achats avec QR codes
- ✅ Page de visualisation des tickets
- ✅ Accès sécurisé au player live

### Artistes
- ✅ Compte artiste avec essai gratuit 90 jours
- ✅ Dashboard avec statistiques complètes
- ✅ Création et gestion de concerts
- ✅ Système de niveaux (Starter/Intermédiaire/Premium)
- ✅ Suivi de progression vers niveau supérieur
- ✅ Revenus J+21 trackés automatiquement
- ✅ Double tarification avec validation (50-70%)

### Système de Tarification
- **E-tickets:** 50-70% moins cher que les tickets physiques
- **Revenue sharing:**
  - Starter: 50/50
  - Intermédiaire: 60/40
  - Premium: 70/30

## 🛠️ Installation

### Prérequis
- Node.js 18+
- PostgreSQL (ou compte Supabase)
- Compte Stripe (mode test)

### 1. Cloner et installer

\`\`\`bash
git clone <repo-url>
cd VBZ
npm install
\`\`\`

### 2. Configuration Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Récupérer l'URL de connexion PostgreSQL :
   - Aller dans Settings → Database
   - Copier la "Connection string" (mode Direct)
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`

### 3. Variables d'environnement

Créer un fichier `.env` :

\`\`\`env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[GÉNÉRER VIA: openssl rand -base64 32]"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

### 4. Configuration de la base de données

\`\`\`bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la DB
npx prisma db push

# (Optionnel) Ouvrir Prisma Studio
npx prisma studio
\`\`\`

### 5. Lancer le serveur de développement

\`\`\`bash
npm run dev
\`\`\`

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

\`\`\`
VBZ/
├── app/                          # Pages Next.js (App Router)
│   ├── api/                      # API Routes
│   │   ├── auth/                # Authentification (signup, NextAuth)
│   │   ├── concerts/            # CRUD concerts
│   │   ├── checkout/            # Stripe Checkout (eticket/physical)
│   │   └── webhooks/            # Stripe webhooks
│   ├── auth/                    # Pages auth (signin/signup)
│   ├── concerts/                # Pages concerts publiques
│   │   ├── [slug]/             # Détail concert + achat
│   │   └── page.tsx            # Liste concerts
│   ├── dashboard/               # Dashboard artiste
│   │   ├── concerts/new/       # Création concert
│   │   └── page.tsx            # Stats + overview
│   ├── account/                 # Compte utilisateur
│   │   ├── tickets/            # Liste tickets + QR codes
│   │   └── page.tsx            # Overview compte
│   ├── watch/                   # Player YouTube Live
│   │   └── [slug]/             # Lecture concert (protégé)
│   ├── checkout/success/        # Confirmation achat
│   └── page.tsx                 # Page d'accueil
├── components/                  # Composants React
│   ├── ui/                      # Composants UI (Shadcn)
│   ├── navbar.tsx               # Navigation principale
│   └── concert-card.tsx         # Card concert réutilisable
├── lib/                         # Utilitaires
│   ├── auth.ts                  # Config NextAuth
│   ├── prisma.ts                # Client Prisma
│   ├── stripe.ts                # Config Stripe
│   ├── artist-levels.ts         # Logique niveaux artistes
│   └── utils.ts                 # Helpers
├── prisma/                      # Schéma Prisma
│   └── schema.prisma           # Models DB complets
└── types/                       # Types TypeScript
    └── next-auth.d.ts          # Extend NextAuth types
\`\`\`

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Sessions JWT sécurisées
- Routes protégées par middleware
- Validation des données avec Zod
- Paiements sécurisés via Stripe

## 🚧 Roadmap V1.0

- [x] Setup projet & authentification
- [x] Page d'accueil & listing concerts
- [x] Page détail concert avec double tarification
- [x] Dashboard artiste complet
- [x] Création de concerts avec validation
- [x] Intégration Stripe Checkout
- [x] Système de tickets & QR codes
- [x] Player YouTube Live avec contrôle d'accès
- [x] Logique niveaux artistes automatique
- [x] Système J+21 paiements via webhook
- [x] Pages compte utilisateur avec tickets
- [ ] Intégration Stripe Connect (onboarding artiste)
- [ ] Gestion des payouts artistes
- [ ] Système d'upload d'images
- [ ] Page de gestion des concerts (artiste)
- [ ] Notifications email (tickets, confirmations)
- [ ] Analytics avancés artistes

## 📝 Licence

Projet privé - Tous droits réservés

## 🤝 Contact

Pour toute question, contactez l'équipe de développement.
