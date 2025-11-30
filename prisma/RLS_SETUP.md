# 🔒 Configuration Row Level Security (RLS) pour Supabase

Ce guide explique comment activer RLS sur toutes les tables pour résoudre les alertes de sécurité Supabase.

## ⚠️ Problème

Supabase Security Advisor signale que RLS n'est pas activé sur les tables publiques, ce qui représente un risque de sécurité si quelqu'un accède directement à votre base de données via l'API Supabase.

## ✅ Solution

Le script `enable-rls.sql` active RLS sur toutes les tables avec des politiques appropriées pour votre application.

### Comment ça fonctionne

- **Service Role (Prisma Backend)** : Accès complet à toutes les tables pour votre application Next.js
- **API Publique Supabase** : Accès limité uniquement aux données publiques (concerts publiés, artistes, likes, commentaires)
- **Données sensibles** : Bloquées pour l'API publique (users, tickets, payouts, tips)

## 📋 Instructions

### 1. Ouvrir Supabase SQL Editor

1. Allez sur [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (dans le menu de gauche)

### 2. Exécuter le script

1. Ouvrez le fichier `prisma/enable-rls.sql`
2. Copiez tout le contenu
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** (ou appuyez sur `Cmd+Enter` / `Ctrl+Enter`)

### 3. Vérifier que ça fonctionne

1. Allez dans **Advisors** → **Security Advisor**
2. Les 8 erreurs devraient disparaître
3. Vous devriez voir "0 errors"

## 🔍 Détails des politiques

### Tables avec accès public en lecture seule
- **Artist** : Tous peuvent voir les artistes
- **Concert** : Tous peuvent voir les concerts publiés (PUBLISHED, LIVE, ENDED)
- **ConcertLike** : Tous peuvent voir les likes
- **Comment** : Tous peuvent voir les commentaires

### Tables protégées (service_role uniquement)
- **User** : Données utilisateurs sensibles
- **Ticket** : Informations d'achat privées
- **Payout** : Données financières sensibles
- **Tip** : Données financières sensibles

## ⚙️ Compatibilité avec Prisma

Ces politiques sont compatibles avec votre configuration actuelle :
- ✅ Prisma utilise le `service_role` qui a accès complet
- ✅ Votre application Next.js continue de fonctionner normalement
- ✅ Les données sensibles sont protégées contre les accès non autorisés

## 🧪 Tester après activation

Après avoir exécuté le script, testez votre application :

```bash
npm run dev
```

Vérifiez que :
- ✅ Les concerts s'affichent correctement
- ✅ L'authentification fonctionne
- ✅ Les achats de tickets fonctionnent
- ✅ Le dashboard artiste fonctionne

Si vous rencontrez des problèmes, vérifiez que votre `DATABASE_URL` utilise bien la connexion avec le service_role (c'est le cas par défaut avec Prisma).

## 🔄 Désactiver RLS (si nécessaire)

Si vous devez désactiver RLS temporairement (non recommandé) :

```sql
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Artist" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Concert" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Payout" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ConcertLike" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Tip" DISABLE ROW LEVEL SECURITY;
```

## 📚 Ressources

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma avec Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase)

