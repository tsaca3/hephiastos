'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PACKS = [
  { id: 'price_1T8jf6Czapu2pX6hOplp2eN4', credits: 10, price: '5', pricePerCredit: '0.50', image: '/packs/pack-10.png', nom: 'L\'Étincelle' },
  { id: 'price_1T8jfWCzapu2pX6h23jhIj7x', credits: 20, price: '9', pricePerCredit: '0.45', image: '/packs/pack-20.png', nom: 'La Flamme' },
  { id: 'price_1T8jgICzapu2pX6hRBmF94s5', credits: 50, price: '20', pricePerCredit: '0.40', image: '/packs/pack-50.png', nom: 'Le Brasier' },
  { id: 'price_1T8jh3Czapu2pX6hvYvl0oV0', credits: 100, price: '35', pricePerCredit: '0.35', image: '/packs/pack-100.png', nom: 'La Forge' },
]

function CreditsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(null)
  const [userCredits, setUserCredits] = useState(0)
  const [hover, setHover] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setUserCredits(data.credits) })
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handlePurchase = async (priceId) => {
    setLoading(priceId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUserId = session?.user.id
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: currentUserId })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      setLoading(null)
    }
  }

  const menuStyle = {
    fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: '#000', cursor: 'pointer', fontWeight: 700
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>

      {/* BANDEAU */}
      <nav style={{
        padding: '0 40px', height: '66px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to top, #ff6600, #ffaa33)',
        boxShadow: '0 2px 20px rgba(255,107,26,0.5)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <img src="/logo_icon.png" alt="HéphIAstos" style={{ height: '58px', cursor: 'pointer' }} onClick={() => router.push('/')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '56px' }}>
          <span onClick={() => router.push('/catalogue')} style={menuStyle}>Les Trames</span>
          <span onClick={() => router.push('/credits')} style={{ ...menuStyle, color: '#555555' }}>Forge de Crédits</span>
          <span onClick={() => router.push('/compte')} style={menuStyle}>Mon Compte</span>
          <span onClick={() => router.push('/forge')} style={menuStyle}>Ma Forge</span>
          <span onClick={() => router.push('/conditions')} style={menuStyle}>Conditions Générales</span>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: '#000', borderRadius: '999px', padding: '9px 20px',
            fontFamily: 'Cinzel, serif', fontSize: '1.2rem', fontWeight: 700, color: '#4db8ff',
            boxShadow: '0 0 20px rgba(77,184,255,0.3)', minWidth: '80px', height: '40px'
          }}>
            {userCredits} <img src="/diamond.png" alt="crédits" style={{ height: '20px', width: '20px', objectFit: 'contain' }} />
          </span>
          <button onClick={logout} style={{
            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.3)',
            color: '#000', padding: '6px 14px', fontFamily: 'Cinzel, serif',
            fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase',
            cursor: 'pointer', fontWeight: 700
          }}>Déconnexion</button>
        </div>
      </nav>

      {/* CONTENU */}
      <div style={{ padding: '60px 80px' }}>

        {/* MESSAGES */}
        {searchParams.get('success') && (
          <div style={{
            background: 'rgba(126,200,126,0.1)', border: '1px solid rgba(126,200,126,0.3)',
            padding: '16px 24px', marginBottom: '40px', textAlign: 'center'
          }}>
            <span style={{ color: '#7ec87e', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '2px' }}>
              ✓ PAIEMENT RÉUSSI — Vos crédits ont été ajoutés !
            </span>
          </div>
        )}
        {searchParams.get('cancelled') && (
          <div style={{
            background: 'rgba(232,68,90,0.06)', border: '1px solid rgba(232,68,90,0.2)',
            padding: '16px 24px', marginBottom: '40px', textAlign: 'center'
          }}>
            <span style={{ color: '#e8445a', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '2px' }}>
              Paiement annulé
            </span>
          </div>
        )}
        {searchParams.get('noCredits') && (
          <div style={{
            background: 'rgba(232,68,90,0.06)', border: '1px solid rgba(232,68,90,0.2)',
            padding: '16px 24px', marginBottom: '40px', textAlign: 'center'
          }}>
            <span style={{ color: '#e8445a', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '2px' }}>
              Vous n'avez plus de crédits — forgez-en pour continuer !
            </span>
          </div>
        )}

        {/* TITRE */}
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center', marginBottom: '12px'
        }}>Forge de Crédits</h1>

        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '3px',
          textTransform: 'uppercase', color: '#7a6a52',
          textAlign: 'center', marginBottom: '60px'
        }}>Chaque crédit forge une histoire unique</p>

        {/* GRILLE PACKS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {PACKS.map(pack => (
            <div
              key={pack.id}
              onMouseEnter={() => setHover(pack.id)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: '#0d0800',
                border: hover === pack.id
                  ? '1px solid rgba(255,107,26,0.6)'
                  : '1px solid rgba(201,146,42,0.2)',
                transition: 'all 0.3s ease',
                boxShadow: hover === pack.id
                  ? '0 0 30px rgba(255,107,26,0.2)'
                  : '0 0 10px rgba(0,0,0,0.5)',
                transform: hover === pack.id ? 'translateY(-4px)' : 'translateY(0)'
              }}
            >
              {/* IMAGE */}
              <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}>
                <img
                  src={pack.image}
                  alt={pack.nom}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    transform: hover === pack.id ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
              </div>

              {/* INFOS */}
              <div style={{ padding: '20px' }}>

                {/* NOM DU PACK */}
                <h2 style={{
                  fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem',
                  color: '#e8b84b', marginBottom: '12px', textAlign: 'center'
                }}>{pack.nom}</h2>

                {/* CRÉDITS */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '2rem',
                    fontWeight: 700, color: '#4db8ff'
                  }}>{pack.credits}</span>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    color: '#7a6a52', marginLeft: '6px'
                  }}>crédits</span>
                </div>

                {/* PRIX */}
                <div style={{
                  borderTop: '1px solid rgba(201,146,42,0.2)',
                  borderBottom: '1px solid rgba(201,146,42,0.2)',
                  padding: '10px 0', marginBottom: '16px', textAlign: 'center'
                }}>
                  <span style={{
                    fontFamily: 'Cinzel Decorative, serif', fontSize: '1.4rem', color: '#e8dcc8'
                  }}>{pack.price}€</span>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.55rem',
                    color: '#7a6a52', display: 'block', marginTop: '2px', letterSpacing: '1px'
                  }}>{pack.pricePerCredit}€ / crédit</span>
                </div>

                {/* BOUTON */}
                <button
                  onClick={() => handlePurchase(pack.id)}
                  disabled={loading === pack.id}
                  style={{
                    width: '100%', padding: '12px',
                    background: hover === pack.id
                      ? 'linear-gradient(135deg, #cc4400, #ff6b1a)'
                      : 'transparent',
                    border: '1px solid rgba(201,146,42,0.3)',
                    color: hover === pack.id ? '#000' : '#c9922a',
                    fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    cursor: 'pointer', fontWeight: 700,
                    transition: 'all 0.3s ease',
                    boxShadow: hover === pack.id ? '0 4px 20px rgba(255,107,26,0.4)' : 'none'
                  }}
                >
                  {loading === pack.id ? 'Forge en cours...' : '⚒ Forger'}
                </button>

              </div>
            </div>
          ))}
        </div>

        <p style={{
          textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
          color: '#7a6a52', marginTop: '48px', letterSpacing: '1px'
        }}>
          Paiement sécurisé par Stripe · Crédits ajoutés instantanément
        </p>

      </div>
    </div>
  )
}

export default function Credits() {
  return (
    <Suspense fallback={<div style={{ background: '#000000', minHeight: '100vh' }} />}>
      <CreditsContent />
    </Suspense>
  )
}