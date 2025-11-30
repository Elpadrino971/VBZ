-- Script pour activer Row Level Security (RLS) sur toutes les tables
-- À exécuter dans Supabase SQL Editor
-- 
-- IMPORTANT: Cette application utilise Prisma avec une connexion directe (service_role)
-- Les politiques RLS permettent l'accès au service_role pour toutes les opérations backend
-- et protègent contre les accès non autorisés depuis l'API Supabase publique

-- Activer RLS sur toutes les tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Artist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Concert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConcertLike" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserCredit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConcertContent" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITIQUES POUR LA TABLE User
-- ============================================

-- Permettre toutes les opérations pour le service_role (Prisma backend)
-- Bloquer l'accès depuis l'API Supabase publique pour protéger les données sensibles
CREATE POLICY "Service role has full access to users"
ON "User" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- POLITIQUES POUR LA TABLE Artist
-- ============================================

-- Permettre la lecture publique des artistes (pour l'affichage)
CREATE POLICY "Anyone can view artists"
ON "Artist" FOR SELECT
USING (true);

-- Permettre toutes les opérations pour le service_role (Prisma backend)
CREATE POLICY "Service role has full access to artists"
ON "Artist" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- POLITIQUES POUR LA TABLE Concert
-- ============================================

-- Permettre la lecture publique des concerts publiés
CREATE POLICY "Anyone can view published concerts"
ON "Concert" FOR SELECT
USING (status = 'PUBLISHED' OR status = 'LIVE' OR status = 'ENDED' OR auth.role() = 'service_role');

-- Permettre toutes les opérations pour le service_role (Prisma backend)
CREATE POLICY "Service role has full access to concerts"
ON "Concert" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- POLITIQUES POUR LA TABLE Ticket
-- ============================================

-- Permettre toutes les opérations pour le service_role (Prisma backend)
-- Bloquer l'accès depuis l'API Supabase publique (données sensibles)
CREATE POLICY "Service role has full access to tickets"
ON "Ticket" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- POLITIQUES POUR LA TABLE Payout
-- ============================================

-- Permettre toutes les opérations pour le service_role (Prisma backend)
-- Bloquer l'accès depuis l'API Supabase publique (données financières sensibles)
CREATE POLICY "Service role has full access to payouts"
ON "Payout" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- POLITIQUES POUR LA TABLE ConcertLike
-- ============================================

-- Permettre la lecture publique des likes
CREATE POLICY "Anyone can view likes"
ON "ConcertLike" FOR SELECT
USING (true);

-- Permettre toutes les opérations pour le service_role (Prisma backend)
CREATE POLICY "Service role has full access to likes"
ON "ConcertLike" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- POLITIQUES POUR LA TABLE Comment
-- ============================================

-- Permettre la lecture publique des commentaires
CREATE POLICY "Anyone can view comments"
ON "Comment" FOR SELECT
USING (true);

-- Permettre toutes les opérations pour le service_role (Prisma backend)
CREATE POLICY "Service role has full access to comments"
ON "Comment" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- POLITIQUES POUR LA TABLE Tip
-- ============================================

-- Permettre toutes les opérations pour le service_role (Prisma backend)
-- Bloquer l'accès depuis l'API Supabase publique (données financières sensibles)
CREATE POLICY "Service role has full access to tips"
ON "Tip" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- POLITIQUES POUR LA TABLE UserCredit
-- ============================================

-- Permettre toutes les opérations pour le service_role (Prisma backend)
-- Bloquer l'accès depuis l'API Supabase publique (données financières sensibles)
CREATE POLICY "Service role has full access to user credits"
ON "UserCredit" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- POLITIQUES POUR LA TABLE ConcertContent
-- ============================================

-- Permettre la lecture publique du contenu des concerts (fiches qualitatives)
CREATE POLICY "Anyone can view concert content"
ON "ConcertContent" FOR SELECT
USING (true);

-- Permettre toutes les opérations pour le service_role (Prisma backend)
CREATE POLICY "Service role has full access to concert content"
ON "ConcertContent" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

