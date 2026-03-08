'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Catalogue() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [userCredits, setUserCredits] = useState<number>(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setUserCredits(data.credits) })
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0d0b08', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>
      <nav style={{
        padding: '0 40px', height: '66px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(201,146,42,0.15)',
        background: 'rgba(13,11,8,0.97)'
      }}>
        <span onClick={() => router.push('/')} style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.1rem', color: '#e8b84b', cursor: 'pointer' }}>HéphIAstos</span>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '2px', color: '#c9922a' }}>
          💎 {userCredits} crédits
        </span>
      </nav>

      {/* MODALE CONFIRMATION */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: '#1a1409', border: '1px solid rgba(201,146,42,0.3)',
            padding: '48px 40px', maxWidth: '420px', width: '90%', textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⚒️</div>
            <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.4rem', color: '#e8b84b', marginBottom: '12px' }}>
              Forger cette histoire ?
            </h2>
            <p style={{ color: '#7a6a52', fontStyle: 'italic', marginBottom: '8px', lineHeight: '1.6' }}>
              Bal de Village — Mission séduction
            </p>
            <div style={{
              background: 'rgba(201,146,42,0.06)', border: '1px solid rgba(201,146,42,0.2)',
              padding: '12px', marginBottom: '28px'
            }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '2px', color: '#c9922a' }}>
                💎 1 crédit sera débité · Solde actuel : {userCredits} crédit{userCredits > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowModal(false)} style={{
                background: 'transparent', border: '1px solid rgba(201,146,42,0.2)',
                color: '#7a6a52', padding: '12px 24px', fontFamily: 'Cinzel, serif',
                fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer'
              }}>Annuler</button>
              <button onClick={() => { setShowModal(false); router.push('/generate') }} style={{
                background: 'linear-gradient(135deg,#8b6010,#c9922a)', color: '#0d0b08',
                border: 'none', padding: '12px 24px', fontFamily: 'Cinzel, serif',
                fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer'
              }}>Forger !</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '80px 40px 40px' }}>
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif', fontSize: '2.5rem',
          background: 'linear-gradient(135deg,#f5d06e,#c9922a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px'
        }}>Les Trames</h1>
        <p style={{ color: '#7a6a52', fontStyle: 'italic' }}>
          Choisissez l'univers dans lequel vous allez forger votre récit
        </p>
      </div>

      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '0 48px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px'
      }}>
        <div onClick={() => userCredits > 0 ? setShowModal(true) : router.push('/credits?noCredits=true')} style={{
          background: '#1a1409', border: '1px solid rgba(201,146,42,0.18)',
          cursor: 'pointer', transition: 'all 0.3s', overflow: 'hidden'
        }}>
          <div style={{
            width: '100%', aspectRatio: '1/1',
            background: 'linear-gradient(135deg,#2a1a0a,#1a0a0a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem'
          }}>🏮</div>
          <div style={{ padding: '18px 20px' }}>
            <div style={{
              display: 'inline-block', background: 'rgba(30,100,50,0.35)',
              border: '1px solid #2e7d44', color: '#4caf72', padding: '3px 10px',
              fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '2px',
              textTransform: 'uppercase', marginBottom: '10px'
            }}>❤ Mission séduction</div>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: '#e8dcc8', marginBottom: '8px' }}>Bal de Village</h3>
            <p style={{ color: '#7a6a52', fontSize: '0.86rem', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '12px' }}>
              Parviendrez-vous à conquérir le cœur de Maelis avant que la nuit se termine ?
            </p>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: '1px solid rgba(201,146,42,0.08)', paddingTop: '11px'
            }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a6a52' }}>10 chapitres · 1 crédit</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.92rem', color: '#e8b84b', fontWeight: 700 }}>Gratuite</span>
            </div>
          </div>
        </div>

        {['L\'Épée du Destin', 'Les Profondeurs de Thalarys'].map((titre) => (
          <div key={titre} style={{ background: '#1a1409', border: '1px solid rgba(201,146,42,0.18)', opacity: 0.6 }}>
            <div style={{
              width: '100%', aspectRatio: '1/1',
              background: 'linear-gradient(135deg,#1a1409,#0d0b08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem'
            }}>⏳</div>
            <div style={{ padding: '18px 20px' }}>
              <div style={{
                display: 'inline-block', background: 'rgba(90,55,5,0.4)',
                border: '1px solid #7a5a1a', color: '#c9922a', padding: '3px 10px',
                fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '2px',
                textTransform: 'uppercase', marginBottom: '10px'
              }}>Bientôt</div>
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: '#e8dcc8' }}>{titre}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}