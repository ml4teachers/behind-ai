import { ImageResponse } from 'next/og'

// Dynamisch generiertes Social-Vorschaubild (Open Graph / Twitter).
// 1200×630 im Marken-Look: dunkler Hintergrund, Sky-Akzent, Sparkle-Mark.
// Wird von Next.js automatisch als og:image (und via twitter-image als
// twitter:image) eingebunden.

export const alt = 'Behind AI – Wie KI-Sprachmodelle funktionieren'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const SPARKLE =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='128' height='128'>" +
  "<rect width='32' height='32' rx='7' fill='#0284C7'/>" +
  "<path d='M16 5 Q 17.6 14.4 27 16 Q 17.6 17.6 16 27 Q 14.4 17.6 5 16 Q 14.4 14.4 16 5 Z' fill='#fff'/>" +
  "<circle cx='24' cy='8' r='2' fill='#fff' fill-opacity='0.85'/></svg>"

export default function Image() {
  const sparkle = `data:image/svg+xml;utf8,${encodeURIComponent(SPARKLE)}`
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          backgroundColor: '#0d1117',
          backgroundImage: 'linear-gradient(135deg, #0d1117 55%, #0c2233 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sparkle} width={128} height={128} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 104, color: '#ffffff', letterSpacing: '-2px' }}>Behind AI</div>
          <div
            style={{
              display: 'flex',
              width: 132,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#0ea5e9',
              marginTop: 28,
              marginBottom: 28,
            }}
          />
          <div style={{ fontSize: 42, color: '#9aa3b2', maxWidth: 920, lineHeight: 1.3 }}>
            Wie KI-Sprachmodelle funktionieren – zum Ausprobieren und Selbermachen.
          </div>
        </div>
        <div style={{ fontSize: 30, color: '#38bdf8' }}>behind-ai.ch</div>
      </div>
    ),
    { ...size }
  )
}
