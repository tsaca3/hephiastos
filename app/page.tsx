'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits) })
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>
      
      {/* NAV BANDEAU ORANGE FEU */}
      <nav style={{
        padding: '0 40px', height: '66px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to left, #cc3300, #ff6600, #ffaa33)',
        boxShadow: '0 2px 20px rgba(255,107,26,0.5)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        {/* LOGO */}
        <img src="logo_icon.png" alt="HéphIAstos" style={{ height: '58px', cursor: 'pointer' }} onClick={() => router.push('/')} />
        
        {/* MENUS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '56px' }}>
          <span onClick={() => router.push('/catalogue')} style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '2px',
            textTransform: 'uppercase', color: '#000', cursor: 'pointer', fontWeight: 700
          }}>Les Trames</span>
          <span onClick={() => router.push('/credits')} style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '2px',
            textTransform: 'uppercase', color: '#000', cursor: 'pointer', fontWeight: 700
          }}>Forge de Crédits</span>
          <span onClick={() => router.push('/compte')} style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '2px',
            textTransform: 'uppercase', color: '#000', cursor: 'pointer', fontWeight: 700
          }}>Mon Compte</span>
{/* PASTILLE CRÉDITS — noir, chiffre bleu + diamant, sans le mot "crédits" */}
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: '#000', borderRadius: '999px',
            padding: '4px 12px',
            fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
            fontWeight: 700, color: '#4db8ff',
            boxShadow: '0 0 8px rgba(77,184,255,0.3)'
          }}>
            {credits} 💎
          </span>

          <button onClick={logout} style={{
            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.3)',
            color: '#000', padding: '6px 14px', fontFamily: 'Cinzel, serif',
            fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase',
            cursor: 'pointer', fontWeight: 700
          }}>Déconnexion</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 66px)', padding: '40px' }}>
        <img src="/logo.png" alt="HéphIAstos" style={{ width: 'min(1040px, 90vw)', marginBottom: '40px', filter: 'drop-shadow(0 0 40px rgba(255,107,26,0.4))' }} />
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '16px', textAlign: 'center'
        }}>Forgez votre histoire !</h1>
        <p style={{
          color: '#7a6a52', fontStyle: 'italic', fontSize: '1.1rem',
          marginBottom: '48px', textAlign: 'center'
        }}>Bienvenue, {user.email}</p>
        <button onClick={() => router.push('/catalogue')} style={{
          background: 'linear-gradient(135deg, #cc4400, #ff6b1a)',
          color: '#000', border: 'none', padding: '16px 48px',
          fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
          letterSpacing: '3px', textTransform: 'uppercase',
          cursor: 'pointer', fontWeight: 700,
          boxShadow: '0 4px 20px rgba(255,107,26,0.4)'
        }}>⚒ Choisir une trame</button>
      </div>
    </div>
  )
}