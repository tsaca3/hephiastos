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
      supabase
        .from('profiles')
        .select('credits')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => { if (data) setCredits(data.credits) })
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (!user) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0b08',
      color: '#e8dcc8',
      fontFamily: 'Crimson Text, serif'
    }}>
      <nav style={{
        padding: '0 40px',
        height: '66px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(201,146,42,0.15)',
        background: 'rgba(13,11,8,0.97)'
      }}>
        <span style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '1.1rem',
          color: '#e8b84b'
        }}>HéphIAstos</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.75rem',
            color: '#7dd6ff'
          }}>💎 {credits} crédits</span>
          <button onClick={logout} style={{
            background: 'transparent',
            border: '1px solid rgba(201,146,42,0.2)',
            color: '#7a6a52',
            padding: '6px 14px',
            fontFamily: 'Cinzel, serif',
            fontSize: '0.6rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}>Déconnexion</button>
        </div>
      </nav>

      <div style={{
        textAlign: 'center',
        padding: '100px 40px 60px'
      }}>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.6rem',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          color: '#c9922a',
          marginBottom: '16px'
        }}>⚒ La forge des récits</p>
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(2rem,6vw,5rem)',
          background: 'linear-gradient(135deg,#f5d06e,#c9922a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px'
        }}>HéphIAstos</h1>
        <p style={{
          color: '#7a6a52',
          fontStyle: 'italic',
          fontSize: '1.1rem',
          marginBottom: '40px'
        }}>Bienvenue, {user.email}</p>
        <button onClick={() => router.push('/catalogue')} style={{
          background: 'linear-gradient(135deg,#8b2020,#a82828)',
          color: '#f5d06e',
          border: 'none',
          padding: '14px 40px',
          fontFamily: 'Cinzel, serif',
          fontSize: '0.76rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          cursor: 'pointer'
        }}>⚒ Choisir une trame</button>
      </div>
    </div>
  )
}