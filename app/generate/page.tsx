'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CHAPTERS = [
  { choices: ["Approcher Maelis avec un sourire et l'inviter à danser", "Attendre et observer Maelis de loin avant d'agir", "Vous mêler à la foule sans la remarquer"] },
  { choices: ["Chercher Maelis des yeux pour vous assurer qu'elle va bien", "Tenter de retrouver le voleur pour impressionner", "Profiter de la confusion pour explorer les lieux"] },
  { choices: ["La rejoindre discrètement et lui demander si elle a besoin d'aide", "La suivre à distance pour comprendre", "L'ignorer et continuer à chercher le voleur"] },
  { choices: ["Prendre sa main : Je vais vous aider à trouver une solution", "La persuader de remettre la coupe et promettre de plaider sa cause", "Lui dire froidement que voler n'est pas la bonne solution"] },
  { choices: ["Rester aux côtés de Maelis et lui demander ce qu'elle souhaite", "Écouter l'inconnu, main protectrice sur l'épaule de Maelis", "Repousser l'inconnu et gérer seul"] },
  { choices: ["La décision t'appartient Maelis, je serai là quoi qu'il arrive", "Lui conseiller prudemment les risques de chaque option", "Prendre la décision à sa place sans lui demander son avis"] },
  { choices: ["Vous arrêter pour vous assurer qu'elle n'est pas blessée", "Murmurer des excuses rapides et continuer", "Continuer sans vous retourner"] },
  { choices: ["La protéger en lui signalant de rester en arrière", "La laisser parler — son courage mérite d'être entendu", "Gérer Aldric seul sans regarder Maelis"] },
  { choices: ["Lui avouer que cette nuit a changé quelque chose en vous", "Lui sourire sans mot dire, laisser le silence parler", "Plaisanter légèrement pour désamorcer l'émotion"] }
]

const OUTCOMES = [
  { min: 0, max: 7, hearts: '💔', title: "Mission échouée", subtitle: "Son coeur reste fermé", color: '#e8445a' },
  { min: 8, max: 14, hearts: '🤝', title: "Une belle amitié", subtitle: "Pas d'amour, mais un lien sincère", color: '#7ec87e' },
  { min: 15, max: 22, hearts: '💛', title: "Promesse d'amour", subtitle: "Elle est séduite, mais prudente", color: '#e8b84b' },
  { min: 23, max: 99, hearts: '❤️', title: "Conquête totale", subtitle: "Son coeur vous appartient", color: '#e8445a' }
]

export default function Generate() {
  const router = useRouter()
  const [chapterIndex, setChapterIndex] = useState(0)
  const [storyText, setStoryText] = useState('')
  const [loading, setLoading] = useState(false)
  const [choices, setChoices] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [showChoices, setShowChoices] = useState(false)
  const [finished, setFinished] = useState(false)
  const [finalText, setFinalText] = useState('')
  const [picked, setPicked] = useState<number | null>(null)

  useEffect(() => {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (!session) { router.push('/auth'); return }
    
    // Vérifier les crédits avant de commencer
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', session.user.id)
      .single()
    
    if (!profile || profile.credits <= 0) {
      router.push('/credits?noCredits=true')
      return
    }
    
    supabase.rpc('deduct_credit', { user_id: session.user.id })
  })
  generateChapter(0, 0, [], 0, true)
}, [])

  const generateChapter = async (
    chapIdx: number,
    choiceIdx: number,
    prevChoices: string[],
    currentScore: number,
    isFirst = false
  ) => {
    setLoading(true)
    setShowChoices(false)
    setStoryText('')
    setPicked(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterIndex: chapIdx,
          choiceIndex: isFirst ? 0 : choiceIdx,
          previousChoices: prevChoices,
          score: currentScore,
          isFirst
        })
      })
      const data = await res.json()
      const newScore = isFirst ? currentScore : currentScore + (data.pts || 0)
      if (!isFirst) setScore(newScore)
      setLoading(false)

      if (chapIdx >= 9) {
        setFinished(true)
        setFinalText(data.text)
        setStoryText(data.text)
        // Sauvegarder ici directement
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await supabase.from('stories').insert({
            user_id: session.user.id,
            trame: 'Bal de Village',
            score: newScore,
            outcome: OUTCOMES.find(o => newScore >= o.min && newScore <= o.max)?.title || '',
            chapters: prevChoices
          })
        }
      } else {
        typeText(data.text, () => setShowChoices(true))
      }
    } catch (e) {
      setLoading(false)
      setStoryText('Erreur de génération. Réessayez.')
    }
  }

const typeText = (text: string, cb: () => void) => {
  let i = 0
  const chars = Array.from(text)
  setStoryText('')
  const speed = Math.max(15, Math.floor(3000 / chars.length))
  const iv = setInterval(() => {
    if (i < chars.length) {
      i++
      setStoryText(chars.slice(0, i).join(''))
    } else {
      clearInterval(iv)
      setTimeout(cb, 300)
    }
  }, speed)
}

  const handleChoice = (choiceIdx: number) => {
    if (picked !== null) return
    setPicked(choiceIdx)
    const choiceText = CHAPTERS[chapterIndex - 1]?.choices[choiceIdx] || ''
    const newChoices = [...choices, choiceText]
    setChoices(newChoices)
    setTimeout(() => {
      const nextChap = chapterIndex + 1
      setChapterIndex(nextChap)
      generateChapter(nextChap, choiceIdx, newChoices, score)
    }, 500)
  }

  const outcome = OUTCOMES.find(o => score >= o.min && score <= o.max) || OUTCOMES[0]

  return (
    <div style={{ minHeight: '100vh', background: '#0d0b08', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>
      <nav style={{
        padding: '0 40px', height: '66px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(201,146,42,0.15)',
        background: 'rgba(13,11,8,0.97)', position: 'sticky', top: 0, zIndex: 10
      }}>
        <span style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem', color: '#e8b84b' }}>
          Bal de Village
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '2px', color: '#7a6a52', textTransform: 'uppercase' }}>
            Chapitre {Math.min(chapterIndex + 1, 10)} / 10
          </span>
          <button onClick={() => router.push('/catalogue')} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.07)',
            color: '#7a6a52', padding: '6px 14px', fontFamily: 'Cinzel, serif',
            fontSize: '0.6rem', letterSpacing: '2px', cursor: 'pointer'
          }}>Quitter</button>
        </div>
      </nav>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 40px' }}>

        <div style={{
          background: 'rgba(232,68,90,0.06)', border: '1px solid rgba(232,68,90,0.2)',
          padding: '12px 20px', marginBottom: '28px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>❤</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: 'rgba(232,68,90,0.85)', letterSpacing: '1px' }}>
            Mission séduction — Chaque décision influencera votre relation avec Maelis.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              width: i === chapterIndex ? '11px' : '7px',
              height: i === chapterIndex ? '11px' : '7px',
              borderRadius: '50%',
              background: i < chapterIndex ? '#7a5a1a' : i === chapterIndex ? '#f5d06e' : 'rgba(201,146,42,0.1)',
              border: `1px solid ${i < chapterIndex ? '#7a5a1a' : i === chapterIndex ? '#f5d06e' : 'rgba(201,146,42,0.18)'}`,
              boxShadow: i === chapterIndex ? '0 0 7px #c9922a' : 'none',
              transition: 'all 0.3s'
            }} />
          ))}
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '2px', color: '#7a6a52', marginLeft: '6px', textTransform: 'uppercase' }}>
            Chapitre {Math.min(chapterIndex + 1, 10)} / 10
          </span>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div style={{ fontSize: '3rem' }}>⚒</div>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '3px', color: '#c9922a', marginTop: '12px', textTransform: 'uppercase' }}>
              Forge en cours...
            </p>
          </div>
        )}

        {!loading && storyText && !finished && (
          <div style={{
            background: 'rgba(255,255,255,0.017)', border: '1px solid rgba(201,146,42,0.15)',
            padding: '36px 40px', marginBottom: '28px'
          }}>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.92', fontStyle: 'italic', textIndent: '1.3rem' }}>
              {storyText}
            </p>
          </div>
        )}

        {showChoices && !finished && (
  <div>
    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.66rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#c9922a', marginBottom: '12px' }}>
      — Que faites-vous ? —
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {CHAPTERS[chapterIndex]?.choices.map((choice, i) => (
        <button key={i} onClick={() => handleChoice(i)} style={{
          background: picked === i ? 'rgba(201,146,42,0.06)' : 'rgba(255,255,255,0.013)',
          border: picked === i ? '1px solid #c9922a' : '1px solid rgba(201,146,42,0.13)',
          padding: '15px 20px', cursor: picked !== null ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '11px',
          fontFamily: 'Crimson Text, serif', fontSize: '1rem',
          color: picked === i ? '#e8b84b' : '#e8dcc8', textAlign: 'left',
          transition: 'all 0.3s', width: '100%'
        }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: '#c9922a', fontWeight: 700, minWidth: '15px' }}>
            {['A', 'B', 'C'][i]}
          </span>
          {choice}
        </button>
      ))}
    </div>
  </div>
)}

        {finished && (
          <div>
            <div style={{
              textAlign: 'center', padding: '48px 32px',
              border: '1px solid rgba(232,68,90,0.2)',
              background: 'rgba(232,68,90,0.04)', marginBottom: '32px'
            }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(232,68,90,0.6)', marginBottom: '16px' }}>
                Résultat de votre mission
              </p>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{outcome.hearts}</div>
              <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '2rem', color: outcome.color, marginBottom: '8px' }}>
                {outcome.title}
              </h2>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', color: outcome.color, opacity: 0.7, marginBottom: '24px' }}>
                {outcome.subtitle}
              </p>
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    width: `${Math.min(100, (score / 30) * 100)}%`,
                    background: `linear-gradient(to right, ${outcome.color}88, ${outcome.color})`,
                    transition: 'width 1.5s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Cinzel, serif', fontSize: '0.55rem', color: '#7a6a52', marginTop: '6px', textTransform: 'uppercase' }}>
                  <span>Froid</span><span>Amitié</span><span>Attirance</span><span>Conquête</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.017)', border: '1px solid rgba(201,146,42,0.15)',
              padding: '36px 40px', marginBottom: '28px'
            }}>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.92', fontStyle: 'italic', textIndent: '1.3rem' }}>
                {finalText}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/generate')} style={{
                background: 'linear-gradient(135deg,#8b2020,#a82828)', color: '#f5d06e',
                border: 'none', padding: '14px 32px', fontFamily: 'Cinzel, serif',
                fontSize: '0.76rem', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer'
              }}>Rejouer</button>
              <button onClick={() => router.push('/')} style={{
                background: 'transparent', border: '1px solid rgba(201,146,42,0.18)',
                color: '#7a6a52', padding: '14px 32px', fontFamily: 'Cinzel, serif',
                fontSize: '0.76rem', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer'
              }}>Accueil</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}