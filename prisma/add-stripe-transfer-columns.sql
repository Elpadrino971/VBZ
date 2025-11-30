-- Script pour ajouter les colonnes manquantes pour Stripe Connect Transfer
-- À exécuter dans Supabase SQL Editor si npx prisma db push ne fonctionne pas
-- 
-- Ce script ajoute les colonnes stripeTransferId et completedAt à la table Payout

-- Ajouter la colonne stripeTransferId (ID du transfer Stripe vers le compte Connect)
ALTER TABLE "Payout" ADD COLUMN IF NOT EXISTS "stripeTransferId" TEXT;

-- Ajouter la colonne completedAt (Date de complétion du transfert)
ALTER TABLE "Payout" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Payout' 
AND column_name IN ('stripeTransferId', 'completedAt');

