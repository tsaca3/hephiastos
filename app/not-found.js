'use client'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>

      {/* BANDEAU */}
      <nav style={{
        padding: '0 40px', height: '66px',
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(to top, #ff6600, #ffaa33)',
        boxShadow: '0 2px 20px rgba(255,107,26,0.5)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <img
          src="/logo_icon.png"
          alt="HéphIAstos"
          style={{ height: '58px', cursor: 'pointer' }}
          onClick={() => router.push('/')}
        />
      </nav>

      {/* CONTENU */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 66px)', padding: '40px',
        textAlign: 'center'
      }}>

        {/* LOGO */}
        <img
          src="/logo.png"
          alt="HéphIAstos"
          style={{
            width: 'min(300px, 60vw)',
            marginBottom: '40px',
            filter: 'drop-shadow(0 0 40px rgba(255,107,26,0.4))'
          }}
        />

        {/* 404 */}
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(4rem, 12vw, 8rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '16px', lineHeight: 1
        }}>404</h1>

        {/* TITRE */}
        <h2 style={{
          fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
          letterSpacing: '3px', textTransform: 'uppercase',
          color: '#e8b84b', marginBottom: '24px'
        }}>Page introuvable</h2>

        {/* PHRASE ÉPIQUE */}
        <p style={{
          fontFamily: 'Crimson Text, serif', fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
          fontStyle: 'italic', color: '#a89880',
          maxWidth: '600px', lineHeight: '1.8', marginBottom: '8px'
        }}>
          Même Héphaïstos n'a pas pu forger cette page.
        </p>
        <p style={{
          fontFamily: 'Crimson Text, serif', fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
          fontStyle: 'italic', color: '#a89880',
          maxWidth: '600px', lineHeight: '1.8', marginBottom: '48px'
        }}>
          Elle n'existe tout simplement pas.
        </p>

        {/* BOUTON */}
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'linear-gradient(135deg, #cc4400, #ff6b1a)',
            color: '#000', border: 'none', padding: '16px 48px',
            fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
            letterSpacing: '3px', textTransform: 'uppercase',
            cursor: 'pointer', fontWeight: 700,
            boxShadow: '0 4px 20px rgba(255,107,26,0.4)'
          }}>
          ⚒ Retourner à l'accueil
        </button>

      </div>
    </div>
  )
}