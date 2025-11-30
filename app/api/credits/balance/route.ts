import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserCreditsBalance } from "@/lib/credits"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const balance = await getUserCreditsBalance(session.user.id)

    return NextResponse.json({ balance })
  } catch (error) {
    console.error("Get credits balance error:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du solde" }, { status: 500 })
  }
}

