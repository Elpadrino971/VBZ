# Guide de Configuration Supabase

## Problème Identifié

Le projet Supabase utilise **IPv6 uniquement**, ce qui bloque les connexions directes PostgreSQL depuis un réseau IPv4. C'est pourquoi `prisma db push` ne fonctionne pas.

## Solution : Configuration en 2 Étapes

### Étape 1 : Configuration du .env ✅ (FAIT)

Le fichier `.env` est configuré avec l'URL du **Session Pooler** (port 6543) :
```
DATABASE_URL="postgresql://postgres.ffdsvnesjkfdrjxdbmmq:SAHiCnSD-6P%21hTJ@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Cette URL fonctionne pour l'**application en production**, mais **pas pour les migrations** (`prisma db push`).

### Étape 2 : Créer le Schéma dans Supabase

Vous avez **2 options** :

#### Option A : Utiliser Supabase CLI (RECOMMANDÉ)

1. **Ouvrir un terminal** dans le dossier du projet
2. **Se connecter** :
   ```bash
   supabase login
   ```
   → Cela ouvrira votre navigateur pour l'authentification

3. **Lier le projet** :
   ```bash
   supabase link --project-ref ffdsvnesjkfdrjxdbmmq
   ```

4. **Créer le schéma** :
   ```bash
   supabase db push
   ```
   → Cela créera toutes les tables dans Supabase

#### Option B : Utiliser SQL Editor (ALTERNATIVE)

1. **Aller dans Supabase Dashboard** → **SQL Editor**
2. **Exécuter les scripts SQL existants** dans cet ordre :
   - `prisma/enable-rls.sql` (active RLS sur toutes les tables)
   - `prisma/fix-rls-security.sql` (configure les politiques RLS)
   - `prisma/add-stripe-transfer-columns.sql` (ajoute les colonnes Stripe)

3. **Créer les tables manuellement** en copiant le schéma Prisma dans SQL Editor

## Vérification

Une fois le schéma créé, vous pouvez vérifier :

1. **Dans Supabase Dashboard** → **Tables** → Vérifier que toutes les tables sont créées
2. **Dans votre application** → L'application devrait fonctionner avec le pooler

## Notes Importantes

- ✅ **Client Prisma généré** : Le client Prisma est déjà généré et prêt à l'emploi
- ✅ **Pooler activé** : Le Session Pooler est activé dans Supabase
- ⚠️ **Migrations futures** : Utilisez Supabase CLI ou SQL Editor pour les migrations, pas `prisma db push`

## Support

Si vous rencontrez des problèmes :
1. Vérifier que le Session Pooler est activé dans Supabase Dashboard
2. Vérifier qu'il n'y a pas de restrictions IP
3. Utiliser Supabase CLI pour contourner les problèmes réseau

