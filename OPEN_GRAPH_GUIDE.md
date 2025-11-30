# 🖼️ Open Graph - Guide d'Utilisation

Open Graph est maintenant configuré sur votre plateforme VYbzzZ! Vos concerts auront de belles previews sur les réseaux sociaux.

## ✅ Ce qui est déjà fait

### 1️⃣ **Meta Tags Globaux** (`app/layout.tsx`)
- ✅ Title, description, keywords
- ✅ Open Graph pour la page d'accueil
- ✅ Twitter Cards
- ✅ SEO optimisé (robots, sitemap)

### 2️⃣ **API d'Images Dynamiques** (`app/api/og/route.tsx`)
- ✅ Génère automatiquement des images 1200x630px
- ✅ 3 types d'images: `concert`, `artist`, `home`
- ✅ Design au couleurs VYbzzZ (noir + #FFC42E)

### 3️⃣ **Helpers de Metadata** (`lib/metadata.ts`)
- ✅ `generateConcertMetadata()` - Pour les pages de concerts
- ✅ `generateArtistMetadata()` - Pour les profils artistes
- ✅ `generateWatchMetadata()` - Pour le player live

---

## 📝 Comment Utiliser

### Pour une Page de Concert

Dans votre fichier `app/concerts/[slug]/page.tsx`:

```typescript
import { generateConcertMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const concert = await prisma.concert.findUnique({
    where: { slug: params.slug },
    include: { artist: true },
  })

  if (!concert) return {}

  return generateConcertMetadata(concert)
}
```

### Pour une Page Artiste

Dans votre fichier `app/artists/[id]/page.tsx`:

```typescript
import { generateArtistMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const artist = await prisma.artist.findUnique({
    where: { id: params.id },
    include: { _count: { select: { concerts: true } } },
  })

  if (!artist) return {}

  return generateArtistMetadata(artist)
}
```

### Pour le Player Live

Dans votre fichier `app/watch/[slug]/page.tsx`:

```typescript
import { generateWatchMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const concert = await prisma.concert.findUnique({
    where: { slug: params.slug },
    include: { artist: true },
  })

  if (!concert) return {}

  return generateWatchMetadata(concert)
}
```

---

## 🎨 Images OG Dynamiques

### URL de l'API

```
/api/og?type=concert&title=Mon+Concert&artist=DJ+Snake&date=15+Janvier+2025&price=15
```

### Paramètres

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `type` | Type d'image: `concert`, `artist`, `home` | `concert` |
| `title` | Titre du concert | `Live+Festival` |
| `artist` | Nom de l'artiste | `DJ+Snake` |
| `date` | Date du concert | `15+Janvier+2025` |
| `price` | Prix du e-ticket | `15` |

### Exemples

#### Concert
```
/api/og?type=concert&title=Pop+Festival&artist=David+Guetta&date=20+Décembre+2024&price=25
```

#### Artiste
```
/api/og?type=artist&artist=Martin+Garrix
```

#### Page d'accueil
```
/api/og?type=home&title=VYbzzZ
```

---

## 🧪 Comment Tester

### 1️⃣ **Facebook Debugger**
https://developers.facebook.com/tools/debug/

Entrez votre URL de concert et cliquez "Fetch new information"

### 2️⃣ **Twitter Card Validator**
https://cards-dev.twitter.com/validator

Entrez votre URL et vérifiez la preview

### 3️⃣ **LinkedIn Post Inspector**
https://www.linkedin.com/post-inspector/

Testez comment ça apparaît sur LinkedIn

### 4️⃣ **Preview Locale**

Ouvrez votre navigateur et allez sur:
```
http://localhost:3001/api/og?type=concert&title=Test&artist=Artiste&date=Aujourd'hui&price=20
```

Vous devriez voir l'image générée!

---

## 📱 Résultats Attendus

### Sur Facebook/Instagram
```
┌─────────────────────────────────┐
│ [Image 1200x630 auto-générée]  │
│                                 │
│ Concert Title - Artist Name     │
│ Description du concert...       │
│ 🎫 vybzzz.com                  │
└─────────────────────────────────┘
```

### Sur Twitter
```
┌─────────────────────────────────┐
│ [Image 1200x630 auto-générée]  │
│                                 │
│ Concert Title - Artist Name     │
│ Description du concert...       │
│ 📍 vybzzz.com                  │
└─────────────────────────────────┘
```

### Sur WhatsApp
```
┌───────────────────────────┐
│ [Miniature de l'image]    │
│ Concert Title - Artist    │
│ vybzzz.com                │
└───────────────────────────┘
```

---

## 🚀 Prochaines Étapes

### Image par Défaut

Créez un fichier `public/og-image.jpg` (1200x630px) avec votre logo/design VYbzzZ.

Vous pouvez utiliser:
- [Canva](https://www.canva.com/) - Template "Facebook Post"
- [Figma](https://www.figma.com/) - Dimensions 1200x630px
- [Photoshop](https://www.adobe.com/photoshop) - Créez votre design

### Personnalisation Avancée

Modifiez `app/api/og/route.tsx` pour:
- Ajouter votre logo
- Changer les couleurs
- Ajouter des effets visuels
- Utiliser des polices custom

### Vérification Google

Une fois déployé sur Vercel, ajoutez votre code de vérification Google dans `app/layout.tsx`:

```typescript
verification: {
  google: 'votre-code-ici',
},
```

---

## 💡 Astuces

### 1. URLs Publiques Uniquement

Les images OG ne fonctionnent que sur des URLs publiques. En local (localhost), seul vous pouvez les voir.

### 2. Cache Facebook

Facebook met en cache les images pendant 7 jours. Pour forcer un refresh:
- Utilisez le Facebook Debugger
- Cliquez "Scrape Again"

### 3. Taille Optimale

- **Minimum**: 600x315px
- **Recommandé**: 1200x630px (ratio 1.91:1)
- **Poids**: < 8MB
- **Format**: JPG ou PNG

### 4. Twitter Player Cards

Pour les concerts live, Twitter affichera un bouton "Play" qui ouvre directement le player!

---

## 🎯 Exemples de Partages

### Artiste partage son concert
```
🎸 Mon nouveau concert est maintenant disponible en streaming!
Rejoignez-moi ce soir à 20h 🔥

[Belle carte avec image du concert]

🎫 E-tickets à partir de 15€
📺 Streaming en direct

👉 vybzzz.com/concerts/mon-concert
```

### Fan partage à ses amis
```
Trop hâte pour ce concert! 🤩
[Preview du concert avec tous les détails]

vybzzz.com/concerts/mon-concert
```

---

## ✅ Checklist de Déploiement

Avant de déployer en production:

- [ ] Créer `public/og-image.jpg` (image par défaut)
- [ ] Tester toutes les URLs avec Facebook Debugger
- [ ] Vérifier les images sur mobile (WhatsApp, Messages)
- [ ] Ajouter le code de vérification Google
- [ ] Mettre à jour `NEXT_PUBLIC_APP_URL` dans `.env`
- [ ] Tester le partage sur tous les réseaux sociaux

---

**🎉 Félicitations! Vos concerts auront maintenant de superbes previews sur les réseaux sociaux!**

Les artistes vont adorer partager leurs concerts! 🎸🎤
