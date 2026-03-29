'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/app/components/Navbar'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getFin(fins, score) {
  if (!fins) return null
  return fins.find(f => score >= f.seuil_min && score <= f.seuil_max) || null
}

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
  const [finData, setFinData] = useState(null)
  const [hover, setHover] = useState(null)
  const [message, setMessage] = useState(null)
  const [storyId, setStoryId] = useState(null)
  const [resumed, setResumed] = useState(false)
  const trameRef = useRef(null)
  const chapterTextsRef = useRef([])
  const userIdRef = useRef(null)
  const router = useRouter()
  const params = useParams()
  const trameId = params.trame_id

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      userIdRef.current = session.user.id

      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits) })

      // Charger la trame
      let trameData = null
      try {
        const r = await fetch(`/trames/${trameId}.json`)
        trameData = r.ok ? await r.json() : null
      } catch { }

      if (!trameData) { router.push('/forge'); return }
      trameRef.current = trameData
      setTrame(trameData)

      // Chercher un draft existant
      try {
        const draftRes = await fetch(`/api/draft?userId=${session.user.id}&trameId=${trameId}`)
        const draftData = await draftRes.json()

        if (draftData.draft && draftData.draft.chapter_texts?.length > 0) {
          // Restaurer l'état depuis le draft
          const draft = draftData.draft
          const restoredTexts = draft.chapter_texts || []
          const restoredChoices = draft.previous_choices || []
          const restoredScore = draft.score || 0
          const restoredIndex = draft.chapter_index || 0

          chapterTextsRef.current = restoredTexts
          setChapterTexts(restoredTexts)
          setPreviousChoices(restoredChoices)
          setScore(restoredScore)
          setChapterIndex(restoredIndex)
          setChapterText(restoredTexts[restoredTexts.length - 1] || '')
          setResumed(true)

          // Shuffle les choix du chapitre en cours
          const currentChoices = trameData.chapitres_data[restoredIndex]?.choices || []
          setChoices(shuffle(currentChoices))

          // Masquer l'indicateur après 4 secondes
          setTimeout(() => setResumed(false), 4000)
          return
        }
      } catch { }

      // Pas de draft — démarrer normalement
      const firstChoices = trameData.chapitres_data[0]?.choices || []
      setChoices(shuffle(firstChoices))
      generateChapter(0, null, 0, 0, trameData.chapitres_data.length, trameData.prompt_systeme)
        .then(text => {
          if (text) {
            chapterTextsRef.current = [text]
            setChapterTexts([text])
            // Sauvegarder le draft initial
            saveDraft(session.user.id, trameData, 0, 0, [text], [])
          }
        })
    })
  }, [])

  const saveDraft = async (userId, currentTrame, chapIdx, currentScore, texts, choices) => {
    try {
      await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          trameId,
          trameTitre: currentTrame.titre,
          chapterIndex: chapIdx,
          score: currentScore,
          chapterTexts: texts,
          previousChoices: choices
        })
      })
    } catch (e) {
      console.error('Erreur sauvegarde draft:', e)
    }
  }

  const deleteDraft = async (userId) => {
    try {
      await fetch(`/api/draft?userId=${userId}&trameId=${trameId}`, {
        method: 'DELETE'
      })
    } catch (e) {
      console.error('Erreur suppression draft:', e)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const generateChapter = async (chapIdx, choiceText, choicePts, currentScore, totalChapters, promptSysteme) => {
    setGenerating(true)
    try {
      const res = await fetch('/api/generer-chapitre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterIndex: chapIdx,
          choiceText,
          choicePts,
          score: currentScore,
          totalChapters,
          promptSysteme
        })
      })
      const data = await res.json()
      const text = data.text || ''
      setChapterText(text)
      return text
    } catch (e) {
      showMessage('Erreur lors de la génération.', 'error')
      return ''
    } finally {
      setGenerating(false)
    }
  }

  const handleChoice = async (choiceIndex) => {
    if (generating) return
    const currentTrame = trameRef.current
    if (!currentTrame) return

    const choice = choices[choiceIndex]
    const pts = Math.min(2, Math.max(0, choice.pts || 0))
    const newScore = score + pts
    const newPreviousChoices = [...previousChoices, choice.text]

    const nextChapterIndex = chapterIndex + 1
    const totalChapters = currentTrame.chapitres_data.length
    const isLast = chapterIndex === totalChapters - 2

    setGenerating(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const targetIndex = isLast ? totalChapters - 1 : nextChapterIndex
      const text = await generateChapter(
        targetIndex,
        choice.text,
        pts,
        newScore,
        totalChapters,
        currentTrame.prompt_systeme
      )

      const newChapterTexts = [...chapterTextsRef.current, text]
      chapterTextsRef.current = newChapterTexts
      setChapterTexts(newChapterTexts)
      setScore(newScore)
      setPreviousChoices(newPreviousChoices)

      const fin = isLast ? getFin(currentTrame.fins, newScore) : null

      if (isLast) {
        // Histoire terminée → sauvegarder dans stories + supprimer le draft
        const saveRes = await fetch('/api/save-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            trame: currentTrame.titre,
            score: newScore,
            outcome: fin ? fin.titre : '',
            chapters: newPreviousChoices,
            chapterTexts: newChapterTexts,
            storyId: null
          })
        })
        await saveRes.json()
        await deleteDraft(session.user.id)
        setFinData(fin)
        setFinished(true)
      } else {
        // Mettre à jour le draft uniquement
        await saveDraft(session.user.id, currentTrame, nextChapterIndex, newScore, newChapterTexts, newPreviousChoices)
        setChapterIndex(nextChapterIndex)
        const nextChoices = currentTrame.chapitres_data[nextChapterIndex]?.choices || []
        setChoices(shuffle(nextChoices))
      }

    } catch (e) {
      showMessage('Erreur lors de la génération.', 'error')
      setGenerating(false)
    }
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

      {/* INDICATEUR DE REPRISE */}
      {resumed && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(232,184,75,0.12)',
          border: '1px solid rgba(232,184,75,0.4)',
          padding: '12px 32px', zIndex: 100,
          fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '2px',
          color: '#e8b84b', whiteSpace: 'nowrap'
        }}>
          ⚒ Histoire en cours restaurée — Chapitre {chapterIndex + 1} / {totalChapters}
        </div>
      )}

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

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px' }}>

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
                background: isDone || finished ? '#ff6b1a' : isCurrent ? '#e8b84b' : 'transparent',
                border: isUpcoming
                  ? '2px solid rgba(201,146,42,0.3)'
                  : isCurrent ? '2px solid #e8b84b' : 'none',
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
              color: '#e8b84b', marginBottom: '8px'
            }}>Histoire forgée !</h2>
            {finData && (
              <p style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
                color: '#ff6b1a', letterSpacing: '2px', textTransform: 'uppercase',
                marginBottom: '24px'
              }}>{finData.titre}</p>
            )}
            {chapterText.split('\n\n').filter(p => p.trim()).map((para, i, arr) => (
              <p key={i} style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1.15rem',
                color: '#a89880', lineHeight: '1.8', textAlign: 'justify',
                marginBottom: i < arr.length - 1 ? '1em' : '24px'
              }}>{para.trim()}</p>
            ))}
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
                padding: '14px 32px', background: 'transparent',
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
            <div style={{
              background: '#0d0800', border: '1px solid rgba(201,146,42,0.2)',
              padding: '32px', marginBottom: '24px'
            }}>
              <p style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                letterSpacing: '2px', textTransform: 'uppercase',
                color: '#ff6b1a', marginBottom: '16px'
              }}>
                {trame.chapitres_data[chapterIndex]?.titre || `Chapitre ${chapterIndex + 1}`}
              </p>
              <p style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1.2rem',
                color: '#e8dcc8', lineHeight: '1.8', fontStyle: 'italic'
              }}>
                {trame.chapitres_data[chapterIndex]?.context}
              </p>
            </div>

            {chapterText && !generating && (
              <div style={{
                background: 'rgba(255,107,26,0.03)',
                border: '1px solid rgba(255,107,26,0.15)',
                padding: '32px', marginBottom: '32px'
              }}>
                <p style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: '#ff6b1a', marginBottom: '16px'
                }}>L'histoire</p>
                {chapterText.split('\n\n').filter(p => p.trim()).map((para, i, arr) => (
                  <p key={i} style={{
                    fontFamily: 'Crimson Text, serif', fontSize: '1.2rem',
                    color: '#e8dcc8', lineHeight: '1.8',
                    textAlign: 'justify',
                    marginBottom: i < arr.length - 1 ? '1em' : '0'
                  }}>{para.trim()}</p>
                ))}
              </div>
            )}

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

            {!generating && choices.length > 0 && chapterIndex < totalChapters - 1 && (
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
