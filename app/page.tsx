'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar, { Footer } from '@/app/components/Navbar'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
  const [pseudo, setPseudo] = useState<string>('')
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
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (!user) return null

  return (
    <div style={{ background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>

      <Navbar credits={credits} onLogout={logout} activePage="home" />

      {/* HERO */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 40px 40px' }}>
        <img src="/logo.png" alt="HéphIAstos" style={{ width: 'min(360px, 90vw)', marginBottom: '40px', filter: 'drop-shadow(0 0 40px rgba(255,107,26,0.4))' }} />
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '16px', textAlign: 'center'
        }}>Forgez votre histoire !</h1>
        <p style={{
          color: '#7a6a52', fontStyle: 'italic', fontSize: '1.4rem',
          marginBottom: '48px', textAlign: 'center'
        }}>Bienvenue, {pseudo}</p>
        <button onClick={() => router.push('/catalogue')} style={{
          background: 'linear-gradient(135deg, #cc4400, #ff6b1a)',
          color: '#000', border: 'none', padding: '16px 48px',
          fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
          letterSpacing: '3px', textTransform: 'uppercase',
          cursor: 'pointer', fontWeight: 700,
          boxShadow: '0 4px 20px rgba(255,107,26,0.4)'
        }}>⚒ Choisir une trame</button>
      </div>

      <Footer />
    </div>
  )
}