# 🔧 Configuration Prisma pour Vercel

## ⚠️ Problème : Prisma n'est pas accessible depuis Vercel

## ✅ Solutions

### 1. **Vérifier la variable DATABASE_URL sur Vercel**

La `DATABASE_URL` doit utiliser le **Session Pooler** de Supabase (port 6543) :

```bash
DATABASE_URL=postgresql://postgres.ffdsvnesjkfdrjxdbmmq:SAHiCnSD-6P%21hTJ@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Format important :**
- ✅ Port **6543** (Session Pooler)
- ✅ Hostname : `aws-0-us-west-2.pooler.supabase.com` (ou votre région)
- ✅ Paramètre `pgbouncer=true`
- ✅ Username : `postgres.ffdsvnesjkfdrjxdbmmq` (avec le project ID)

### 2. **Ajouter le script postinstall**

Le script `postinstall` dans `package.json` génère automatiquement le client Prisma après l'installation des dépendances sur Vercel.

### 3. **Vérifier les restrictions IP sur Supabase**

1. Allez sur **Supabase Dashboard** > **Settings** > **Database**
2. Vérifiez **Connection Pooling** > **Allowed IPs**
3. Ajoutez les IPs de Vercel si nécessaire (ou autorisez toutes les IPs pour le pooler)

### 4. **Tester la connexion**

```bash
# Localement avec la même URL que Vercel
DATABASE_URL="postgresql://postgres.ffdsvnesjkfdrjxdbmmq:SAHiCnSD-6P%21hTJ@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true" npx prisma db pull
```

## 🔍 Vérifications sur Vercel

1. **Variables d'environnement** :
   - `DATABASE_URL` est définie
   - Utilise le port 6543 (pooler)
   - Contient `pgbouncer=true`

2. **Build logs** :
   - Vérifier que `prisma generate` s'exécute
   - Vérifier qu'il n'y a pas d'erreur de connexion

3. **Runtime logs** :
   - Vérifier les erreurs `P1001` (Can't reach database server)
   - Vérifier les erreurs de timeout

## 📋 Checklist Vercel

- [ ] `DATABASE_URL` configurée avec le pooler (port 6543)
- [ ] `pgbouncer=true` dans l'URL
- [ ] Username avec project ID (`postgres.ffdsvnesjkfdrjxdbmmq`)
- [ ] Password URL-encodée (`%21` pour `!`)
- [ ] Script `postinstall` dans package.json
- [ ] Build réussit avec `prisma generate`
- [ ] Pas d'erreur `P1001` dans les logs runtime
