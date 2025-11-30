# 🚀 Guide de Configuration Upstash Redis

## 📋 Pourquoi Upstash Redis ?

Upstash Redis est utilisé pour le **rate limiting** (protection contre les abus) :
- Limite les tentatives de connexion (5/min)
- Limite les achats (10/min)
- Limite la création de concerts (3/heure)
- Limite les tips (10/min)

## 🔗 Étape 1 : Créer un compte Upstash

1. Allez sur [https://upstash.com](https://upstash.com)
2. Cliquez sur **"Sign Up"** (gratuit)
3. Connectez-vous avec **GitHub** ou **email**

## 🔗 Étape 2 : Créer une base de données Redis

1. Dans le dashboard, cliquez sur **"Create Database"**
2. **Type** : Choisissez **"Regional"** (plus simple pour commencer)
3. **Primary Region** : Choisissez **`eu-west-1`** (Europe de l'Ouest - Irlande)
   - ✅ Recommandé pour la France/Europe
   - ✅ Faible latence pour vos utilisateurs
   - ✅ Compatible avec Vercel Europe
4. Nommez-la `vybzzz-rate-limiting` (ou autre nom de votre choix)
5. Sélectionnez **"Free"** plan (10 000 requêtes/jour gratuites)
6. Cliquez sur **"Create"**

> 💡 **Note** : Si vous choisissez "Global", Upstash gérera automatiquement la réplication multi-régions, mais "Regional" avec `eu-west-1` est parfait pour commencer.

## 🔗 Étape 3 : Récupérer les clés API

1. Cliquez sur votre base de données créée
2. Allez dans l'onglet **"REST API"**
3. Vous verrez deux valeurs importantes :
   - **UPSTASH_REDIS_REST_URL** : URL de l'API REST
   - **UPSTASH_REDIS_REST_TOKEN** : Token d'authentification

## 📝 Format des clés

Les clés ressemblent à ceci :
```
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=Axxxxxxx...
```

## ✅ Après avoir obtenu les clés

Une fois que vous avez les deux clés, elles seront automatiquement ajoutées dans votre fichier `.env` et le rate limiting sera activé.

## 💰 Coûts

- **Plan gratuit** : 10 000 requêtes/jour
- **Payant** : À partir de 0,20$/100k requêtes
- Pour une V1, le plan gratuit est largement suffisant

## 🔒 Sécurité

- Les clés sont stockées dans `.env` (non commitées dans Git)
- Le rate limiting protège contre :
  - Attaques par force brute
  - Spam et bots
  - Abus de ressources

## 🎯 Alternative

Si vous ne souhaitez pas utiliser Upstash maintenant :
- L'application fonctionne sans (mode développement)
- Vous pouvez l'ajouter plus tard avant le déploiement en production
- Le code gère automatiquement l'absence d'Upstash (fallback)

