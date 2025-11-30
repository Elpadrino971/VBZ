-- Script pour corriger les erreurs de sécurité RLS détectées par Supabase Security Advisor
-- À exécuter dans Supabase SQL Editor
-- 
-- Ce script active RLS et crée les politiques pour :
-- - UserCredit (données financières sensibles)
-- - ConcertContent (contenu généré par ChatGPT)

-- ============================================
-- ACTIVATION RLS SUR LES TABLES MANQUANTES
-- ============================================

ALTER TABLE "UserCredit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConcertContent" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITIQUES POUR LA TABLE UserCredit
-- ============================================

-- Supprimer la politique si elle existe déjà (pour éviter les erreurs)
DROP POLICY IF EXISTS "Service role has full access to user credits" ON "UserCredit";

-- Permettre toutes les opérations pour le service_role (Prisma backend)
-- Bloquer l'accès depuis l'API Supabase publique (données financières sensibles)
CREATE POLICY "Service role has full access to user credits"
ON "UserCredit" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- POLITIQUES POUR LA TABLE ConcertContent
-- ============================================

-- Supprimer les politiques si elles existent déjà (pour éviter les erreurs)
DROP POLICY IF EXISTS "Anyone can view concert content" ON "ConcertContent";
DROP POLICY IF EXISTS "Service role has full access to concert content" ON "ConcertContent";

-- Permettre la lecture publique du contenu des concerts (fiches qualitatives)
CREATE POLICY "Anyone can view concert content"
ON "ConcertContent" FOR SELECT
USING (true);

-- Permettre toutes les opérations pour le service_role (Prisma backend)
CREATE POLICY "Service role has full access to concert content"
ON "ConcertContent" FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

