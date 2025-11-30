import { ArtistLevel } from "@prisma/client"

/**
 * Calcule la date de déblocage d'un payout selon les règles VYbzzZ
 * 
 * Règles :
 * - Premier paiement : 14 jours après la fin du concert (Stripe Connect)
 * - Paiements suivants : 7 jours après la fin du concert (sécurité)
 * - Premium (70/30) : 3 jours après la fin du concert (déblocage accéléré)
 */
export function calculatePayoutReleaseDate(
  concertEndDate: Date,
  artistLevel: ArtistLevel,
  isFirstPayout: boolean
): { releaseDate: Date; daysUntilRelease: number } {
  const endDate = new Date(concertEndDate)
  
  let daysToAdd: number

  if (isFirstPayout) {
    // Premier paiement : 14 jours (règle Stripe Connect)
    daysToAdd = 14
  } else if (artistLevel === "PREMIUM") {
    // Premium : déblocage accéléré J+3
    daysToAdd = 3
  } else {
    // Standard : 7 jours après la fin du concert
    daysToAdd = 7
  }

  const releaseDate = new Date(endDate)
  releaseDate.setDate(releaseDate.getDate() + daysToAdd)

  return {
    releaseDate,
    daysUntilRelease: daysToAdd,
  }
}

/**
 * Vérifie si un payout peut être débloqué maintenant
 */
export function canReleasePayout(releaseDate: Date): boolean {
  const now = new Date()
  return now >= releaseDate
}

/**
 * Calcule le nombre de jours restants jusqu'au déblocage
 */
export function daysUntilRelease(releaseDate: Date): number {
  const now = new Date()
  const diff = releaseDate.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
}

