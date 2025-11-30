-- VYbzzZ Platform Database Schema
-- Generated from Prisma schema for manual migration

-- Drop existing tables if any (in reverse dependency order)
DROP TABLE IF EXISTS "ConcertContent" CASCADE;
DROP TABLE IF EXISTS "UserCredit" CASCADE;
DROP TABLE IF EXISTS "Tip" CASCADE;
DROP TABLE IF EXISTS "Comment" CASCADE;
DROP TABLE IF EXISTS "ConcertLike" CASCADE;
DROP TABLE IF EXISTS "Payout" CASCADE;
DROP TABLE IF EXISTS "Ticket" CASCADE;
DROP TABLE IF EXISTS "Concert" CASCADE;
DROP TABLE IF EXISTS "Artist" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop enums if exist
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "ArtistLevel" CASCADE;
DROP TYPE IF EXISTS "ConcertStatus" CASCADE;
DROP TYPE IF EXISTS "TicketType" CASCADE;
DROP TYPE IF EXISTS "PayoutStatus" CASCADE;
DROP TYPE IF EXISTS "TipStatus" CASCADE;

-- Create Enums
CREATE TYPE "UserRole" AS ENUM ('USER', 'ARTIST', 'ADMIN');
CREATE TYPE "ArtistLevel" AS ENUM ('STARTER', 'INTERMEDIATE', 'PREMIUM');
CREATE TYPE "ConcertStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'LIVE', 'ENDED');
CREATE TYPE "TicketType" AS ENUM ('PHYSICAL', 'ETICKET');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "TipStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Artist table
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "artistName" TEXT NOT NULL,
    "bio" TEXT,
    "photoUrl" TEXT,
    "level" "ArtistLevel" NOT NULL DEFAULT 'STARTER',
    "trialEndDate" TIMESTAMP(3) NOT NULL,
    "ticketsSoldTotal" INTEGER NOT NULL DEFAULT 0,
    "revenueTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "communityLeads" INTEGER NOT NULL DEFAULT 0,
    "stripeAccountId" TEXT UNIQUE,
    "subscriptionId" TEXT UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Concert table
CREATE TABLE "Concert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "coverUrl" TEXT,
    "description" TEXT,
    "pricePhysical" DECIMAL(10,2) NOT NULL,
    "priceEticket" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "muxLiveStreamId" TEXT,
    "muxPlaybackId" TEXT,
    "muxStreamKey" TEXT,
    "promoImageUrl" TEXT,
    "promoVideoUrl" TEXT,
    "promoTitle" TEXT,
    "promoDescription" TEXT,
    "promoCtaText" TEXT,
    "promoCtaUrl" TEXT,
    "artistContentVideoUrl" TEXT,
    "streamingEndDate" TIMESTAMP(3),
    "streamingExtendedUntil" TIMESTAMP(3),
    "extensionPricePerDay" DECIMAL(10,2),
    "status" "ConcertStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE
);

-- Ticket table
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "concertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "qrCode" TEXT NOT NULL UNIQUE,
    "pricePaid" DECIMAL(10,2) NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("concertId") REFERENCES "Concert"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Payout table
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artistId" TEXT NOT NULL,
    "concertId" TEXT,
    "ticketId" TEXT UNIQUE,
    "tipId" TEXT UNIQUE,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "isFirstPayout" BOOLEAN NOT NULL DEFAULT false,
    "daysUntilRelease" INTEGER NOT NULL DEFAULT 7,
    "stripeTransferId" TEXT,
    "paidAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE,
    FOREIGN KEY ("concertId") REFERENCES "Concert"("id") ON DELETE SET NULL,
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL,
    FOREIGN KEY ("tipId") REFERENCES "Tip"("id") ON DELETE SET NULL
);

-- ConcertLike table
CREATE TABLE "ConcertLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "concertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("concertId") REFERENCES "Concert"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE ("concertId", "userId")
);

-- Comment table
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "concertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("concertId") REFERENCES "Concert"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Tip table
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "concertId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "stripePaymentIntentId" TEXT,
    "status" "TipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("concertId") REFERENCES "Concert"("id") ON DELETE CASCADE,
    FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- UserCredit table
CREATE TABLE "UserCredit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ConcertContent table
CREATE TABLE "ConcertContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "concertId" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("concertId") REFERENCES "Concert"("id") ON DELETE CASCADE
);

-- Add Payout foreign key to Tip after Tip table is created
-- (This was referenced before Tip was created, so we do it after)

-- Create Indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "Artist_userId_idx" ON "Artist"("userId");
CREATE INDEX "Artist_level_idx" ON "Artist"("level");
CREATE INDEX "Concert_artistId_idx" ON "Concert"("artistId");
CREATE INDEX "Concert_status_idx" ON "Concert"("status");
CREATE INDEX "Concert_date_idx" ON "Concert"("date");
CREATE INDEX "Concert_slug_idx" ON "Concert"("slug");
CREATE INDEX "Ticket_concertId_idx" ON "Ticket"("concertId");
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");
CREATE INDEX "Ticket_qrCode_idx" ON "Ticket"("qrCode");
CREATE INDEX "Payout_artistId_idx" ON "Payout"("artistId");
CREATE INDEX "Payout_status_idx" ON "Payout"("status");
CREATE INDEX "Payout_releaseDate_idx" ON "Payout"("releaseDate");
CREATE INDEX "ConcertLike_concertId_idx" ON "ConcertLike"("concertId");
CREATE INDEX "ConcertLike_userId_idx" ON "ConcertLike"("userId");
CREATE INDEX "Comment_concertId_idx" ON "Comment"("concertId");
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");
CREATE INDEX "Tip_concertId_idx" ON "Tip"("concertId");
CREATE INDEX "Tip_artistId_idx" ON "Tip"("artistId");
CREATE INDEX "Tip_userId_idx" ON "Tip"("userId");
CREATE INDEX "Tip_status_idx" ON "Tip"("status");
CREATE INDEX "Tip_createdAt_idx" ON "Tip"("createdAt");
CREATE INDEX "UserCredit_userId_idx" ON "UserCredit"("userId");
CREATE INDEX "UserCredit_createdAt_idx" ON "UserCredit"("createdAt");
CREATE INDEX "ConcertContent_concertId_idx" ON "ConcertContent"("concertId");
