import Mux from "@mux/mux-node"

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set")
}

export const mux = new Mux(
  process.env.MUX_TOKEN_ID,
  process.env.MUX_TOKEN_SECRET
)

export interface CreateLiveStreamResponse {
  id: string
  playback_ids: Array<{
    id: string
    policy: string
  }>
  stream_key: string
  status: string
}

export interface MuxAsset {
  id: string
  playback_ids: Array<{
    id: string
    policy: string
  }>
  status: string
  duration: number | null
}

/**
 * Crée un live stream Mux
 */
export async function createLiveStream(title?: string): Promise<CreateLiveStreamResponse> {
  try {
    const liveStream = await mux.video.liveStreams.create({
      playback_policy: ["public"],
      new_asset_settings: {
        playback_policy: ["public"],
      },
      reconnect_window: 60,
      latency_mode: "low",
      test: false,
      passthrough: title,
    })

    return {
      id: liveStream.id,
      playback_ids: liveStream.playback_ids || [],
      stream_key: liveStream.stream_key || "",
      status: liveStream.status || "idle",
    }
  } catch (error) {
    console.error("Error creating Mux live stream:", error)
    throw error
  }
}

/**
 * Récupère un live stream Mux
 */
export async function getLiveStream(streamId: string) {
  try {
    const liveStream = await mux.video.liveStreams.retrieve(streamId)
    return liveStream
  } catch (error) {
    console.error("Error retrieving Mux live stream:", error)
    throw error
  }
}

/**
 * Supprime un live stream Mux
 */
export async function deleteLiveStream(streamId: string) {
  try {
    await mux.video.liveStreams.delete(streamId)
  } catch (error) {
    console.error("Error deleting Mux live stream:", error)
    throw error
  }
}

/**
 * Récupère un asset Mux par son playback ID
 */
export async function getAssetByPlaybackId(playbackId: string): Promise<MuxAsset | null> {
  try {
    // Récupérer tous les assets et trouver celui avec le playback ID
    const assets = await mux.video.assets.list({ limit: 100 })
    
    for (const asset of assets.data) {
      const playbackIds = asset.playback_ids || []
      if (playbackIds.some((pid: any) => pid.id === playbackId)) {
        return {
          id: asset.id,
          playback_ids: playbackIds.map((pid: any) => ({
            id: pid.id,
            policy: pid.policy,
          })),
          status: asset.status || "unknown",
          duration: asset.duration || null,
        }
      }
    }
    
    return null
  } catch (error) {
    console.error("Error retrieving Mux asset:", error)
    return null
  }
}

/**
 * Liste tous les assets Mux disponibles
 */
export async function listAssets(): Promise<MuxAsset[]> {
  try {
    const assets = await mux.video.assets.list({ limit: 100 })
    return assets.data.map((asset: any) => ({
      id: asset.id,
      playback_ids: (asset.playback_ids || []).map((pid: any) => ({
        id: pid.id,
        policy: pid.policy,
      })),
      status: asset.status || "unknown",
      duration: asset.duration || null,
    }))
  } catch (error) {
    console.error("Error listing Mux assets:", error)
    return []
  }
}
