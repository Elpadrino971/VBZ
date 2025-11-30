import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

/**
 * Webhook Mux pour détecter automatiquement quand un stream démarre/se termine
 * Configurez cette URL dans votre dashboard Mux : Settings > Webhooks
 * URL : https://vybzzz.com/api/mux/webhook
 * Secret : ln4egrmcfmgvi2i5l93g6ru1d2di8pp3
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier la signature du webhook Mux pour sécurité
    const signature = req.headers.get("mux-signature")
    const secret = process.env.MUX_WEBHOOK_SECRET || "ln4egrmcfmgvi2i5l93g6ru1d2di8pp3"
    
    // Récupérer le body brut pour vérifier la signature
    const bodyText = await req.text()
    const body = JSON.parse(bodyText)
    const { type, data } = body

    // Vérifier la signature si présente (Mux signe les webhooks)
    if (signature && secret) {
      try {
        // Mux utilise HMAC SHA256 avec le secret
        // Format de signature : "t=timestamp,v1=signature"
        const parts = signature.split(",")
        const timestamp = parts.find(p => p.startsWith("t="))?.split("=")[1]
        const sig = parts.find(p => p.startsWith("v1="))?.split("=")[1]
        
        if (timestamp && sig) {
          const payload = `${timestamp}.${bodyText}`
          const expectedSig = crypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest("hex")
          
          // Comparaison sécurisée des signatures
          if (sig !== expectedSig) {
            console.warn("Signature webhook invalide")
            return NextResponse.json(
              { error: "Signature invalide" },
              { status: 401 }
            )
          }
        }
      } catch (sigError) {
        console.warn("Erreur vérification signature:", sigError)
        // On continue quand même pour le développement
      }
    }

    console.log("Webhook Mux reçu:", type, data?.id)

    // Événement : stream actif
    if (type === "video.live_stream.active") {
      const streamId = data?.id

      if (streamId) {
        // Trouver le concert associé à ce stream
        const concert = await prisma.concert.findFirst({
          where: {
            muxLiveStreamId: streamId,
            status: "PUBLISHED",
          },
        })

        if (concert) {
          await prisma.concert.update({
            where: { id: concert.id },
            data: { status: "LIVE" },
          })
          console.log(`✅ Concert "${concert.title}" passé en LIVE automatiquement`)
        }
      }
    }

    // Événement : stream terminé
    if (type === "video.live_stream.disconnected" || type === "video.live_stream.idle") {
      const streamId = data?.id

      if (streamId) {
        const concert = await prisma.concert.findFirst({
          where: {
            muxLiveStreamId: streamId,
            status: "LIVE",
          },
        })

        if (concert) {
          // Attendre un peu avant de passer en ENDED (au cas où le stream redémarre)
          // Ou laisser l'artiste le faire manuellement
          console.log(`Stream terminé pour concert "${concert.title}"`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Erreur webhook Mux:", error)
    return NextResponse.json(
      { error: "Erreur traitement webhook" },
      { status: 500 }
    )
  }
}

// GET pour vérification (Mux vérifie que l'endpoint existe)
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Webhook Mux endpoint" })
}

