'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/app/components/Navbar'

export default function Generer() {
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [trame, setTrame] = useState(null)
  const [chapterIndex, setChapterIndex] = useState(0)
  const [chapterText, setChapterText] = useState('')
  const [chapterTexts, setChapterTexts] = useState([])
  const [choices, setChoices] = useState([])
  const [previousChoices, setPreviousChoices] = useState([])
  const [score, setScore] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [finished, setFinished] = useState(false)
  const [hover, setHover] = useState(null)
  const [message, setMessage] = useState(null)
  const [storyId, setStoryId] = useState(null)
  const router = useRouter()
  const params = useParams()
  const trameId = params.trame_id

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits) })
    })

    fetch(`/trames/${trameId}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setTrame(data)
          setChoices(data.chapitres_data[0].choices)
        } else {
          router.push('/forge')
        }
      })
      .catch(() => router.push('/forge'))
  }, [])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleChoice = async (choiceIndex) => {
    if (generating) return
    setGenerating(true)

    const choice = trame.chapitres_data[chapterIndex].choices[choiceIndex]
    const newScore = score + (choice.pts || 0)
    const newPreviousChoices = [...previousChoices, choice.text]

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterIndex,
          choiceIndex,
          previousChoices: newPreviousChoices,
          score: newScore,
          trameId: trame.titre,
          context: trame.chapitres_data[chapterIndex].context,
          choiceText: choice.text,
          totalChapters: trame.chapitres_data.length
        })
      })
      const genData = await genRes.json()
      const text = genData.text || ''

      const newChapterTexts = [...chapterTexts, text]
      setChapterText(text)
      setChapterTexts(newChapterTexts)
      setScore(newScore)
      setPreviousChoices(newPreviousChoices)

      const saveRes = await fetch('/api/save-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          trame: trame.titre,
          score: newScore,
          outcome: '',
          chapters: newPreviousChoices,
          chapterTexts: newChapterTexts,
          storyId: storyId
        })
      })
      const saveData = await saveRes.json()

      if (!storyId && saveData.storyId) {
        setStoryId(saveData.storyId)
      }

      const isLast = chapterIndex === trame.chapitres_data.length - 1
      if (isLast) {
        setFinished(true)
      } else {
        setChapterIndex(prev => prev + 1)
        setChoices(trame.chapitres_data[chapterIndex + 1].choices)
      }

    } catch (e) {
      showMessage('Erreur lors de la génération.', 'error')
    }

    setGenerating(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const totalChapters = trame?.chapitres_data?.length || 0

  if (!user || !trame) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>

      <Navbar credits={credits} onLogout={logout} activePage="forge" />

      {/* MESSAGE FEEDBACK */}
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

      {/* CONTENU */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px' }}>

        {/* TITRE TRAME */}
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center', marginBottom: '40px'
        }}>{trame.titre}</h1>

        {/* PROGRESSION */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', marginBottom: '8px'
        }}>
          {Array.from({ length: totalChapters }).map((_, i) => {
            const isDone = i < chapterIndex
            const isCurrent = i === chapterIndex && !finished
            const isUpcoming = i > chapterIndex
            return (
              <div key={i} style={{
                width: isCurrent ? '20px' : '12px',
                height: isCurrent ? '20px' : '12px',
                borderRadius: '50%',
                background: isDone || finished
                  ? '#ff6b1a'
                  : isCurrent
                    ? '#e8b84b'
                    : 'transparent',
                border: isUpcoming
                  ? '2px solid rgba(201,146,42,0.3)'
                  : isCurrent
                    ? '2px solid #e8b84b'
                    : 'none',
                transition: 'all 0.3s ease',
                boxShadow: isCurrent ? '0 0 10px rgba(232,184,75,0.5)' : 'none'
              }} />
            )
          })}
        </div>

        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '2px',
          textTransform: 'uppercase', color: '#7a6a52',
          textAlign: 'center', marginBottom: '48px'
        }}>
          {finished
            ? `Histoire complète — ${totalChapters} chapitres`
            : `Chapitre ${chapterIndex + 1} / ${totalChapters}`}
        </p>

        {/* HISTOIRE TERMINÉE */}
        {finished && (
          <div style={{
            background: '#0d0800', border: '1px solid rgba(201,146,42,0.35)',
            padding: '40px', textAlign: 'center',
            boxShadow: '0 0 60px rgba(255,107,26,0.1)'
          }}>
            <p style={{ fontSize: '2rem', marginBottom: '16px' }}>⚒</p>
            <h2 style={{
              fontFamily: 'Cinzel Decorative, serif', fontSize: '1.4rem',
              color: '#e8b84b', marginBottom: '16px'
            }}>Histoire forgée !</h2>
            <p style={{
              fontFamily: 'Crimson Text, serif', fontSize: '1.15rem',
              color: '#a89880', fontStyle: 'italic', marginBottom: '8px', lineHeight: '1.6'
            }}>{chapterText}</p>
            <p style={{
              fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
              color: '#7a6a52', letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '32px'
            }}>Votre histoire a été sauvegardée dans Ma Forge</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/forge')} style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #cc4400, #ff6b1a)',
                border: 'none', color: '#000',
                fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
                letterSpacing: '3px', textTransform: 'uppercase',
                cursor: 'pointer', fontWeight: 700,
                boxShadow: '0 4px 20px rgba(255,107,26,0.4)'
              }}>⚒ Ma Forge</button>
              <button onClick={() => router.push('/catalogue')} style={{
                padding: '14px 32px',
                background: 'transparent',
                border: '1px solid rgba(201,146,42,0.3)', color: '#c9922a',
                fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
                letterSpacing: '3px', textTransform: 'uppercase',
                cursor: 'pointer', fontWeight: 700
              }}>Les Trames</button>
            </div>
          </div>
        )}

        {/* CHAPITRE EN COURS */}
        {!finished && (
          <div>

            {/* CONTEXTE */}
            <div style={{
              background: '#0d0800',
              border: '1px solid rgba(201,146,42,0.2)',
              padding: '32px', marginBottom: '24px'
            }}>
              <p style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                letterSpacing: '2px', textTransform: 'uppercase',
                color: '#ff6b1a', marginBottom: '16px'
              }}>Contexte</p>
              <p style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1.2rem',
                color: '#e8dcc8', lineHeight: '1.8', fontStyle: 'italic'
              }}>
                {trame.chapitres_data[chapterIndex].context}
              </p>
            </div>

            {/* TEXTE GÉNÉRÉ */}
            {chapterText && (
              <div style={{
                background: 'rgba(255,107,26,0.03)',
                border: '1px solid rgba(255,107,26,0.15)',
                padding: '32px', marginBottom: '32px'
              }}>
                <p style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: '#ff6b1a', marginBottom: '16px'
                }}>Votre histoire</p>
                <p style={{
                  fontFamily: 'Crimson Text, serif', fontSize: '1.2rem',
                  color: '#e8dcc8', lineHeight: '1.8'
                }}>{chapterText}</p>
              </div>
            )}

            {/* GÉNÉRATION EN COURS */}
            {generating && (
              <div style={{
                textAlign: 'center', padding: '40px',
                border: '1px solid rgba(201,146,42,0.15)',
                background: '#0d0800', marginBottom: '32px'
              }}>
                <p style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
                  letterSpacing: '3px', textTransform: 'uppercase',
                  color: '#e8b84b'
                }}>⚒ La forge est en action...</p>
              </div>
            )}

            {/* CHOIX */}
            {!generating && (
              <div>
                <p style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: '#7a6a52', marginBottom: '16px', textAlign: 'center'
                }}>
                  {chapterText ? 'Que faites-vous ensuite ?' : 'Choisissez votre action'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => handleChoice(i)}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                      style={{
                        padding: '20px 24px', textAlign: 'left',
                        background: hover === i ? 'rgba(255,107,26,0.08)' : '#0d0800',
                        border: hover === i
                          ? '1px solid rgba(255,107,26,0.5)'
                          : '1px solid rgba(201,146,42,0.2)',
                        color: '#e8dcc8', cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontFamily: 'Crimson Text, serif', fontSize: '1.15rem',
                        lineHeight: '1.6'
                      }}
                    >
                      <span style={{
                        fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                        letterSpacing: '1px', color: '#ff6b1a', marginRight: '12px'
                      }}>{String.fromCharCode(65 + i)}.</span>
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}