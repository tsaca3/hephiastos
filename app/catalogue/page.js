'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Liste des fichiers JSON de trames — ajoutez vos trames ici
const TRAMES_FILES = [
  '/trames/trame-1.json',
  '/trames/trame-2.json',
  '/trames/trame-3.json',
]

export default function Catalogue() {
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [trames, setTrames] = useState([])
  const [hover, setHover] = useState(null)
  const [forgeIds, setForgeIds] = useState([]) // trames déjà dans la forge
  const [popup, setPopup] = useState(null) // trame en attente de confirmation
  const [loading, setLoading] = useState(null)
  const [message, setMessage] = useState(null) // message feedback
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)

      // Crédits
      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits) })

      // Trames déjà dans la forge
      supabase.from('forge').select('trame_id').eq('user_id', session.user.id)
        .then(({ data }) => {
          if (data) setForgeIds(data.map(d => d.trame_id))
        })
    })

    // Charger tous les fichiers JSON
    Promise.all(TRAMES_FILES.map(f => fetch(f).then(r => r.json())))
      .then(data => setTrames(data))
      .catch(err => console.error('Erreur chargement trames:', err))
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
    // Déjà dans la forge
    if (forgeIds.includes(trame.id)) {
      showMessage('Cette trame est déjà dans votre forge !', 'error')
      return
    }
    // Ouvrir popup
    setPopup(trame)
  }

  const confirmerAjout = async () => {
    if (!popup) return
    setLoading(popup.id)

    // Trame payante → Stripe
    if (popup.credits > 0) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            priceId: popup.priceId, 
            userId: session.user.id,
            trameId: popup.id,
            trameTitre: popup.titre
          })
        })
        const data = await res.json()
        if (data.url) window.location.href = data.url
      } catch (e) {
        showMessage('Erreur lors du paiement.', 'error')
      }
      setLoading(null)
      setPopup(null)
      return
    }

    // Trame gratuite → ajout direct
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.from('forge').insert({
      user_id: session.user.id,
      trame_id: popup.id,
      trame_titre: popup.titre
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
          <span onClick={() => router.push('/credits')} style={menuStyle}>La Bourse aux Crédits</span>
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

      {/* MESSAGE FEEDBACK */}
      {message && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: message.type === 'success' ? 'rgba(126,200,126,0.15)' : 'rgba(232,68,90,0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(126,200,126,0.4)' : 'rgba(232,68,90,0.4)'}`,
          padding: '12px 32px', zIndex: 100,
          fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '2px',
          color: message.type === 'success' ? '#7ec87e' : '#e8445a'
        }}>
          {message.text}
        </div>
      )}

      {/* POPUP CONFIRMATION */}
      {popup && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: '#0d0800', border: '1px solid rgba(201,146,42,0.35)',
            padding: '40px', maxWidth: '460px', width: '90%',
            boxShadow: '0 0 60px rgba(255,107,26,0.15)'
          }}>
            <h2 style={{
              fontFamily: 'Cinzel Decorative, serif', fontSize: '1.2rem',
              color: '#e8b84b', marginBottom: '16px', textAlign: 'center'
            }}>{popup.titre}</h2>

            {popup.credits > 0 ? (
              <p style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1.1rem',
                color: '#a89880', textAlign: 'center', marginBottom: '32px', lineHeight: '1.6'
              }}>
                Cette trame coûte <span style={{ color: '#4db8ff', fontWeight: 700 }}>{popup.credits} 💎</span>.<br />
                Vous serez redirigé vers le paiement sécurisé.
              </p>
            ) : (
              <p style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1.1rem',
                color: '#a89880', textAlign: 'center', marginBottom: '32px', lineHeight: '1.6'
              }}>
                Cette trame est <span style={{ color: '#7ec87e', fontWeight: 700 }}>gratuite</span>.<br />
                Voulez-vous l'ajouter à votre forge ?
              </p>
            )}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => setPopup(null)} style={{
                padding: '12px 32px',
                background: 'transparent', border: '1px solid rgba(201,146,42,0.3)',
                color: '#7a6a52', fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer'
              }}>Non</button>
              <button onClick={confirmerAjout} disabled={loading === popup.id} style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #cc4400, #ff6b1a)',
                border: 'none', color: '#000',
                fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
                letterSpacing: '2px', textTransform: 'uppercase',
                cursor: 'pointer', fontWeight: 700,
                boxShadow: '0 4px 20px rgba(255,107,26,0.4)'
              }}>
                {loading === popup.id ? '...' : 'Oui'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div style={{ padding: '60px 80px' }}>

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
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px'
        }}>
          {trames.map(trame => {
            const dejaAjoutee = forgeIds.includes(trame.id)
            return (
              <div
                key={trame.id}
                onMouseEnter={() => setHover(trame.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  background: '#0d0800',
                  border: hover === trame.id
                    ? '1px solid rgba(255,107,26,0.6)'
                    : '1px solid rgba(201,146,42,0.2)',
                  transition: 'all 0.3s ease',
                  boxShadow: hover === trame.id
                    ? '0 0 30px rgba(255,107,26,0.2)'
                    : '0 0 10px rgba(0,0,0,0.5)',
                  transform: hover === trame.id ? 'translateY(-4px)' : 'translateY(0)',
                  position: 'relative'
                }}
              >
                {/* BADGE DÉJÀ DANS LA FORGE */}
                {dejaAjoutee && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px', zIndex: 2,
                    background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,107,26,0.4)',
                    padding: '4px 10px',
                    fontFamily: 'Cinzel, serif', fontSize: '0.55rem',
                    letterSpacing: '1px', textTransform: 'uppercase', color: '#ff6b1a'
                  }}>⚒ Dans votre forge</div>
                )}

                {/* IMAGE */}
                <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}>
                  <img
                    src={trame.image}
                    alt={trame.titre}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      transform: hover === trame.id ? 'scale(1.05)' : 'scale(1)',
                      filter: dejaAjoutee ? 'brightness(0.6)' : 'brightness(1)'
                    }}
                  />
                </div>

                {/* INFOS */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{
                      fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '2px',
                      textTransform: 'uppercase', color: '#ff6b1a',
                      border: '1px solid rgba(255,107,26,0.4)', padding: '3px 8px'
                    }}>{trame.genre}</span>
                    <span style={{
                      fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
                      textTransform: 'uppercase', color: '#7a6a52'
                    }}>⚒ {trame.chapitres} chapitres</span>
                  </div>

                  <h2 style={{
                    fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem',
                    color: '#e8b84b', marginBottom: '10px', lineHeight: '1.4'
                  }}>{trame.titre}</h2>

                  <p style={{
                    fontFamily: 'Crimson Text, serif', fontSize: '0.95rem',
                    color: '#a89880', lineHeight: '1.6', marginBottom: '16px',
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{trame.description}</p>

                  <div style={{
                    borderTop: '1px solid rgba(201,146,42,0.2)',
                    paddingTop: '12px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{
                      fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 700,
                      color: trame.credits === 0 ? '#7ec87e' : '#4db8ff'
                    }}>
                      {trame.credits === 0 ? 'Gratuite' : `${trame.credits} 💎`}
                    </span>

                    <button
                      onClick={() => handleAjouter(trame)}
                      disabled={dejaAjoutee}
                      style={{
                        padding: '8px 16px',
                        background: dejaAjoutee
                          ? 'transparent'
                          : hover === trame.id
                            ? 'linear-gradient(135deg, #cc4400, #ff6b1a)'
                            : 'transparent',
                        border: `1px solid ${dejaAjoutee ? 'rgba(100,100,100,0.3)' : 'rgba(201,146,42,0.3)'}`,
                        color: dejaAjoutee ? '#555' : hover === trame.id ? '#000' : '#c9922a',
                        fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
                        letterSpacing: '2px', textTransform: 'uppercase',
                        cursor: dejaAjoutee ? 'not-allowed' : 'pointer', fontWeight: 700,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {dejaAjoutee ? '⚒ Dans la forge' : '+ Ajouter'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}