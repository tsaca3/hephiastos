'use client'
import { useRouter } from 'next/navigation'

export default function Catalogue() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0b08',
      color: '#e8dcc8',
      fontFamily: 'Crimson Text, serif'
    }}>
      <nav style={{
        padding: '0 40px', height: '66px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(201,146,42,0.15)',
        background: 'rgba(13,11,8,0.97)'
      }}>
        <span onClick={() => router.push('/')} style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '1.1rem', color: '#e8b84b', cursor: 'pointer'
        }}>HéphIAstos</span>
      </nav>

      <div style={{ textAlign: 'center', padding: '80px 40px 40px' }}>
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg,#f5d06e,#c9922a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>Les Trames</h1>
        <p style={{ color: '#7a6a52', fontStyle: 'italic' }}>
          Choisissez l'univers dans lequel vous allez forger votre récit
        </p>
      </div>

      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 48px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: '24px'
      }}>
        {/* Trame gratuite */}
        <div onClick={() => router.push('/generate')} style={{
          background: '#1a1409',
          border: '1px solid rgba(201,146,42,0.18)',
          cursor: 'pointer',
          transition: 'all 0.3s',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%', aspectRatio: '1/1',
            background: 'linear-gradient(135deg,#2a1a0a,#1a0a0a)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '4rem'
          }}>🏮</div>
          <div style={{ padding: '18px 20px' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(30,100,50,0.35)',
              border: '1px solid #2e7d44',
              color: '#4caf72',
              padding: '3px 10px',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.55rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>❤ Mission séduction</div>
            <h3 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '1rem', color: '#e8dcc8', marginBottom: '8px'
            }}>Bal de Village</h3>
            <p style={{
              color: '#7a6a52', fontSize: '0.86rem',
              lineHeight: '1.6', fontStyle: 'italic', marginBottom: '12px'
            }}>
              Parviendrez-vous à conquérir le cœur de Maelis avant que la nuit se termine ?
            </p>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(201,146,42,0.08)',
              paddingTop: '11px'
            }}>
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
                letterSpacing: '1px', textTransform: 'uppercase', color: '#7a6a52'
              }}>10 chapitres · 1 crédit</span>
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.92rem',
                color: '#e8b84b', fontWeight: 700
              }}>Gratuite</span>
            </div>
          </div>
        </div>

        {/* Bientôt */}
        {['L\'Épée du Destin', 'Les Profondeurs de Thalarys'].map((titre) => (
          <div key={titre} style={{
            background: '#1a1409',
            border: '1px solid rgba(201,146,42,0.18)',
            opacity: 0.6
          }}>
            <div style={{
              width: '100%', aspectRatio: '1/1',
              background: 'linear-gradient(135deg,#1a1409,#0d0b08)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '4rem'
            }}>⏳</div>
            <div style={{ padding: '18px 20px' }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(90,55,5,0.4)',
                border: '1px solid #7a5a1a',
                color: '#c9922a',
                padding: '3px 10px',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.55rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>Bientôt</div>
              <h3 style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '1rem', color: '#e8dcc8'
              }}>{titre}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}