import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listAssets } from "@/lib/mux"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assets = await listAssets()
    
    return NextResponse.json({ assets })
  } catch (error: any) {
    console.error("Error listing Mux assets:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des assets" },
      { status: 500 }
    )
  }
}

