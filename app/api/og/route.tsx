import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const title = searchParams.get('title') || 'VYbzzZ'
    const artist = searchParams.get('artist') || ''
    const date = searchParams.get('date') || ''
    const price = searchParams.get('price') || ''
    const type = searchParams.get('type') || 'concert' // concert | artist | home

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Logo / Brand */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 60,
              fontSize: 36,
              fontWeight: 'bold',
              color: '#FFC42E',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            🎵 VYbzzZ
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 80px',
              maxWidth: '1000px',
            }}
          >
            {type === 'concert' && (
              <>
                {/* Artist Name */}
                <div
                  style={{
                    fontSize: 72,
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: 20,
                    textTransform: 'uppercase',
                    letterSpacing: '-2px',
                  }}
                >
                  {artist}
                </div>

                {/* Concert Title */}
                <div
                  style={{
                    fontSize: 48,
                    color: '#FFC42E',
                    marginBottom: 30,
                  }}
                >
                  {title}
                </div>

                {/* Date & Price */}
                <div
                  style={{
                    display: 'flex',
                    gap: 40,
                    marginTop: 20,
                  }}
                >
                  {date && (
                    <div
                      style={{
                        fontSize: 28,
                        color: '#999',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '12px 24px',
                        borderRadius: 8,
                      }}
                    >
                      📅 {date}
                    </div>
                  )}
                  {price && (
                    <div
                      style={{
                        fontSize: 28,
                        color: '#999',
                        background: 'rgba(255, 196, 46, 0.2)',
                        padding: '12px 24px',
                        borderRadius: 8,
                      }}
                    >
                      🎫 À partir de {price}€
                    </div>
                  )}
                </div>
              </>
            )}

            {type === 'artist' && (
              <>
                <div
                  style={{
                    fontSize: 96,
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: 20,
                  }}
                >
                  {artist}
                </div>
                <div
                  style={{
                    fontSize: 36,
                    color: '#FFC42E',
                  }}
                >
                  Profil Artiste
                </div>
              </>
            )}

            {type === 'home' && (
              <>
                <div
                  style={{
                    fontSize: 96,
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: 20,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 36,
                    color: '#FFC42E',
                    maxWidth: '800px',
                  }}
                >
                  Concerts Live en Streaming • Billetterie en Ligne
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 60,
              fontSize: 24,
              color: '#666',
            }}
          >
            vybzzz.com
          </div>

          {/* Decorative Elements */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(255,196,46,0.15) 0%, rgba(255,196,46,0) 70%)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(255,196,46,0.1) 0%, rgba(255,196,46,0) 70%)',
              borderRadius: '50%',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
