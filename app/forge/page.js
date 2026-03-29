'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import Navbar, { Footer } from '@/app/components/Navbar'

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

      supabase.from('profiles').select('credits, username').eq('id', session.user.id).single()
        .then(({ data }) => {
          if (data) {
            setCredits(data.credits)
            setPseudo(data.username || session.user.email)
          }
        })

      supabase.from('forge').select('*').eq('user_id', session.user.id)
        .then(({ data }) => { if (data) setTrames(data) })

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

  const handleForger = (trame) => { setPopup(trame) }

  const confirmerForge = async () => {
    if (!popup) return
    setLoading(popup.trame_id)

    const { data: { session } } = await supabase.auth.getSession()

    // Vérifier si un draft existe déjà pour cette trame
    try {
      const draftRes = await fetch(`/api/draft?userId=${session.user.id}&trameId=${popup.trame_id}`)
      const draftData = await draftRes.json()

      if (draftData.draft && draftData.draft.chapter_texts?.length > 0) {
        // Draft trouvé → reprendre sans débiter
        setLoading(null)
        setPopup(null)
        router.push(`/generer/${popup.trame_id}`)
        return
      }
    } catch { }

    // Pas de draft → vérifier les crédits et débiter
    if (credits < 1) {
      showMessage('Crédits insuffisants — rendez-vous à la Bourse aux Crédits !', 'error')
      setLoading(null)
      setPopup(null)
      return
    }

    const res = await fetch('/api/deduct-credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, amount: 1 })
    })

    if (!res.ok) {
      showMessage('Erreur lors de la déduction des crédits.', 'error')
      setLoading(null)
      setPopup(null)
      return
    }

    setCredits(prev => prev - 1)
    setLoading(null)
    setPopup(null)
    router.push(`/generer/${popup.trame_id}`)
  }

  const telechargerPDF = (story) => {
    const doc = new jsPDF()
    const date = new Date(story.created_at)
    const dateStr = date.toLocaleDateString('fr-FR', { timeZone: 'Europe/Zurich' }).replace(/\//g, '-')
    const heureStr = date.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Zurich',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).replace(/:/g, '-')
    const filename = `${story.trame}_${pseudo}_${dateStr}_${heureStr}.pdf`

    // Fond blanc
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 210, 297, 'F')

    // Titre
    doc.setTextColor(180, 100, 20)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(story.trame || 'Histoire', 105, 25, { align: 'center' })

    // Sous-titre auteur / date
    doc.setTextColor(120, 100, 80)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Par ${pseudo} — ${dateStr}`, 105, 35, { align: 'center' })

    // Fin obtenue si disponible
    if (story.outcome) {
      doc.setTextColor(200, 80, 20)
      doc.setFontSize(10)
      doc.text(`Fin : ${story.outcome}`, 105, 43, { align: 'center' })
    }

    // Ligne de séparation
    doc.setDrawColor(180, 130, 50)
    doc.setLineWidth(0.5)
    doc.line(20, 48, 190, 48)

    doc.setFontSize(11)
    let y = 60

    // Uniquement les textes générés — pas les choix, pas les questions
    const chapterTexts = story.chapter_texts || story.chapterTexts || []

    if (Array.isArray(chapterTexts) && chapterTexts.length > 0) {
      chapterTexts.forEach((text, i) => {
        if (!text) return

        // Nouvelle page si besoin
        if (y > 265) {
          doc.addPage()
          doc.setFillColor(255, 255, 255)
          doc.rect(0, 0, 210, 297, 'F')
          y = 20
        }

        // Titre du chapitre
        doc.setTextColor(200, 80, 20)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`Chapitre ${i + 1}`, 20, y)
        y += 3

        // Ligne fine sous le titre de chapitre
        doc.setDrawColor(220, 180, 100)
        doc.setLineWidth(0.3)
        doc.line(20, y + 1, 190, y + 1)
        y += 8

        // Texte narratif uniquement — noir sur blanc
        doc.setTextColor(30, 20, 10)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(text, 170)
        lines.forEach((line) => {
          if (y > 275) {
            doc.addPage()
            doc.setFillColor(255, 255, 255)
            doc.rect(0, 0, 210, 297, 'F')
            y = 20
          }
          doc.text(line, 20, y)
          y += 6
        })
        y += 12
      })
    } else {
      doc.setTextColor(120, 100, 80)
      doc.setFontSize(11)
      doc.text('Aucun texte disponible pour cette histoire.', 20, y)
    }

    doc.save(filename)
    showMessage('PDF téléchargé !', 'success')
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>

      <Navbar credits={credits} onLogout={logout} activePage="forge" />

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
                {credits} <img src="/diamond.png" alt="crédit" style={{ height: '16px', width: '16px', objectFit: 'contain' }} />
              </span>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => setPopup(null)} style={{
                padding: '12px 32px', background: 'transparent',
                border: '1px solid rgba(201,146,42,0.3)', color: '#7a6a52',
                fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer'
              }}>Annuler</button>
              <button
                onClick={confirmerForge}
                disabled={loading === popup.trame_id}
                style={{
                  padding: '12px 32px',
                  background: credits >= 1 ? 'linear-gradient(135deg, #cc4400, #ff6b1a)' : 'rgba(100,100,100,0.3)',
                  border: 'none',
                  color: credits >= 1 ? '#000' : '#666',
                  fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: credits >= 1 ? 'pointer' : 'not-allowed',
                  fontWeight: 700
                }}>
                {loading === popup.trame_id ? '⚒ Forge...' : '⚒ Forger'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 40px' }}>

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

        <div style={{
          borderBottom: '1px solid rgba(201,146,42,0.2)',
          paddingBottom: '60px', marginBottom: '60px'
        }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif', fontSize: '1.1rem', letterSpacing: '3px',
            textTransform: 'uppercase', color: '#e8b84b', marginBottom: '8px'
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
                    border: hover === trame.id ? '1px solid rgba(255,107,26,0.6)' : '1px solid rgba(201,146,42,0.2)',
                    transition: 'all 0.3s ease',
                    boxShadow: hover === trame.id ? '0 0 30px rgba(255,107,26,0.2)' : 'none',
                    transform: hover === trame.id ? 'translateY(-4px)' : 'translateY(0)'
                  }}
                >
                  <div style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem',
                        color: '#e8b84b', marginBottom: '8px', lineHeight: '1.4'
                      }}>{trame.trame_titre}</h3>
                      <p style={{
                        fontFamily: 'Cinzel, serif', fontSize: '0.65rem',
                        color: '#7a6a52', letterSpacing: '1px',
                        textTransform: 'uppercase', marginBottom: '0'
                      }}>Ajoutée le {formatDate(trame.added_at)}</p>
                    </div>
                    {trame.image && (
                      <img src={trame.image} alt={trame.trame_titre}
                        style={{
                          width: '80px', height: '80px', objectFit: 'cover',
                          border: '1px solid rgba(201,146,42,0.3)', flexShrink: 0
                        }}
                      />
                    )}
                  </div>

                  <div style={{
                    borderTop: '1px solid rgba(201,146,42,0.2)',
                    padding: '16px 24px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{
                      fontFamily: 'Cinzel, serif', fontSize: '0.85rem',
                      color: '#4db8ff', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      1 <img src="/diamond.png" alt="crédit" style={{ height: '14px', objectFit: 'contain' }} />
                    </span>
                    <button onClick={() => handleForger(trame)} style={{
                      padding: '8px 20px',
                      background: hover === trame.id ? 'linear-gradient(135deg, #cc4400, #ff6b1a)' : 'transparent',
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
              ))}
            </div>
          )}
        </div>

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
                    border: hover === `story-${story.id}` ? '1px solid rgba(255,107,26,0.4)' : '1px solid rgba(201,146,42,0.15)',
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
                      background: hover === `story-${story.id}` ? 'linear-gradient(135deg, #cc4400, #ff6b1a)' : 'transparent',
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

      <Footer />
    </div>
  )
}
