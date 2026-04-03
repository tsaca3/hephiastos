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
      pseudo: pseudo,
      image: popup.image
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

      <div style={{ flex: 1, padding: '40px' }}>

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
          textAlign: 'center', marginBottom: '40px'
        }}>Choisissez votre aventure</p>

        {/* Grille 2 colonnes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {trames.map(trame => {
            const dejaAjoutee = forgeIds.includes(trame.id)
            const nonDisponible = !trame.disponible
            const isHovered = hover === trame.id && !nonDisponible

            return (
              <div
                key={trame.id}
                onMouseEnter={() => setHover(trame.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  display: 'flex',
                  background: '#0d0800',
                  border: isHovered
                    ? '1px solid rgba(255,107,26,0.6)'
                    : trame.credits > 0
                      ? '1px solid rgba(201,146,42,0.5)'
                      : '1px solid rgba(201,146,42,0.2)',
                  transition: 'all 0.3s ease',
                  boxShadow: isHovered ? '0 0 30px rgba(255,107,26,0.2)' : '0 0 10px rgba(0,0,0,0.5)',
                  opacity: nonDisponible ? 0.7 : 1,
                  overflow: 'hidden',
                  borderRadius: '2px',
                }}
              >
                {/* Image carrée — sans aucun bandeau */}
                <div style={{ width: '160px', minWidth: '160px', height: '160px', flexShrink: 0, overflow: 'hidden' }}>
                  <img
                    src={trame.image}
                    alt={trame.titre}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      filter: nonDisponible ? 'brightness(0.4)' : dejaAjoutee ? 'brightness(0.6)' : 'brightness(1)',
                      display: 'block',
                    }}
                  />
                </div>

                {/* Contenu */}
                <div style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '7px', overflow: 'hidden', minWidth: 0 }}>

                  {/* En-tête : titre + genre */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <h2 style={{
                      fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem',
                      color: '#e8b84b', margin: 0, lineHeight: '1.3'
                    }}>{trame.titre}</h2>
                    <span style={{
                      fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '1.5px',
                      textTransform: 'uppercase', color: '#ff6b1a',
                      border: '1px solid rgba(255,107,26,0.4)', padding: '3px 7px',
                      whiteSpace: 'nowrap', flexShrink: 0
                    }}>{trame.genre}</span>
                  </div>

                  {/* Méta */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', color: '#7a6a52', letterSpacing: '1px' }}>
                      ⚒ {trame.chapitres} chapitres
                    </span>
                    {trame.duree && (
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', color: '#7a6a52', letterSpacing: '1px' }}>
                        ✦ {trame.duree}
                      </span>
                    )}
                    {trame.fins && (
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', color: '#7a6a52', letterSpacing: '1px' }}>
                        ✦ {trame.fins} fins possibles
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{
                    fontFamily: 'Crimson Text, serif', fontSize: '1rem',
                    color: '#a89880', lineHeight: '1.5', margin: 0, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{trame.description}</p>

                  {/* Pills mécaniques */}
                  {trame.mecaniques && trame.mecaniques.length > 0 && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {trame.mecaniques.map((m, i) => (
                        <span key={i} style={{
                          fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.5px',
                          color: '#c9922a', border: '1px solid rgba(201,146,42,0.3)',
                          padding: '2px 8px', borderRadius: '20px',
                          background: 'rgba(201,146,42,0.05)'
                        }}>{m}</span>
                      ))}
                    </div>
                  )}

                  {/* Footer : prix + bouton */}
                  <div style={{
                    borderTop: '1px solid rgba(201,146,42,0.15)',
                    paddingTop: '9px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontFamily: 'Cinzel, serif', fontSize: '1.1rem', fontWeight: 700,
                        color: trame.credits === 0 ? '#7ec87e' : '#4db8ff',
                        display: 'inline-flex', alignItems: 'center', gap: '5px'
                      }}>
                        {trame.credits === 0 ? 'Gratuite' : (
                          <>{trame.credits}<img src="/diamond.png" alt="crédits" style={{ height: '18px', width: '18px', objectFit: 'contain' }} /></>
                        )}
                      </span>
                      {dejaAjoutee && !nonDisponible && (
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: '#ff6b1a', letterSpacing: '1px', textTransform: 'uppercase' }}>
                          · Dans votre forge
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAjouter(trame)}
                      disabled={dejaAjoutee || nonDisponible}
                      style={{
                        padding: '7px 14px',
                        background: dejaAjoutee || nonDisponible ? 'transparent'
                          : isHovered ? 'linear-gradient(135deg, #cc4400, #ff6b1a)' : 'transparent',
                        border: `1px solid ${dejaAjoutee || nonDisponible ? 'rgba(100,100,100,0.3)' : 'rgba(201,146,42,0.4)'}`,
                        color: dejaAjoutee || nonDisponible ? '#555' : isHovered ? '#000' : '#c9922a',
                        fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                        letterSpacing: '1.5px', textTransform: 'uppercase',
                        cursor: dejaAjoutee || nonDisponible ? 'not-allowed' : 'pointer',
                        fontWeight: 700, transition: 'all 0.3s ease', whiteSpace: 'nowrap',
                        boxShadow: isHovered && !dejaAjoutee && !nonDisponible ? '0 4px 20px rgba(255,107,26,0.4)' : 'none'
                      }}
                    >
                      {dejaAjoutee ? '⚒ Dans la forge' : nonDisponible ? '✦ Bientôt disponible' : '⚒ Ajouter à ma forge'}
                    </button>
                  </div>
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
