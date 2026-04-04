'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/app/components/Navbar'

export default function Demarrer() {
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [trame, setTrame] = useState(null)
  const [prenomProtagoniste, setPrenomProtagoniste] = useState('')
  const [prenomCible, setPrenomCible] = useState('')
  const [erreur, setErreur] = useState('')
  const [hover, setHover] = useState(null)
  const router = useRouter()
  const params = useParams()
  const trameId = params.trame_id

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits) })
    })

    fetch(`/trames/${trameId}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { router.push('/forge'); return }
        // Si la trame n'a pas de prénoms libres, rediriger directement
        if (!data.prenoms_libres) {
          router.push(`/generer/${trameId}`)
          return
        }
        setTrame(data)
      })
      .catch(() => router.push('/forge'))
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleDemarrer = () => {
    const p1 = prenomProtagoniste.trim()
    const p2 = prenomCible.trim()

    if (!p1 || !p2) {
      setErreur('Veuillez saisir les deux prénoms pour commencer.')
      return
    }
    if (p1.length > 20 || p2.length > 20) {
      setErreur('Les prénoms ne peuvent pas dépasser 20 caractères.')
      return
    }

    setErreur('')
    // Passer les prénoms via les query params vers la page de génération
    router.push(`/generer/${trameId}?protagoniste=${encodeURIComponent(p1)}&cible=${encodeURIComponent(p2)}`)
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    background: '#0d0800',
    border: '1px solid rgba(201,146,42,0.3)',
    color: '#e8dcc8',
    fontFamily: 'Crimson Text, serif',
    fontSize: '1.15rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    fontFamily: 'Cinzel, serif',
    fontSize: '0.7rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#7a6a52',
    display: 'block',
    marginBottom: '8px'
  }

  if (!user || !trame) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>

      <Navbar credits={credits} onLogout={logout} activePage="forge" />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 24px' }}>

        {/* IMAGE + TITRE */}
        {trame.image && (
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img
              src={trame.image}
              alt={trame.titre}
              style={{
                width: '160px', height: '160px', objectFit: 'cover',
                border: '1px solid rgba(201,146,42,0.3)',
                boxShadow: '0 0 40px rgba(255,107,26,0.15)'
              }}
            />
          </div>
        )}

        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center', marginBottom: '16px'
        }}>{trame.titre}</h1>

        {trame.description && (
          <p style={{
            fontFamily: 'Crimson Text, serif', fontSize: '1.15rem',
            color: '#a89880', textAlign: 'center', fontStyle: 'italic',
            lineHeight: '1.7', marginBottom: '48px'
          }}>{trame.description}</p>
        )}

        {/* SÉPARATEUR */}
        <div style={{
          borderTop: '1px solid rgba(201,146,42,0.2)',
          marginBottom: '40px'
        }} />

        {/* INTRO */}
        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
          letterSpacing: '2px', textTransform: 'uppercase',
          color: '#e8b84b', textAlign: 'center', marginBottom: '32px'
        }}>
          Avant de commencer, choisissez vos personnages
        </p>

        {/* CHAMPS PRÉNOMS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '40px' }}>

          <div>
            <label style={labelStyle}>Votre prénom — le protagoniste</label>
            <input
              type="text"
              value={prenomProtagoniste}
              onChange={e => setPrenomProtagoniste(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(232,184,75,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(201,146,42,0.3)'}
              placeholder="Ex : Alex, Sam, Jordan..."
              maxLength={20}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Le prénom de la personne à séduire</label>
            <input
              type="text"
              value={prenomCible}
              onChange={e => setPrenomCible(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(232,184,75,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(201,146,42,0.3)'}
              placeholder="Ex : Charlie, Morgan, Léa..."
              maxLength={20}
              style={inputStyle}
            />
          </div>

        </div>

        {/* ERREUR */}
        {erreur && (
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
            color: '#e8445a', textAlign: 'center',
            marginBottom: '24px', letterSpacing: '1px'
          }}>{erreur}</p>
        )}

        {/* NOTE GENRE NEUTRE */}
        <p style={{
          fontFamily: 'Crimson Text, serif', fontSize: '0.95rem',
          color: '#5a4a32', textAlign: 'center', fontStyle: 'italic',
          marginBottom: '40px', lineHeight: '1.6'
        }}>
          L'histoire s'adapte à tous les prénoms — aucun genre n'est imposé.
        </p>

        {/* BOUTON */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleDemarrer}
            onMouseEnter={() => setHover('demarrer')}
            onMouseLeave={() => setHover(null)}
            style={{
              padding: '16px 48px',
              background: hover === 'demarrer'
                ? 'linear-gradient(135deg, #cc4400, #ff6b1a)'
                : 'transparent',
              border: '1px solid rgba(201,146,42,0.4)',
              color: hover === 'demarrer' ? '#000' : '#e8b84b',
              fontFamily: 'Cinzel, serif', fontSize: '0.85rem',
              letterSpacing: '3px', textTransform: 'uppercase',
              cursor: 'pointer', fontWeight: 700,
              transition: 'all 0.3s ease',
              boxShadow: hover === 'demarrer' ? '0 4px 20px rgba(255,107,26,0.4)' : 'none'
            }}>
            ⚒ Forger l'histoire
          </button>
        </div>

      </div>
    </div>
  )
}
