'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar, { Footer } from '@/app/components/Navbar'

const TRAMES_FILES = [
  '/trames/trame-1.json',
  '/trames/trame-2.json',
]

export default function Catalogue() {
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [pseudo, setPseudo] = useState('')
  const [trames, setTrames] = useState([])
  const [hover, setHover] = useState(null)
  const [forgeIds, setForgeIds] = useState([])
  const [popup, setPopup] = useState(null)
  const [loading, setLoading] = useState(null)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      supabase.from('profiles').select('credits, username').eq('id', session.user.id).single()
        .then(({ data }) => {
          if (data) {
            setCredits(data.credits)
            setPseudo(data.username || '')
          }
        })
      supabase.from('forge').select('trame_id').eq('user_id', session.user.id)
        .then(({ data }) => {
          if (data) setForgeIds(data.map(d => d.trame_id))
        })
    })

    Promise.all(
      TRAMES_FILES.map(f =>
        fetch(f)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    )
    .then(data => setTrames(data.filter(Boolean)))
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAjouter = (trame) => {
    if (!trame.disponible) return
    if (forgeIds.includes(trame.id)) {
      showMessage('Cette trame est déjà dans votre forge !', 'error')
      return
    }
    setPopup(trame)
  }

  const confirmerAjout = async () => {
    if (!popup) return
    setLoading(popup.id)

    const { data: { session } } = await supabase.auth.getSession()

    if (popup.credits > 0) {
      if (credits < popup.credits) {
        showMessage('Crédits insuffisants — rendez-vous à la Bourse aux Crédits !', 'error')
        setLoading(null)
        setPopup(null)
        return
      }

      const res = await fetch('/api/deduct-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, amount: popup.credits })
      })

      if (!res.ok) {
        showMessage('Erreur lors de la déduction des crédits.', 'error')
        setLoading(null)
        setPopup(null)
        return
      }

      setCredits(prev => prev - popup.credits)
    }

    const { error } = await supabase.from('forge').insert({
      user_id: session.user.id,
      trame_id: popup.id,
      trame_titre: popup.titre,
      pseudo: pseudo
    })

    if (error) {
      showMessage('Erreur lors de l\'ajout.', 'error')
    } else {
      setForgeIds(prev => [...prev, popup.id])
      showMessage(`"${popup.titre}" ajoutée à votre forge !`, 'success')
    }

    setLoading(null)
    setPopup(null)
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif', display: 'flex', flexDirection: 'column' }}>

      <Navbar credits={credits} onLogout={logout} activePage="catalogue" />

      {message && (
        <div style={{
          position: 'fixed', top: '80px', right: '40px',
          background: message.type === 'success' ? 'rgba(126,200,126,0.15)' : 'rgba(232,68,90,0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(126,200,126,0.4)' : 'rgba(232,68,90,0.4)'}`,
          padding: '12px 32px', zIndex: 100,
          fontFamily: 'Cinzel, serif', fontSize: '0.9rem', letterSpacing: '2px',
          color: message.type === 'success' ? '#7ec87e' : '#e8445a'
        }}>
          {message.text}
        </div>
      )}

      {popup && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: '#0d0800', border: '1px solid rgba(201,146,42,0.35)',
            padding: '40px', maxWidth: '460px', width: '90%',
            boxShadow: '0 0 60px rgba(255,107,26,0.15)'
          }}>
            <h2 style={{
              fontFamily: 'Cinzel Decorative, serif', fontSize: '1.35rem',
              color: '#e8b84b', marginBottom: '16px', textAlign: 'center'
            }}>{popup.titre}</h2>

            {popup.credits > 0 ? (
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <p style={{
                  fontFamily: 'Crimson Text, serif', fontSize: '1.25rem',
                  color: '#a89880', lineHeight: '1.6', marginBottom: '12px'
                }}>
                  Cette trame coûte{' '}
                  <span style={{ color: '#4db8ff', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {popup.credits}
                    <img src="/diamond.png" alt="crédits" style={{ height: '16px', width: '16px', objectFit: 'contain' }} />
                  </span>
                </p>
                <p style={{
                  fontFamily: 'Crimson Text, serif', fontSize: '1.25rem',
                  color: '#a89880', lineHeight: '1.6'
                }}>
                  Votre solde :{' '}
                  <span style={{
                    fontWeight: 700,
                    color: credits >= popup.credits ? '#7ec87e' : '#e8445a',
                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                  }}>
                    {credits}
                    <img src="/diamond.png" alt="crédits" style={{ height: '16px', width: '16px', objectFit: 'contain' }} />
                  </span>
                </p>
                {credits < popup.credits && (
                  <p style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
                    letterSpacing: '1px', color: '#e8445a', marginTop: '8px'
                  }}>Crédits insuffisants !</p>
                )}
              </div>
            ) : (
              <p style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1.25rem',
                color: '#a89880', textAlign: 'center', marginBottom: '32px', lineHeight: '1.6'
              }}>
                Cette trame est <span style={{ color: '#7ec87e', fontWeight: 700 }}>gratuite</span>.<br />
                Voulez-vous l'ajouter à votre forge ?
              </p>
            )}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => setPopup(null)} style={{
                padding: '12px 32px', background: 'transparent',
                border: '1px solid rgba(201,146,42,0.3)', color: '#7a6a52',
                fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer'
              }}>Non</button>
              <button
                onClick={confirmerAjout}
                disabled={loading === popup.id || credits < popup.credits}
                style={{
                  padding: '12px 32px',
                  background: credits < popup.credits ? 'rgba(100,100,100,0.2)' : 'linear-gradient(135deg, #cc4400, #ff6b1a)',
                  border: 'none', color: credits < popup.credits ? '#555' : '#000',
                  fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: credits < popup.credits ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  boxShadow: credits >= popup.credits ? '0 4px 20px rgba(255,107,26,0.4)' : 'none'
                }}>
                {loading === popup.id ? '...' : 'Oui'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU — flex: 1 pour pousser le footer vers le bas */}
      <div style={{ flex: 1, padding: '20px 20px' }}>

        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(1.7rem, 3vw, 2.7rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center', marginBottom: '12px'
        }}>Les Trames</h1>

        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.9rem', letterSpacing: '3px',
          textTransform: 'uppercase', color: '#7a6a52',
          textAlign: 'center', marginBottom: '30px'
        }}>Choisissez votre aventure</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'flex-start' }}>
          {trames.map(trame => {
            const dejaAjoutee = forgeIds.includes(trame.id)
            const nonDisponible = !trame.disponible
            return (
              <div
                key={trame.id}
                onMouseEnter={() => setHover(trame.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  width: '280px', minWidth: '280px', background: '#0d0800',
                  border: hover === trame.id && !nonDisponible
                    ? '1px solid rgba(255,107,26,0.6)' : '1px solid rgba(201,146,42,0.2)',
                  transition: 'all 0.3s ease',
                  boxShadow: hover === trame.id && !nonDisponible
                    ? '0 0 30px rgba(255,107,26,0.2)' : '0 0 10px rgba(0,0,0,0.5)',
                  transform: hover === trame.id && !nonDisponible ? 'translateY(-4px)' : 'translateY(0)',
                  position: 'relative', opacity: nonDisponible ? 0.7 : 1
                }}
              >
                {nonDisponible && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px', zIndex: 2,
                    background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(201,146,42,0.4)',
                    padding: '4px 10px', fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                    letterSpacing: '1px', textTransform: 'uppercase', color: '#e8b84b'
                  }}>✦ Bientôt disponible</div>
                )}

                {dejaAjoutee && !nonDisponible && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px', zIndex: 2,
                    background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,107,26,0.4)',
                    padding: '4px 10px', fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                    letterSpacing: '1px', textTransform: 'uppercase', color: '#ff6b1a'
                  }}>⚒ Dans votre forge</div>
                )}

                <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}>
                  <img src={trame.image} alt={trame.titre}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      transform: hover === trame.id && !nonDisponible ? 'scale(1.05)' : 'scale(1)',
                      filter: dejaAjoutee || nonDisponible ? 'brightness(0.5)' : 'brightness(1)'
                    }}
                  />
                </div>

                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '2px',
                    textTransform: 'uppercase', color: '#ff6b1a',
                    border: '1px solid rgba(255,107,26,0.4)', padding: '3px 8px',
                    display: 'inline-block', marginBottom: '12px'
                  }}>{trame.genre}</span>

                  <h2 style={{
                    fontFamily: 'Cinzel Decorative, serif', fontSize: '1.15rem',
                    color: '#e8b84b', marginBottom: '8px', lineHeight: '1.4'
                  }}>{trame.titre}</h2>

                  <p style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
                    textTransform: 'uppercase', color: '#7a6a52',
                    letterSpacing: '1px', marginBottom: '12px'
                  }}>⚒ {trame.chapitres} chapitres</p>

                  <p style={{
                    fontFamily: 'Crimson Text, serif', fontSize: '1.1rem',
                    color: '#a89880', lineHeight: '1.6', marginBottom: '16px',
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{trame.description}</p>

                  <div style={{
                    borderTop: '1px solid rgba(201,146,42,0.2)',
                    borderBottom: '1px solid rgba(201,146,42,0.2)',
                    padding: '10px 0', marginBottom: '16px'
                  }}>
                    <span style={{
                      fontFamily: 'Cinzel, serif', fontSize: '1.6rem', fontWeight: 700,
                      color: trame.credits === 0 ? '#7ec87e' : '#4db8ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}>
                      {trame.credits === 0 ? 'Gratuite' : (
                        <>{trame.credits}<img src="/diamond.png" alt="crédits" style={{ height: '22px', width: '22px', objectFit: 'contain' }} /></>
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAjouter(trame)}
                    disabled={dejaAjoutee || nonDisponible}
                    style={{
                      width: '100%', padding: '12px',
                      background: dejaAjoutee || nonDisponible ? 'transparent'
                        : hover === trame.id ? 'linear-gradient(135deg, #cc4400, #ff6b1a)' : 'transparent',
                      border: `1px solid ${dejaAjoutee || nonDisponible ? 'rgba(100,100,100,0.3)' : 'rgba(201,146,42,0.3)'}`,
                      color: dejaAjoutee || nonDisponible ? '#555' : hover === trame.id ? '#000' : '#c9922a',
                      fontFamily: 'Cinzel, serif', fontSize: '0.85rem',
                      letterSpacing: '2px', textTransform: 'uppercase',
                      cursor: dejaAjoutee || nonDisponible ? 'not-allowed' : 'pointer',
                      fontWeight: 700, transition: 'all 0.3s ease',
                      boxShadow: hover === trame.id && !dejaAjoutee && !nonDisponible
                        ? '0 4px 20px rgba(255,107,26,0.4)' : 'none'
                    }}
                  >
                    {dejaAjoutee ? '⚒ Dans la forge' : nonDisponible ? '✦ Bientôt disponible' : '⚒ Ajouter à ma forge'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Footer />
    </div>
  )
}