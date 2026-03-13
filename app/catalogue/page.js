'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Catalogue() {
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [trames, setTrames] = useState([])
  const [hover, setHover] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits) })
    })

    fetch('/trames.json')
      .then(r => r.json())
      .then(data => setTrames(data))
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const menuStyle = {
    fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: '#000', cursor: 'pointer', fontWeight: 700
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>

      {/* BANDEAU */}
      <nav style={{
        padding: '0 40px', height: '66px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to top, #ff6600, #ffaa33)',
        boxShadow: '0 2px 20px rgba(255,107,26,0.5)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <img src="/logo_icon.png" alt="HéphIAstos" style={{ height: '58px', cursor: 'pointer' }} onClick={() => router.push('/')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '56px' }}>
          <span onClick={() => router.push('/catalogue')} style={{ ...menuStyle, color: '#555555' }}>Les Trames</span>
          <span onClick={() => router.push('/credits')} style={menuStyle}>Forge de Crédits</span>
          <span onClick={() => router.push('/compte')} style={menuStyle}>Mon Compte</span>
          <span onClick={() => router.push('/forge')} style={menuStyle}>Ma Forge</span>
          <span onClick={() => router.push('/conditions')} style={menuStyle}>Conditions Générales</span>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: '#000', borderRadius: '999px', padding: '9px 20px',
            fontFamily: 'Cinzel, serif', fontSize: '1.2rem', fontWeight: 700, color: '#4db8ff',
            boxShadow: '0 0 20px rgba(77,184,255,0.3)', minWidth: '80px', height: '40px'
          }}>
            {credits} <img src="/diamond.png" alt="crédits" style={{ height: '20px', width: '20px', objectFit: 'contain' }} />
          </span>
          <button onClick={logout} style={{
            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.3)',
            color: '#000', padding: '6px 14px', fontFamily: 'Cinzel, serif',
            fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase',
            cursor: 'pointer', fontWeight: 700
          }}>Déconnexion</button>
        </div>
      </nav>

      {/* CONTENU */}
      <div style={{ padding: '60px 80px' }}>

        {/* TITRE PAGE */}
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center', marginBottom: '12px'
        }}>Les Trames</h1>

        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '3px',
          textTransform: 'uppercase', color: '#7a6a52',
          textAlign: 'center', marginBottom: '60px'
        }}>Choisissez votre aventure</p>

        {/* GRILLE */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '40px'
        }}>

          {trames.map(trame => (
            <div
              key={trame.id}
              onClick={() => router.push(`/trame/${trame.id}`)}
              onMouseEnter={() => setHover(trame.id)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: '#0d0800',
                border: hover === trame.id
                  ? '1px solid rgba(255,107,26,0.6)'
                  : '1px solid rgba(201,146,42,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: hover === trame.id
                  ? '0 0 30px rgba(255,107,26,0.2)'
                  : '0 0 10px rgba(0,0,0,0.5)',
                transform: hover === trame.id ? 'translateY(-4px)' : 'translateY(0)'
              }}
            >
              {/* IMAGE */}
              <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}>
                <img
                  src={trame.image}
                  alt={trame.titre}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    transform: hover === trame.id ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
              </div>

              {/* INFOS */}
              <div style={{ padding: '20px' }}>

                {/* GENRE + CHAPITRES */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '2px',
                    textTransform: 'uppercase', color: '#ff6b1a',
                    border: '1px solid rgba(255,107,26,0.4)', padding: '3px 8px'
                  }}>{trame.genre}</span>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '1px',
                    textTransform: 'uppercase', color: '#7a6a52'
                  }}>⚒ {trame.chapitres} chapitres</span>
                </div>

                {/* TITRE */}
                <h2 style={{
                  fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem',
                  color: '#e8b84b', marginBottom: '10px', lineHeight: '1.4'
                }}>{trame.titre}</h2>

                {/* DESCRIPTION */}
                <p style={{
                  fontFamily: 'Crimson Text, serif', fontSize: '0.95rem',
                  color: '#a89880', lineHeight: '1.6',
                  marginBottom: '16px',
                  display: '-webkit-box', WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>{trame.description}</p>

                {/* PRIX */}
                <div style={{
                  borderTop: '1px solid rgba(201,146,42,0.2)',
                  paddingTop: '12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '1rem',
                    fontWeight: 700, color: '#4db8ff'
                  }}>{trame.credits} 💎</span>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    color: hover === trame.id ? '#ff6b1a' : '#7a6a52',
                    transition: 'color 0.3s ease'
                  }}>Découvrir →</span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}