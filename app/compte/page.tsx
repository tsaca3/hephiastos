'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Compte() {
  const router = useRouter()
  const [credits, setCredits] = useState<number>(0)
  const [stories, setStories] = useState<any[]>([])
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setEmail(session.user.email || '')

      const { data: profile } = await supabase
        .from('profiles').select('credits').eq('id', session.user.id).single()
      if (profile) setCredits(profile.credits)

      const { data: storiesData } = await supabase
        .from('stories').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      if (storiesData) setStories(storiesData)

      setLoading(false)
    })
  }, [])

  const OUTCOME_COLORS: Record<string, string> = {
    'Mission échouée': '#e8445a',
    'Une belle amitié': '#7ec87e',
    "Promesse d'amour": '#e8b84b',
    'Conquête totale': '#e8445a'
  }

  const OUTCOME_HEARTS: Record<string, string> = {
    'Mission échouée': '💔',
    'Une belle amitié': '🤝',
    "Promesse d'amour": '💛',
    'Conquête totale': '❤️'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0b08', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>
      <nav style={{
        padding: '0 40px', height: '66px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(201,146,42,0.15)',
        background: 'rgba(13,11,8,0.97)', position: 'sticky', top: 0, zIndex: 10
      }}>
        <span onClick={() => router.push('/')} style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem', color: '#e8b84b', cursor: 'pointer' }}>HéphIAstos</span>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '2px', color: '#c9922a' }}>💎 {credits} crédits</span>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '2rem', color: '#e8b84b', marginBottom: '8px' }}>Mon Compte</h1>
          <p style={{ color: '#7a6a52', fontStyle: 'italic' }}>{email}</p>
        </div>

        {/* Solde crédits */}
        <div style={{
          background: 'rgba(201,146,42,0.06)', border: '1px solid rgba(201,146,42,0.2)',
          padding: '24px 32px', marginBottom: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#7a6a52', marginBottom: '8px' }}>Solde actuel</p>
            <p style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '2.5rem', color: '#e8b84b' }}>💎 {credits}</p>
          </div>
          <button onClick={() => router.push('/credits')} style={{
            background: 'linear-gradient(135deg,#8b6010,#c9922a)', color: '#0d0b08',
            border: 'none', padding: '12px 24px', fontFamily: 'Cinzel, serif',
            fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer'
          }}>Forger des crédits</button>
        </div>

        {/* Historique */}
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#7a6a52', marginBottom: '20px' }}>
          Mes histoires forgées
        </h2>

        {loading ? (
          <p style={{ color: '#7a6a52', fontStyle: 'italic', textAlign: 'center' }}>Chargement...</p>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', border: '1px solid rgba(201,146,42,0.1)' }}>
            <p style={{ color: '#7a6a52', fontStyle: 'italic' }}>Aucune histoire forgée pour l'instant.</p>
            <button onClick={() => router.push('/catalogue')} style={{
              marginTop: '16px', background: 'transparent', border: '1px solid rgba(201,146,42,0.2)',
              color: '#c9922a', padding: '10px 20px', fontFamily: 'Cinzel, serif',
              fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer'
            }}>Choisir une trame</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stories.map((story) => (
              <div key={story.id} style={{
                background: 'rgba(255,255,255,0.017)', border: '1px solid rgba(201,146,42,0.15)',
                padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
              }}>
                <div>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: '#e8dcc8', marginBottom: '4px' }}>
                    {OUTCOME_HEARTS[story.outcome] || '📖'} {story.trame}
                  </p>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: '#7a6a52', letterSpacing: '1px' }}>
                    {new Date(story.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: OUTCOME_COLORS[story.outcome] || '#e8b84b', marginBottom: '4px' }}>
                    {story.outcome}
                  </p>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.55rem', color: '#7a6a52', letterSpacing: '1px' }}>
                    Score : {story.score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}