'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PACKS = [
  { id: 'price_1T8NClCzapu2pX6h2lFTVWtX', credits: 10, price: '5', pricePerCredit: '0.50' },
  { id: 'price_1T8NDbCzapu2pX6h8c4t9uUU', credits: 20, price: '9', pricePerCredit: '0.45', popular: true },
  { id: 'price_1T8NEACzapu2pX6h4DH5UI5C', credits: 50, price: '20', pricePerCredit: '0.40' },
  { id: 'price_1T8NEmCzapu2pX6hwXhk8BsV', credits: 100, price: '35', pricePerCredit: '0.35' },
]

export default function Credits() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [userCredits, setUserCredits] = useState<number>(0)
  const [userId, setUserId] = useState<string>('')
  const success = searchParams.get('success')
  const cancelled = searchParams.get('cancelled')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUserId(session.user.id)
      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setUserCredits(data.credits) })
    })
  }, [])

  const handlePurchase = async (priceId: string) => {
    setLoading(priceId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0b08', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>
      <nav style={{
        padding: '0 40px', height: '66px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(201,146,42,0.15)',
        background: 'rgba(13,11,8,0.97)', position: 'sticky', top: 0, zIndex: 10
      }}>
        <span style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1rem', color: '#e8b84b', cursor: 'pointer' }}
          onClick={() => router.push('/')}>HéphIAstos</span>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '2px', color: '#c9922a' }}>
          💎 {userCredits} crédits
        </span>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 40px' }}>

        {success && (
          <div style={{ background: 'rgba(126,200,126,0.1)', border: '1px solid rgba(126,200,126,0.3)', padding: '16px 24px', marginBottom: '32px', textAlign: 'center' }}>
            <span style={{ color: '#7ec87e', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '2px' }}>
              ✓ PAIEMENT RÉUSSI — Vos crédits ont été ajoutés !
            </span>
          </div>
        )}

        {cancelled && (
          <div style={{ background: 'rgba(232,68,90,0.06)', border: '1px solid rgba(232,68,90,0.2)', padding: '16px 24px', marginBottom: '32px', textAlign: 'center' }}>
            <span style={{ color: '#e8445a', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '2px' }}>
              Paiement annulé
            </span>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '2.2rem', color: '#e8b84b', marginBottom: '12px' }}>
            Forge de Crédits
          </h1>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#7a6a52' }}>
            Chaque crédit forge une histoire unique
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {PACKS.map(pack => (
            <div key={pack.id} style={{
              background: pack.popular ? 'rgba(201,146,42,0.06)' : 'rgba(255,255,255,0.017)',
              border: `1px solid ${pack.popular ? '#c9922a' : 'rgba(201,146,42,0.15)'}`,
              padding: '32px 24px', textAlign: 'center', position: 'relative'
            }}>
              {pack.popular && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: '#c9922a', color: '#0d0b08', padding: '4px 16px',
                  fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '2px', textTransform: 'uppercase'
                }}>Populaire</div>
              )}
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💎</div>
              <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.8rem', color: '#e8b84b', marginBottom: '4px' }}>
                {pack.credits}
              </div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#7a6a52', marginBottom: '16px' }}>
                crédits
              </div>
              <div style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.5rem', color: '#e8dcc8', marginBottom: '4px' }}>
                {pack.price}€
              </div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.55rem', color: '#7a6a52', marginBottom: '24px' }}>
                {pack.pricePerCredit}€ / crédit
              </div>
              <button onClick={() => handlePurchase(pack.id)} disabled={loading === pack.id} style={{
                background: pack.popular ? 'linear-gradient(135deg,#8b6010,#c9922a)' : 'transparent',
                border: `1px solid ${pack.popular ? '#c9922a' : 'rgba(201,146,42,0.3)'}`,
                color: pack.popular ? '#0d0b08' : '#c9922a',
                padding: '12px 24px', width: '100%',
                fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '2px',
                textTransform: 'uppercase', cursor: 'pointer'
              }}>
                {loading === pack.id ? '...' : 'Acheter'}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: '#7a6a52', marginTop: '32px', letterSpacing: '1px' }}>
          Paiement sécurisé par Stripe · Crédits ajoutés instantanément
        </p>
      </div>
    </div>
  )
}
