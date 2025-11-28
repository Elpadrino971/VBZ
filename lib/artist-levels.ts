import { ArtistLevel } from "@prisma/client"

export const ARTIST_LEVELS = {
  STARTER: {
    name: "Starter",
    revenueShare: 0.5, // 50/50
    requirements: {
      ticketsSold: 0,
      revenue: 0,
      communityLeads: 0,
    },
    monthlyFee: 9.99, // Après essai gratuit
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  INTERMEDIATE: {
    name: "Intermédiaire",
    revenueShare: 0.6, // 60/40
    requirements: {
      ticketsSold: 100,
      revenue: 2000,
      communityLeads: 500,
    },
    monthlyFee: 0,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  PREMIUM: {
    name: "Premium",
    revenueShare: 0.7, // 70/30
    requirements: {
      ticketsSold: 500,
      revenue: 10000,
      communityLeads: 2000,
    },
    monthlyFee: 0,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
} as const

export function getNextLevel(currentLevel: ArtistLevel): ArtistLevel | null {
  if (currentLevel === "STARTER") return "INTERMEDIATE"
  if (currentLevel === "INTERMEDIATE") return "PREMIUM"
  return null
}

export function canUpgradeToLevel(
  stats: {
    ticketsSold: number
    revenue: number
    communityLeads: number
  },
  targetLevel: ArtistLevel
): boolean {
  const requirements = ARTIST_LEVELS[targetLevel].requirements

  return (
    stats.ticketsSold >= requirements.ticketsSold ||
    stats.revenue >= requirements.revenue ||
    stats.communityLeads >= requirements.communityLeads
  )
}

export function getProgressToNextLevel(
  currentLevel: ArtistLevel,
  stats: {
    ticketsSold: number
    revenue: number
    communityLeads: number
  }
) {
  const nextLevel = getNextLevel(currentLevel)
  if (!nextLevel) return null

  const requirements = ARTIST_LEVELS[nextLevel].requirements

  return {
    nextLevel,
    ticketsSoldProgress: Math.min(
      (stats.ticketsSold / requirements.ticketsSold) * 100,
      100
    ),
    revenueProgress: Math.min((stats.revenue / requirements.revenue) * 100, 100),
    communityLeadsProgress: Math.min(
      (stats.communityLeads / requirements.communityLeads) * 100,
      100
    ),
    requirements,
  }
}

export function isTrialActive(trialEndDate: Date): boolean {
  return new Date() < trialEndDate
}

export function getTrialDaysRemaining(trialEndDate: Date): number {
  const now = new Date()
  const diff = trialEndDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
