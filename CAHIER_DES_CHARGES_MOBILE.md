# 📱 VYbzzZ Mobile - Cahier des Charges Simplifié

## 🎯 Vision

**Application mobile de streaming de concerts live** permettant de regarder des concerts en direct depuis n'importe où dans le monde via smartphone.

---

## 🎨 Design & Identité

### Couleurs
- **Primaire**: Noir (#000000) & Rouge Netflix (#E50914)
- **Secondaire**: Blanc Doré (#FFF8DC) / Or Clair (#FFD700)
- **Accents**: Gris foncé (#1A1A1A) pour les cards

### Style
- ✅ Inspiré de Netflix (moderne, épuré)
- ✅ Dark mode par défaut
- ✅ Animations fluides
- ✅ Interface tactile optimisée
- ✅ Logo: VYbzzZ 🐝 (abeille)

---

## 👥 Utilisateurs

### 1. **Spectateurs** (Utilisateurs finaux)
- Découvrir des concerts live
- Acheter des billets (e-tickets ou physiques)
- Regarder en streaming
- Gérer leurs billets

### 2. **Artistes** (Dashboard Pro)
- Créer des concerts
- Streamer en direct
- Suivre les ventes
- Recevoir les paiements (70% des revenus)

---

## 🎵 Fonctionnalités Principales

### 📱 **Application Spectateur**

#### 1. **Page d'Accueil** (/home)
```
┌─────────────────────────────┐
│ 🐝 VYbzzZ                   │
│ Concerts & Live Streaming   │
├─────────────────────────────┤
│ [Tous] [Jazz] [Rap] [Pop]   │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ [Image Concert]       │   │
│ │ Concert Test - Artist │   │
│ │ 📅 5 déc 2025 • 20:00 │   │
│ │ À partir de 10€       │   │
│ │ [Voir] →              │   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │
│ │ 🔴 LIVE STREAMING     │   │
│ │ [Image Concert]       │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

**Features:**
- ✅ Liste des concerts disponibles
- ✅ Filtres par genre musical (Tous, Jazz, Rap, Pop, Rock, Electro)
- ✅ Badge "🔴 LIVE" pour concerts en cours
- ✅ Scroll infini
- ✅ Pull to refresh

#### 2. **Page Concert** (/concert/:id)
```
┌─────────────────────────────┐
│ ← Retour                    │
│                             │
│ [Grande Image Concert]      │
│                             │
│ Concert Test                │
│ par Artiste Test           │
│                             │
│ 📅 5 décembre 2025          │
│ ⏰ 20:00                    │
│ ⏱️ Durée: 2h               │
│                             │
│ Description du concert...   │
│                             │
│ 💳 E-TICKET: 10€            │
│ [Acheter E-ticket]          │
│                             │
│ 🎫 PHYSIQUE: 15€            │
│ [Acheter Ticket Physique]   │
└─────────────────────────────┘
```

**Features:**
- ✅ Détails du concert
- ✅ Choix entre e-ticket et physique
- ✅ Paiement Stripe
- ✅ Partage (réseaux sociaux)

#### 3. **Lecteur Live** (/watch/:id)
```
┌─────────────────────────────┐
│ [Lecteur Vidéo Mux]         │
│ ▶️ Lecture en cours          │
│                             │
│ [Contrôles tactiles]        │
│ Play/Pause | Volume | Full  │
│                             │
│ 💬 Chat Live                │
│ User1: Super concert! 🔥    │
│ User2: J'adore ❤️          │
│ [Envoyer un message...]     │
│                             │
│ 💸 [Donner un pourboire]    │
└─────────────────────────────┘
```

**Features:**
- ✅ Player vidéo Mux (streaming HLS)
- ✅ Contrôles tactiles (play, pause, fullscreen)
- ✅ Chat en temps réel
- ✅ Système de tips/pourboires
- ✅ Compteur de spectateurs
- ✅ Mode portrait & paysage

#### 4. **Mes Billets** (/tickets)
```
┌─────────────────────────────┐
│ Mes Billets                 │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ Concert Test          │   │
│ │ 5 déc 2025 • 20:00    │   │
│ │                       │   │
│ │ [QR Code]             │   │
│ │                       │   │
│ │ E-TICKET • 10€        │   │
│ │ [Télécharger PDF]     │   │
│ └───────────────────────┘   │
│                             │
│ Historique:                 │
│ • Concert 1 - Terminé       │
│ • Concert 2 - Terminé       │
└─────────────────────────────┘
```

**Features:**
- ✅ Liste des billets actifs
- ✅ QR codes pour validation
- ✅ Téléchargement PDF
- ✅ Historique des concerts vus

#### 5. **Profil** (/profile)
```
┌─────────────────────────────┐
│ 👤 Mon Profil               │
├─────────────────────────────┤
│ Jean Dupont                 │
│ jean@email.com              │
│                             │
│ Mes Informations            │
│ Mes Paiements               │
│ Historique                  │
│ Notifications               │
│ FAQ                         │
│ Support                     │
│ Déconnexion                 │
└─────────────────────────────┘
```

---

### 🎸 **Dashboard Artiste**

#### 1. **Tableau de Bord**
```
┌─────────────────────────────┐
│ 🎤 Dashboard Artiste        │
├─────────────────────────────┤
│ Bienvenue, [Nom Artiste]    │
│                             │
│ 📊 Statistiques             │
│ • Revenus: 1,250€           │
│ • Billets vendus: 125       │
│ • Spectateurs live: 78      │
│                             │
│ [Créer un Concert]          │
│ [Streamer Maintenant]       │
│                             │
│ Mes Concerts:               │
│ • Concert 1 - À venir       │
│ • Concert 2 - En cours 🔴   │
│ • Concert 3 - Terminé       │
└─────────────────────────────┘
```

#### 2. **Créer un Concert**
```
┌─────────────────────────────┐
│ Nouveau Concert             │
├─────────────────────────────┤
│ Titre:                      │
│ [___________________]       │
│                             │
│ Description:                │
│ [___________________]       │
│                             │
│ Date & Heure:               │
│ [📅 Choisir]               │
│                             │
│ Durée: [2h]                 │
│                             │
│ Genre: [Pop ▼]              │
│                             │
│ Image: [📸 Ajouter]         │
│                             │
│ Prix E-ticket: [10€]        │
│ Prix Physique: [15€]        │
│                             │
│ [Publier le Concert]        │
└─────────────────────────────┘
```

#### 3. **Streaming Live**
```
┌─────────────────────────────┐
│ 🔴 LIVE • 78 spectateurs    │
├─────────────────────────────┤
│ [Aperçu Caméra]             │
│                             │
│ [Démarrer le Stream]        │
│ [Terminer le Stream]        │
│                             │
│ 💬 Chat:                    │
│ Fan1: Super! 🔥             │
│ Fan2: Incroyable ❤️        │
│                             │
│ 💰 Tips reçus: 45€          │
└─────────────────────────────┘
```

#### 4. **Revenus & Paiements**
```
┌─────────────────────────────┐
│ 💰 Mes Revenus              │
├─────────────────────────────┤
│ Revenus totaux: 1,250€      │
│ Part artiste (70%): 875€    │
│ Plateforme (30%): 375€      │
│                             │
│ À venir (J+21):             │
│ • Concert 1: 250€           │
│ • Concert 2: 180€           │
│                             │
│ Historique:                 │
│ • Novembre: 450€ ✅         │
│ • Octobre: 320€ ✅          │
│                             │
│ [Connecter Stripe]          │
└─────────────────────────────┘
```

---

## 🔧 Stack Technique

### Frontend (Mobile App)
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **State Management**: React Context / Zustand
- **UI Library**: React Native Paper / NativeBase
- **Animations**: React Native Reanimated

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Streaming**: Mux Video API
- **Paiements**: Stripe Mobile SDK
- **Storage**: Supabase Storage (images)
- **Real-time**: Supabase Realtime (chat)
- **AI**: OpenAI API (génération descriptions)

### APIs Externes
- **Stripe**: Paiements e-tickets & physiques
- **Mux**: Streaming vidéo live HLS
- **Supabase**: Base de données & auth
- **OpenAI**: Génération contenu (optionnel)

---

## 💰 Modèle Économique

### Répartition des Revenus
```
Prix du billet: 10€
├─ Artiste: 7€ (70%)
└─ Plateforme: 3€ (30%)
```

### Types de Billets
1. **E-ticket**: 10€ (streaming uniquement)
2. **Ticket Physique**: 15€ (streaming + entrée physique)

### Délai de Paiement
- **J+21** après le concert (sécurité fraude)
- Paiement automatique via Stripe Connect

### Autres Revenus
- **Tips/Pourboires**: 100% pour l'artiste
- **Extensions streaming**: 5€/jour supplémentaire

---

## 🔒 Sécurité

### Authentication
- ✅ Email + Mot de passe (hashé avec bcrypt)
- ✅ Vérification email obligatoire
- ✅ Tokens JWT sécurisés
- ✅ Refresh tokens

### Paiements
- ✅ Stripe PCI-DSS compliant
- ✅ Pas de stockage de cartes
- ✅ 3D Secure pour transactions > 30€
- ✅ Webhooks signés

### Streaming
- ✅ Tokens signés pour vidéos Mux
- ✅ Vérification ticket avant lecture
- ✅ DRM optionnel
- ✅ Rate limiting

### Données
- ✅ Chiffrement en transit (HTTPS)
- ✅ Chiffrement au repos (Supabase)
- ✅ RGPD compliant
- ✅ Logs sécurisés

---

## 📱 Navigation

```
App.tsx
├─ Auth Stack (Non connecté)
│  ├─ Splash Screen
│  ├─ Login
│  └─ Signup
│
├─ User Stack (Spectateur connecté)
│  ├─ Main Tabs
│  │  ├─ Home (Concerts)
│  │  ├─ Tickets (Mes Billets)
│  │  └─ Profile
│  │
│  ├─ Concert Details
│  ├─ Watch Player
│  ├─ Checkout (Stripe)
│  └─ Ticket QR Code
│
└─ Artist Stack (Artiste connecté)
   ├─ Dashboard
   ├─ Create Concert
   ├─ Stream Setup
   ├─ Analytics
   └─ Payouts
```

---

## 📋 Screens Détaillés

### Écrans Spectateur (8 screens)
1. ✅ **Splash Screen** - Logo animé
2. ✅ **Login/Signup** - Auth
3. ✅ **Home** - Liste concerts
4. ✅ **Concert Details** - Infos + Achat
5. ✅ **Checkout** - Paiement Stripe
6. ✅ **My Tickets** - QR codes
7. ✅ **Watch Player** - Streaming live
8. ✅ **Profile** - Paramètres

### Écrans Artiste (7 screens)
1. ✅ **Dashboard** - Stats
2. ✅ **Create Concert** - Formulaire
3. ✅ **Concert Management** - Édition
4. ✅ **Stream Setup** - Configuration Mux
5. ✅ **Live Streaming** - Contrôles
6. ✅ **Analytics** - Statistiques
7. ✅ **Payouts** - Revenus

### Écrans Communs (3 screens)
1. ✅ **FAQ** - Questions fréquentes
2. ✅ **Support** - Contact
3. ✅ **Settings** - Préférences

---

## 🎨 Composants Principaux

### 1. **ConcertCard**
```jsx
<ConcertCard
  title="Concert Test"
  artist="Artiste Test"
  date="5 décembre 2025"
  time="20:00"
  price={10}
  image="url"
  isLive={false}
  onPress={() => navigate('Concert', {id})}
/>
```

### 2. **VideoPlayer**
```jsx
<VideoPlayer
  playbackId="mux-playback-id"
  concertId="concert-id"
  onTip={(amount) => handleTip(amount)}
/>
```

### 3. **TicketQRCode**
```jsx
<TicketQRCode
  qrCode="TICKET-UUID"
  concert={concert}
  onDownload={() => downloadPDF()}
/>
```

### 4. **ChatMessage**
```jsx
<ChatMessage
  userId="user-id"
  userName="Jean"
  message="Super concert! 🔥"
  timestamp={Date.now()}
/>
```

---

## 🚀 Phases de Développement

### **Phase 1: MVP (4-6 semaines)**
1. ✅ Setup projet React Native (Expo)
2. ✅ Authentication (Supabase)
3. ✅ Liste concerts (Home)
4. ✅ Détails concert
5. ✅ Paiement Stripe
6. ✅ Player vidéo Mux
7. ✅ QR codes tickets

### **Phase 2: Features Avancées (2-3 semaines)**
1. ✅ Dashboard artiste
2. ✅ Création de concerts
3. ✅ Chat en temps réel
4. ✅ Système de tips
5. ✅ Analytics

### **Phase 3: Polish & Déploiement (1-2 semaines)**
1. ✅ Tests complets
2. ✅ Animations & transitions
3. ✅ Optimisation performances
4. ✅ App Store submission
5. ✅ Google Play submission

**Total: 7-11 semaines**

---

## 📊 Modèle de Données

### User
```typescript
{
  id: string
  email: string
  name: string
  role: 'USER' | 'ARTIST'
  createdAt: Date
}
```

### Artist
```typescript
{
  id: string
  userId: string
  artistName: string
  bio: string
  photoUrl: string
  stripeAccountId: string
}
```

### Concert
```typescript
{
  id: string
  artistId: string
  title: string
  description: string
  date: Date
  duration: number
  genre: string
  coverUrl: string
  priceEticket: number
  pricePhysical: number
  muxPlaybackId: string
  status: 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'ENDED'
}
```

### Ticket
```typescript
{
  id: string
  concertId: string
  userId: string
  type: 'ETICKET' | 'PHYSICAL'
  qrCode: string
  pricePaid: number
  purchaseDate: Date
}
```

---

## 🎯 KPIs à Suivre

### Utilisateurs
- ✅ Inscriptions /jour
- ✅ Taux d'activation (email vérifié)
- ✅ Rétention J7, J30

### Concerts
- ✅ Nombre de concerts créés
- ✅ Concerts live simultanés
- ✅ Durée moyenne de visionnage

### Revenus
- ✅ Chiffre d'affaires total
- ✅ Revenus par concert
- ✅ Taux de conversion (visiteur → acheteur)
- ✅ Panier moyen

### Technique
- ✅ Temps de chargement
- ✅ Taux d'erreur streaming
- ✅ Latence chat

---

## ❓ FAQ Intégrée

### Pour les Spectateurs
**Q: Comment acheter un billet?**
→ Sélectionnez un concert, choisissez e-ticket ou physique, payez par carte.

**Q: Puis-je regarder en replay?**
→ Non, uniquement en direct. L'artiste peut activer le replay.

**Q: Comment fonctionne le QR code?**
→ Présentez-le à l'entrée pour les tickets physiques.

### Pour les Artistes
**Q: Quand suis-je payé?**
→ J+21 après le concert via Stripe Connect.

**Q: Quel matériel pour streamer?**
→ Smartphone + bonne connexion internet (4G/5G minimum).

**Q: Quel est mon pourcentage?**
→ 70% des ventes de billets, 100% des tips.

---

## 📝 Livrables

### Développement
- ✅ Code source React Native
- ✅ Documentation technique
- ✅ Guide déploiement
- ✅ Tests unitaires

### Design
- ✅ Maquettes Figma (16 screens)
- ✅ Guide de style (couleurs, typo)
- ✅ Assets (logos, icônes)
- ✅ Animations

### Documentation
- ✅ User Guide (PDF)
- ✅ Artist Guide (PDF)
- ✅ FAQ complète
- ✅ CGU & Politique de confidentialité

---

## 💡 Recommandations

### Priorités Absolues
1. **Qualité streaming** - Mux garantit 99.9% uptime
2. **UX fluide** - Animations 60fps
3. **Sécurité paiements** - Stripe certifié
4. **Support client** - Chat intégré

### Nice to Have (v2)
- Notifications push pour concerts
- Favoris & Playlists
- Profils publics artistes
- Système de reviews
- Apple Pay / Google Pay

---

## 🎉 Conclusion

**Objectif:** Application mobile simple, belle et sécurisée pour regarder des concerts live.

**Timeline:** 7-11 semaines de développement

**Budget estimé:**
- Dev: 20-30k€
- Design: 5-8k€
- Infrastructure: 200-500€/mois

**ROI:** Rentable dès 500 utilisateurs actifs.

---

**VYbzzZ Mobile - L'avenir du concert live!** 🐝🎸🔥
