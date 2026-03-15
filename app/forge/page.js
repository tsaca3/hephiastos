'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'

export default function Forge() {
  const [user, setUser] = useState(null)
  const [pseudo, setPseudo] = useState('')
  const [credits, setCredits] = useState(0)
  const [trames, setTrames] = useState([])
  const [stories, setStories] = useState([])
  const [hover, setHover] = useState(null)
  const [popup, setPopup] = useState(null)
  const [loading, setLoading] = useState(null)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)

      // Profil
      supabase.from('profiles').select('credits, username').eq('id', session.user.id).single()
        .then(({ data }) => {
          if (data) {
            setCredits(data.credits)
            setPseudo(data.username || session.user.email)
          }
        })

      // Trames de la forge
      supabase.from('forge').select('*').eq('user_id', session.user.id)
        .then(({ data }) => { if (data) setTrames(data) })

      // Histoires générées
      supabase.from('stories').select('*').eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setStories(data) })
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleForger = (trame) => {
    setPopup(trame)
  }

  const confirmerForge = async () => {
    if (!popup) return
    setLoading(popup.trame_id)

    // Vérifier les crédits (coût fixe = 1 crédit par génération)
    const coutGeneration = 1
    if (credits < coutGeneration) {
      showMessage('Crédits insuffisants — rendez-vous à la Bourse aux Crédits !', 'error')
      setLoading(null)
      setPopup(null)
      return
    }

    setLoading(null)
    setPopup(null)
    router.push(`/generer/${popup.trame_id}`)
  }

  const telechargerPDF = (story) => {
  const doc = new jsPDF()
  const date = new Date(story.created_at)
  const dateStr = date.toLocaleDateString('fr-FR').replace(/\//g, '-')
  const heureStr = date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  }).replace(/:/g, '-')
  const filename = `${story.trame}_${pseudo}_${dateStr}_${heureStr}.pdf`

    // Style forge
    doc.setFillColor(13, 8, 0)
    doc.rect(0, 0, 210, 297, 'F')

    // Titre
    doc.setTextColor(232, 184, 75)
    doc.setFontSize(20)
    doc.text(story.trame || 'Histoire', 105, 25, { align: 'center' })

    // Sous-titre
    doc.setTextColor(168, 152, 128)
    doc.setFontSize(11)
    doc.text(`Par ${pseudo} — ${date}`, 105, 35, { align: 'center' })

    // Ligne décorative
    doc.setDrawColor(201, 146, 42)
    doc.line(20, 40, 190, 40)

    // Contenu chapitres
    doc.setTextColor(232, 220, 200)
    doc.setFontSize(11)
    let y = 55

    if (story.chapter_texts && Array.isArray(story.chapter_texts)) {
      story.chapter_texts.forEach((text, i) => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.setTextColor(255, 107, 26)
        doc.setFontSize(12)
        doc.text(`Chapitre ${i + 1}`, 20, y)
        y += 8
        doc.setTextColor(232, 220, 200)
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(text, 170)
        lines.forEach((line) => {
          if (y > 270) { doc.addPage(); y = 20 }
          doc.text(line, 20, y)
          y += 6
        })
        y += 8
      })
    }

    doc.save(filename)
    showMessage('PDF téléchargé !', 'success')
  }

  const menuStyle = {
    fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: '#000', cursor: 'pointer', fontWeight: 700
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
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
          <span onClick={() => router.push('/catalogue')} style={menuStyle}>Les Trames</span>
          <span onClick={() => router.push('/credits')} style={menuStyle}>La Bourse aux Crédits</span>
          <span onClick={() => router.push('/compte')} style={menuStyle}>Mon Compte</span>
          <span onClick={() => router.push('/forge')} style={{ ...menuStyle, color: '#555555' }}>Ma Forge</span>
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
          fontFamily: 'Cinzel, serif', fontSize: '0.9rem', letterSpacing: '2px',
          color: message.type === 'success' ? '#7ec87e' : '#e8445a'
        }}>
          {message.text}
        </div>
      )}

      {/* POPUP CONFIRMATION FORGE */}
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
            }}>{popup.trame_titre}</h2>
            <p style={{
              fontFamily: 'Crimson Text, serif', fontSize: '1.25rem',
              color: '#a89880', textAlign: 'center', marginBottom: '12px', lineHeight: '1.6'
            }}>
              Forger une nouvelle histoire coûte{' '}
              <span style={{ color: '#4db8ff', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                1 <img src="/diamond.png" alt="crédit" style={{ height: '16px', width: '16px', objectFit: 'contain' }} />
              </span>
            </p>
            <p style={{
              fontFamily: 'Crimson Text, serif', fontSize: '1.25rem',
              color: '#a89880', textAlign: 'center', marginBottom: '32px', lineHeight: '1.6'
            }}>
              Votre solde :{' '}
              <span style={{
                fontWeight: 700, color: credits >= 1 ? '#7ec87e' : '#e8445a',
                display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}>
                {credits} <img src="/diamond.png" alt="crédits" style={{ height: '16px', width: '16px', objectFit: 'contain' }} />
              </span>
            </p>
            {credits < 1 && (
              <p style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
                color: '#e8445a', textAlign: 'center', marginBottom: '24px'
              }}>Crédits insuffisants !</p>
            )}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => setPopup(null)} style={{
                padding: '12px 32px', background: 'transparent',
                border: '1px solid rgba(201,146,42,0.3)', color: '#7a6a52',
                fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer'
              }}>Annuler</button>
              <button
                onClick={confirmerForge}
                disabled={credits < 1 || loading === popup.trame_id}
                style={{
                  padding: '12px 32px',
                  background: credits < 1 ? 'rgba(100,100,100,0.2)' : 'linear-gradient(135deg, #cc4400, #ff6b1a)',
                  border: 'none', color: credits < 1 ? '#555' : '#000',
                  fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: credits < 1 ? 'not-allowed' : 'pointer', fontWeight: 700,
                  boxShadow: credits >= 1 ? '0 4px 20px rgba(255,107,26,0.4)' : 'none'
                }}>
                {loading === popup.trame_id ? '...' : '⚒ Forger'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div style={{ padding: '60px 40px' }}>

        {/* TITRE PAGE */}
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(1.7rem, 3vw, 2.7rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center', marginBottom: '12px'
        }}>Ma Forge</h1>

        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.9rem', letterSpacing: '3px',
          textTransform: 'uppercase', color: '#7a6a52',
          textAlign: 'center', marginBottom: '60px'
        }}>Forge de {pseudo}</p>

        {/* ===== SECTION 1 : MES TRAMES ===== */}
        <div style={{
          borderBottom: '1px solid rgba(201,146,42,0.2)',
          paddingBottom: '60px', marginBottom: '60px'
        }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif', fontSize: '1.1rem', letterSpacing: '3px',
            textTransform: 'uppercase', color: '#e8b84b',
            marginBottom: '8px'
          }}>⚒ Mes Trames</h2>
          <p style={{
            fontFamily: 'Crimson Text, serif', fontSize: '1rem',
            color: '#7a6a52', fontStyle: 'italic', marginBottom: '32px'
          }}>Choisissez une trame et forgez une nouvelle histoire</p>

          {trames.length === 0 ? (
            <div style={{
              border: '1px solid rgba(201,146,42,0.15)', padding: '40px',
              textAlign: 'center', background: '#0d0800'
            }}>
              <p style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1.1rem',
                color: '#7a6a52', fontStyle: 'italic', marginBottom: '20px'
              }}>Votre forge est vide — ajoutez des trames depuis le catalogue !</p>
              <button onClick={() => router.push('/catalogue')} style={{
                background: 'linear-gradient(135deg, #cc4400, #ff6b1a)',
                border: 'none', color: '#000', padding: '12px 32px',
                fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
                letterSpacing: '3px', textTransform: 'uppercase',
                cursor: 'pointer', fontWeight: 700
              }}>Découvrir les trames</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              {trames.map(trame => (
                <div
                  key={trame.id}
                  onMouseEnter={() => setHover(trame.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    width: '280px', background: '#0d0800',
                    border: hover === trame.id
                      ? '1px solid rgba(255,107,26,0.6)'
                      : '1px solid rgba(201,146,42,0.2)',
                    transition: 'all 0.3s ease',
                    boxShadow: hover === trame.id ? '0 0 30px rgba(255,107,26,0.2)' : 'none',
                    transform: hover === trame.id ? 'translateY(-4px)' : 'translateY(0)'
                  }}
                >
                  <div style={{ padding: '24px' }}>
                    <h3 style={{
                      fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem',
                      color: '#e8b84b', marginBottom: '8px', lineHeight: '1.4'
                    }}>{trame.trame_titre}</h3>
                    <p style={{
                      fontFamily: 'Cinzel, serif', fontSize: '0.65rem',
                      color: '#7a6a52', letterSpacing: '1px',
                      textTransform: 'uppercase', marginBottom: '20px'
                    }}>Ajoutée le {formatDate(trame.added_at)}</p>

                    <div style={{
                      borderTop: '1px solid rgba(201,146,42,0.2)',
                      paddingTop: '16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span style={{
                        fontFamily: 'Cinzel, serif', fontSize: '0.85rem',
                        color: '#4db8ff', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        1 <img src="/diamond.png" alt="crédit" style={{ height: '14px', objectFit: 'contain' }} />
                      </span>
                      <button
                        onClick={() => handleForger(trame)}
                        style={{
                          padding: '8px 20px',
                          background: hover === trame.id
                            ? 'linear-gradient(135deg, #cc4400, #ff6b1a)'
                            : 'transparent',
                          border: '1px solid rgba(201,146,42,0.3)',
                          color: hover === trame.id ? '#000' : '#c9922a',
                          fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
                          letterSpacing: '2px', textTransform: 'uppercase',
                          cursor: 'pointer', fontWeight: 700, transition: 'all 0.3s ease'
                        }}>
                        ⚒ Forger
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== SECTION 2 : MES HISTOIRES ===== */}
        <div>
          <h2 style={{
            fontFamily: 'Cinzel, serif', fontSize: '1.1rem', letterSpacing: '3px',
            textTransform: 'uppercase', color: '#e8b84b', marginBottom: '8px'
          }}>📜 Mes Histoires</h2>
          <p style={{
            fontFamily: 'Crimson Text, serif', fontSize: '1rem',
            color: '#7a6a52', fontStyle: 'italic', marginBottom: '32px'
          }}>Téléchargez vos histoires forgées en PDF</p>

          {stories.length === 0 ? (
            <div style={{
              border: '1px solid rgba(201,146,42,0.15)', padding: '40px',
              textAlign: 'center', background: '#0d0800'
            }}>
              <p style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1.1rem',
                color: '#7a6a52', fontStyle: 'italic'
              }}>Aucune histoire forgée pour le moment — lancez votre première aventure !</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stories.map(story => (
                <div
                  key={story.id}
                  onMouseEnter={() => setHover(`story-${story.id}`)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    background: '#0d0800',
                    border: hover === `story-${story.id}`
                      ? '1px solid rgba(255,107,26,0.4)'
                      : '1px solid rgba(201,146,42,0.15)',
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div>
                    <h3 style={{
                      fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem',
                      color: '#e8b84b', marginBottom: '6px'
                    }}>{story.trame || 'Histoire sans titre'}</h3>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <span style={{
                        fontFamily: 'Cinzel, serif', fontSize: '0.65rem',
                        color: '#7a6a52', letterSpacing: '1px', textTransform: 'uppercase'
                      }}>📅 {formatDate(story.created_at)}</span>
                      {story.score !== undefined && (
                        <span style={{
                          fontFamily: 'Cinzel, serif', fontSize: '0.65rem',
                          color: '#4db8ff', letterSpacing: '1px', textTransform: 'uppercase'
                        }}>Score : {story.score}</span>
                      )}
                      {story.outcome && (
                        <span style={{
                          fontFamily: 'Cinzel, serif', fontSize: '0.65rem',
                          color: '#ff6b1a', letterSpacing: '1px', textTransform: 'uppercase'
                        }}>{story.outcome}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => telechargerPDF(story)}
                    style={{
                      padding: '10px 24px',
                      background: hover === `story-${story.id}`
                        ? 'linear-gradient(135deg, #cc4400, #ff6b1a)'
                        : 'transparent',
                      border: '1px solid rgba(201,146,42,0.3)',
                      color: hover === `story-${story.id}` ? '#000' : '#c9922a',
                      fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
                      letterSpacing: '2px', textTransform: 'uppercase',
                      cursor: 'pointer', fontWeight: 700, transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap'
                    }}>
                    ⬇ Télécharger PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}