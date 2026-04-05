'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/app/components/Navbar'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Score unique (BdV 1)
function getFin(fins, score) {
  if (!fins) return null
  return fins.find(f => score >= f.seuil_min && score <= f.seuil_max) || null
}

// 3 jauges (Nuit d'Été) — vérification par ordre de priorité
function getFinJauges(fins, desir, confiance, mystere) {
  if (!fins) return null
  for (const fin of fins.sort((a, b) => a.priorite - b.priorite)) {
    if (fin.id === 'union_des_ames'      && desir >= 14 && confiance >= 14) return fin
    if (fin.id === 'coup_de_foudre_libre' && desir >= 14 && mystere >= 14 && confiance < 14) return fin
    if (fin.id === 'ami_precieux'         && confiance >= 14 && desir < 14) return fin
    if (fin.id === 'enigme_non_resolue'   && mystere >= 14 && confiance < 14 && desir < 14) return fin
    if (fin.id === 'malentendu'           && desir >= 14 && confiance < 7) return fin
    if (fin.id === 'trop_tard') return fin
  }
  return fins[fins.length - 1]
}

function injecterPrenoms(texte, protagoniste, cible) {
  if (!texte) return texte
  return texte
    .replace(/\[PRENOM_PROTAGONISTE\]/g, protagoniste)
    .replace(/\[PRENOM_CIBLE\]/g, cible)
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

  // Score unique
  const [score, setScore] = useState(0)

  // 3 jauges
  const [scoreDesir, setScoreDesir] = useState(0)
  const [scoreConfiance, setScoreConfiance] = useState(0)
  const [scoreMystere, setScoreMystere] = useState(0)

  const [generating, setGenerating] = useState(false)
  const [finished, setFinished] = useState(false)
  const [finData, setFinData] = useState(null)
  const [hover, setHover] = useState(null)
  const [message, setMessage] = useState(null)
  const [resumed, setResumed] = useState(false)

  // Prénoms libres
  const [prenomProtagoniste, setPrenomProtagoniste] = useState('')
  const [prenomCible, setPrenomCible] = useState('')

  const trameRef = useRef(null)
  const chapterTextsRef = useRef([])
  const scoresRef = useRef({ score: 0, desir: 0, confiance: 0, mystere: 0 })
  const prenomProtRef = useRef('')
  const prenomCibleRef = useRef('')
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const trameId = params.trame_id

  const estTriJauges = (t) => !!t?.jauges

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)

      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits) })

      // Récupérer les prénoms depuis les query params
      const prot = searchParams.get('protagoniste') || ''
      const cible = searchParams.get('cible') || ''
      setPrenomProtagoniste(prot)
      setPrenomCible(cible)
      prenomProtRef.current = prot
      prenomCibleRef.current = cible

      // Charger la trame
      let trameData = null
      try {
        const r = await fetch(`/trames/${trameId}.json`)
        trameData = r.ok ? await r.json() : null
      } catch { }

      if (!trameData) { router.push('/forge'); return }

      // Si trame à prénoms libres mais pas de prénoms → rediriger vers demarrer
      if (trameData.prenoms_libres && (!prot || !cible)) {
        router.push(`/generer/${trameId}/demarrer`)
        return
      }

      // Injecter les prénoms dans le prompt système
      if (trameData.prenoms_libres && prot && cible) {
        trameData.prompt_systeme = trameData.prompt_systeme
          .replace(/\[PRENOM_PROTAGONISTE\]/g, prot)
          .replace(/\[PRENOM_CIBLE\]/g, cible)
      }

      trameRef.current = trameData
      setTrame(trameData)

      // Chercher un draft existant
      try {
        const draftRes = await fetch(`/api/draft?userId=${session.user.id}&trameId=${trameId}`)
        const draftData = await draftRes.json()

        if (draftData.draft && draftData.draft.chapter_texts?.length > 0) {
          const draft = draftData.draft
          const restoredTexts = draft.chapter_texts || []
          const restoredChoices = draft.previous_choices || []
          const restoredIndex = draft.chapter_index || 0

          chapterTextsRef.current = restoredTexts
          setChapterTexts(restoredTexts)
          setPreviousChoices(restoredChoices)
          setChapterIndex(restoredIndex)
          setChapterText(restoredTexts[restoredTexts.length - 1] || '')
          setResumed(true)

          // Restaurer les scores
          if (estTriJauges(trameData)) {
            const d = draft.score_desir || 0
            const c = draft.score_confiance || 0
            const m = draft.score_mystere || 0
            setScoreDesir(d)
            setScoreConfiance(c)
            setScoreMystere(m)
            scoresRef.current = { score: 0, desir: d, confiance: c, mystere: m }
          } else {
            const s = draft.score || 0
            setScore(s)
            scoresRef.current = { score: s, desir: 0, confiance: 0, mystere: 0 }
          }

          // Restaurer les prénoms depuis le draft si pas dans les query params
          if (trameData.prenoms_libres && draft.prenom_protagoniste && !prot) {
            setPrenomProtagoniste(draft.prenom_protagoniste)
            setPrenomCible(draft.prenom_cible || '')
            prenomProtRef.current = draft.prenom_protagoniste
            prenomCibleRef.current = draft.prenom_cible || ''
          }

          const currentChoices = trameData.chapitres_data[restoredIndex]?.choices || []
          setChoices(shuffle(currentChoices))
          setTimeout(() => setResumed(false), 4000)
          return
        }
      } catch { }

      // Pas de draft — démarrer normalement
      const firstChoices = trameData.chapitres_data[0]?.choices || []
      setChoices(shuffle(firstChoices))

      const promptSysteme = trameData.prompt_systeme
      generateChapter(0, null, null, scoresRef.current, trameData.chapitres_data.length, promptSysteme, trameData)
        .then(text => {
          if (text) {
            chapterTextsRef.current = [text]
            setChapterTexts([text])
            saveDraft(session.user.id, trameData, 0, scoresRef.current, [text], [], prot, cible)
          }
        })
    })
  }, [])

  const saveDraft = async (userId, currentTrame, chapIdx, scores, texts, choices, prot, cible) => {
    try {
      await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          trameId,
          trameTitre: currentTrame.titre,
          chapterIndex: chapIdx,
          score: scores.score,
          score_desir: scores.desir,
          score_confiance: scores.confiance,
          score_mystere: scores.mystere,
          chapterTexts: texts,
          previousChoices: choices,
          prenom_protagoniste: prot || '',
          prenom_cible: cible || ''
        })
      })
    } catch (e) {
      console.error('Erreur sauvegarde draft:', e)
    }
  }

  const deleteDraft = async (userId) => {
    try {
      await fetch(`/api/draft?userId=${userId}&trameId=${trameId}`, { method: 'DELETE' })
    } catch (e) {
      console.error('Erreur suppression draft:', e)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const generateChapter = async (chapIdx, choiceText, choicePts, scores, totalChapters, promptSysteme, trameData) => {
    setGenerating(true)
    const currentTrame = trameData || trameRef.current
    const isTriJauges = estTriJauges(currentTrame)

    // Tirer la profession au hasard pour le chapitre final
    let professionParent = null
    if (chapIdx === totalChapters - 1 && currentTrame?.professions_parent) {
      const list = currentTrame.professions_parent
      professionParent = list[Math.floor(Math.random() * list.length)]
    }

    try {
      const res = await fetch('/api/generer-chapitre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterIndex: chapIdx,
          choiceText,
          choicePts,
          scores,
          isTriJauges,
          totalChapters,
          promptSysteme,
          professionParent,
          prenomProtagoniste: prenomProtRef.current,
          prenomCible: prenomCibleRef.current
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
    const isTriJauges = estTriJauges(currentTrame)

    // Calculer les nouveaux scores
    let newScores = { ...scoresRef.current }
    if (isTriJauges) {
      newScores.desir = Math.min(20, newScores.desir + Math.max(0, choice.pts_desir || 0))
      newScores.confiance = Math.min(20, newScores.confiance + Math.max(0, choice.pts_confiance || 0))
      newScores.mystere = Math.min(20, newScores.mystere + Math.max(0, choice.pts_mystere || 0))
    } else {
      newScores.score = newScores.score + Math.min(2, Math.max(0, choice.pts || 0))
    }

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
        isTriJauges ? { desir: choice.pts_desir, confiance: choice.pts_confiance, mystere: choice.pts_mystere } : choice.pts,
        newScores,
        totalChapters,
        currentTrame.prompt_systeme,
        currentTrame
      )

      const newChapterTexts = [...chapterTextsRef.current, text]
      chapterTextsRef.current = newChapterTexts
      scoresRef.current = newScores
      setChapterTexts(newChapterTexts)
      setPreviousChoices(newPreviousChoices)

      if (isTriJauges) {
        setScoreDesir(newScores.desir)
        setScoreConfiance(newScores.confiance)
        setScoreMystere(newScores.mystere)
      } else {
        setScore(newScores.score)
      }

      // Déterminer la fin
      const fin = isLast
        ? isTriJauges
          ? getFinJauges(currentTrame.fins, newScores.desir, newScores.confiance, newScores.mystere)
          : getFin(currentTrame.fins, newScores.score)
        : null

      if (isLast) {
        // Sauvegarder dans stories
        await fetch('/api/save-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            trame: currentTrame.titre,
            score: isTriJauges ? Math.max(newScores.desir, newScores.confiance, newScores.mystere) : newScores.score,
            outcome: fin ? fin.titre : '',
            chapters: newPreviousChoices,
            chapterTexts: newChapterTexts,
            storyId: null
          })
        })
        await deleteDraft(session.user.id)
        setFinData(fin)
        setFinished(true)
      } else {
        await saveDraft(
          session.user.id, currentTrame, nextChapterIndex,
          newScores, newChapterTexts, newPreviousChoices,
          prenomProtRef.current, prenomCibleRef.current
        )
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
  const isTriJauges = estTriJauges(trame)

  if (!user || !trame) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>

      <Navbar credits={credits} onLogout={logout} activePage="forge" />

      {/* INDICATEUR DE REPRISE */}
      {resumed && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.4)',
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
          gap: '8px', marginBottom: '8px', flexWrap: 'wrap'
        }}>
          {Array.from({ length: totalChapters }).map((_, i) => {
            const isDone = i < chapterIndex
            const isCurrent = i === chapterIndex && !finished
            const isUpcoming = i > chapterIndex
            return (
              <div key={i} style={{
                width: isCurrent ? '16px' : '10px',
                height: isCurrent ? '16px' : '10px',
                borderRadius: '50%',
                background: isDone || finished ? '#ff6b1a' : isCurrent ? '#e8b84b' : 'transparent',
                border: isUpcoming ? '2px solid rgba(201,146,42,0.3)' : isCurrent ? '2px solid #e8b84b' : 'none',
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
              }}>{finData.emoji} {finData.titre}</p>
            )}

            {/* JAUGES RÉVÉLÉES À LA FIN */}
            {isTriJauges && (
              <div style={{
                display: 'flex', gap: '12px', justifyContent: 'center',
                marginBottom: '28px', flexWrap: 'wrap'
              }}>
                {[
                  { label: 'Désir', emoji: '💛', value: scoreDesir },
                  { label: 'Confiance', emoji: '🤍', value: scoreConfiance },
                  { label: 'Mystère', emoji: '🖤', value: scoreMystere }
                ].map(j => (
                  <div key={j.label} style={{
                    background: 'rgba(201,146,42,0.05)',
                    border: '1px solid rgba(201,146,42,0.25)',
                    padding: '10px 20px', textAlign: 'center', minWidth: '90px'
                  }}>
                    <p style={{
                      fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
                      letterSpacing: '2px', textTransform: 'uppercase',
                      color: '#7a6a52', marginBottom: '4px'
                    }}>{j.emoji} {j.label}</p>
                    <p style={{
                      fontFamily: 'Cinzel Decorative, serif', fontSize: '1.2rem',
                      color: '#e8b84b'
                    }}>{j.value}<span style={{ fontSize: '0.65rem', color: '#5a4a32' }}>/20</span></p>
                  </div>
                ))}
              </div>
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
                {injecterPrenoms(
                  trame.chapitres_data[chapterIndex]?.context,
                  prenomProtagoniste, prenomCible
                )}
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
                    color: '#e8dcc8', lineHeight: '1.8', textAlign: 'justify',
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
                      {injecterPrenoms(choice.text, prenomProtagoniste, prenomCible)}
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
