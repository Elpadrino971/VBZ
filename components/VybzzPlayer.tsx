"use client"

import { useEffect, useRef } from "react"
import Hls from "hls.js"

type VybzzPlayerProps = {
  playbackId: string
  posterUrl?: string | null
  autoplay?: boolean
  muted?: boolean
}

export function VybzzPlayer({ 
  playbackId, 
  posterUrl,
  autoplay = false,
  muted = false 
}: VybzzPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !playbackId) {
      console.warn("⚠️ VybzzPlayer: video ou playbackId manquant", { video: !!video, playbackId })
      return
    }

    console.log("🎬 VybzzPlayer initialisé avec playbackId:", playbackId, "autoplay:", autoplay)

    const src = `https://stream.mux.com/${playbackId}.m3u8`
    console.log("📺 URL Mux:", src)

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      console.log("✅ HLS.js supporté")
      hls = new Hls({ 
        enableWorker: true,
        lowLatencyMode: true,
      })
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        // Ne logger que les erreurs fatales pour éviter le spam dans la console
        if (data.fatal) {
          console.error("❌ HLS Fatal Error:", data)
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Network error, trying to recover...")
              hls?.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Media error, trying to recover...")
              hls?.recoverMediaError()
              break
            default:
              console.error("Fatal error, cannot recover")
              hls?.destroy()
              break
          }
        } else {
          // Erreurs non-fatales : juste logger en debug (optionnel)
          // console.debug("HLS Warning:", data)
        }
      })
      
      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("✅ Manifest parsed, tentative de lecture...")
        if (autoplay) {
          // Essayer de jouer immédiatement
          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("✅ Video playing successfully")
              })
              .catch((err) => {
                console.error("❌ Autoplay failed:", err)
                // Si autoplay échoue, essayer avec muted
                video.muted = true
                video.play()
                  .then(() => {
                    console.log("✅ Video playing with muted")
                    // Réessayer sans muted après un court délai
                    setTimeout(() => {
                      video.muted = false
                    }, 1000)
                  })
                  .catch((err2) => {
                    console.error("❌ Autoplay with muted also failed:", err2)
                  })
              })
          }
        }
      })

      hls.on(Hls.Events.LEVEL_LOADED, () => {
        console.log("✅ Level loaded")
      })
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("✅ Native HLS support (Safari)")
      video.src = src
      video.addEventListener("error", (e) => {
        console.error("❌ Video error:", e)
      })
      video.addEventListener("loadedmetadata", () => {
        console.log("✅ Video metadata loaded")
      })
      video.addEventListener("canplay", () => {
        console.log("✅ Video can play")
        if (autoplay) {
          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("✅ Video playing successfully")
              })
              .catch((err) => {
                console.error("❌ Autoplay failed:", err)
                video.muted = true
                video.play()
                  .then(() => {
                    console.log("✅ Video playing with muted")
                    setTimeout(() => {
                      video.muted = false
                    }, 1000)
                  })
                  .catch((err2) => {
                    console.error("❌ Autoplay with muted also failed:", err2)
                  })
              })
          }
        }
      })
    } else {
      console.error("❌ HLS not supported")
    }

    return () => {
      console.log("🧹 Cleanup VybzzPlayer")
      if (hls) {
        hls.destroy()
      }
    }
  }, [playbackId, autoplay])

  return (
    <div className="relative w-full overflow-hidden rounded-[14px] border border-white/10 bg-black shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <video
        ref={videoRef}
        className="w-full h-full aspect-video"
        poster={posterUrl || undefined}
        controls
        playsInline
        muted={muted}
        {...(autoplay ? { autoPlay: true } : {})}
        suppressHydrationWarning
      />
    </div>
  )
}

