import { prisma } from "./prisma"
import { Decimal } from "@prisma/client/runtime/library"

/**
 * Obtenir le solde de crédits d'un utilisateur
 */
export async function getUserCreditsBalance(userId: string): Promise<number> {
  const credits = await prisma.userCredit.findMany({
    where: {
      userId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  })

  const balance = credits.reduce((sum, credit) => {
    return sum + Number(credit.amount)
  }, 0)

  return balance
}

/**
 * Ajouter des crédits à un utilisateur
 */
export async function addCredits(
  userId: string,
  amount: number,
  source: string,
  description?: string,
  expiresAt?: Date
) {
  return prisma.userCredit.create({
    data: {
      userId,
      amount: new Decimal(amount),
      source,
      description,
      expiresAt,
    },
  })
}

/**
 * Utiliser des crédits (déduire du solde)
 */
export async function useCredits(userId: string, amount: number, description: string) {
  const balance = await getUserCreditsBalance(userId)

  if (balance < amount) {
    throw new Error("Solde de crédits insuffisant")
  }

  // Créer une transaction négative
  return prisma.userCredit.create({
    data: {
      userId,
      amount: new Decimal(-amount),
      source: "PURCHASE",
      description,
    },
  })
}

/**
 * Vérifier si l'utilisateur a assez de crédits
 */
export async function hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
  const balance = await getUserCreditsBalance(userId)
  return balance >= amount
}

