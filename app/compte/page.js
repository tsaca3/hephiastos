'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar, { Footer } from '@/app/components/Navbar'

export default function Compte() {
  const [user, setUser] = useState(null)
  const [pseudo, setPseudo] = useState('')
  const [credits, setCredits] = useState(0)
  const [nbTrames, setNbTrames] = useState(0)
  const [nbHistoires, setNbHistoires] = useState(0)
  const [dateInscription, setDateInscription] = useState('')
  const [message, setMessage] = useState(null)
  const [popupSupprimer, setPopupSupprimer] = useState(false)
  const [hover, setHover] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      setDateInscription(new Date(session.user.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      }))

      supabase.from('profiles').select('credits, username').eq('id', session.user.id).single()
        .then(({ data }) => {
          if (data) {
            setCredits(data.credits)
            setPseudo(data.username || session.user.email)
          }
        })

      supabase.from('forge').select('id', { count: 'exact' }).eq('user_id', session.user.id)
        .then(({ count }) => { if (count !== null) setNbTrames(count) })

      supabase.from('stories').select('id', { count: 'exact' }).eq('user_id', session.user.id)
        .then(({ count }) => { if (count !== null) setNbHistoires(count) })
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email)
    if (error) {
      showMessage('Erreur lors de l\'envoi de l\'email.', 'error')
    } else {
      showMessage('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.', 'success')
    }
  }

  const handleSupprimerCompte = async () => {
    try {
      await supabase.from('forge').delete().eq('user_id', user.id)
      await supabase.from('stories').delete().eq('user_id', user.id)
      await supabase.from('profiles').delete().eq('id', user.id)
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      showMessage('Erreur lors de la suppression du compte.', 'error')
    }
  }

  const sectionStyle = {
    background: '#0d0800',
    border: '1px solid rgba(201,146,42,0.2)',
    padding: '32px', marginBottom: '32px'
  }

  const labelStyle = {
    fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: '#7a6a52', marginBottom: '6px', display: 'block'
  }

  const valueStyle = {
    fontFamily: 'Crimson Text, serif', fontSize: '1.2rem',
    color: '#e8dcc8', marginBottom: '20px'
  }

  const sectionTitleStyle = {
    fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '3px',
    textTransform: 'uppercase', color: '#e8b84b',
    marginBottom: '24px', paddingBottom: '12px',
    borderBottom: '1px solid rgba(201,146,42,0.2)'
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif', display: 'flex', flexDirection: 'column' }}>

      <Navbar credits={credits} onLogout={logout} activePage="compte" />

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

      {popupSupprimer && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: '#0d0800', border: '1px solid rgba(232,68,90,0.4)',
            padding: '40px', maxWidth: '460px', width: '90%',
            boxShadow: '0 0 60px rgba(232,68,90,0.1)'
          }}>
            <h2 style={{
              fontFamily: 'Cinzel Decorative, serif', fontSize: '1.2rem',
              color: '#e8445a', marginBottom: '16px', textAlign: 'center'
            }}>Supprimer mon compte</h2>
            <p style={{
              fontFamily: 'Crimson Text, serif', fontSize: '1.15rem',
              color: '#a89880', textAlign: 'center', marginBottom: '12px', lineHeight: '1.6'
            }}>
              Cette action est <span style={{ color: '#e8445a', fontWeight: 700 }}>irréversible</span>.<br />
              Toutes vos trames et histoires seront définitivement supprimées.
            </p>
            <p style={{
              fontFamily: 'Crimson Text, serif', fontSize: '1.15rem',
              color: '#a89880', textAlign: 'center', marginBottom: '32px', lineHeight: '1.6'
            }}>
              Êtes-vous certain de vouloir quitter la forge pour toujours ?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => setPopupSupprimer(false)} style={{
                padding: '12px 32px', background: 'transparent',
                border: '1px solid rgba(201,146,42,0.3)', color: '#7a6a52',
                fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer'
              }}>Annuler</button>
              <button onClick={handleSupprimerCompte} style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #8b0000, #e8445a)',
                border: 'none', color: '#fff',
                fontFamily: 'Cinzel, serif', fontSize: '0.9rem',
                letterSpacing: '2px', textTransform: 'uppercase',
                cursor: 'pointer', fontWeight: 700
              }}>Supprimer définitivement</button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div style={{ flex: 1, padding: '60px 40px' }}>

        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(1.7rem, 3vw, 2.7rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center', marginBottom: '12px'
        }}>Mon Compte</h1>

        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.9rem', letterSpacing: '3px',
          textTransform: 'uppercase', color: '#7a6a52',
          textAlign: 'center', marginBottom: '60px'
        }}>Forgeron de légende</p>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '32px', alignItems: 'start'
        }}>
          <div>
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Informations personnelles</h2>
              <span style={labelStyle}>Pseudo</span>
              <p style={valueStyle}>{pseudo}</p>
              <span style={labelStyle}>Email</span>
              <p style={valueStyle}>{user.email}</p>
              <span style={labelStyle}>Membre depuis</span>
              <p style={{ ...valueStyle, marginBottom: '0' }}>{dateInscription}</p>
            </div>

            <div style={{ ...sectionStyle, border: '1px solid rgba(232,68,90,0.2)', marginBottom: '0' }}>
              <h2 style={{ ...sectionTitleStyle, color: '#e8445a', borderBottom: '1px solid rgba(232,68,90,0.15)' }}>Zone de danger</h2>
              <p style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1rem',
                color: '#7a6a52', fontStyle: 'italic', marginBottom: '20px'
              }}>
                La suppression de votre compte est définitive et irréversible. Toutes vos trames et histoires seront perdues.
              </p>
              <button
                onClick={() => setPopupSupprimer(true)}
                onMouseEnter={() => setHover('supprimer')}
                onMouseLeave={() => setHover(null)}
                style={{
                  padding: '12px 32px',
                  background: hover === 'supprimer' ? 'linear-gradient(135deg, #8b0000, #e8445a)' : 'transparent',
                  border: '1px solid rgba(232,68,90,0.3)',
                  color: hover === 'supprimer' ? '#fff' : '#e8445a',
                  fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: 'pointer', fontWeight: 700, transition: 'all 0.3s ease'
                }}>
                Supprimer mon compte
              </button>
            </div>
          </div>

          <div>
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Sécurité</h2>
              <p style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1rem',
                color: '#7a6a52', fontStyle: 'italic', marginBottom: '20px'
              }}>
                Vous recevrez un email pour réinitialiser votre mot de passe.
              </p>
              <button
                onClick={handleResetPassword}
                onMouseEnter={() => setHover('reset')}
                onMouseLeave={() => setHover(null)}
                style={{
                  padding: '12px 32px',
                  background: hover === 'reset' ? 'linear-gradient(135deg, #cc4400, #ff6b1a)' : 'transparent',
                  border: '1px solid rgba(201,146,42,0.3)',
                  color: hover === 'reset' ? '#000' : '#c9922a',
                  fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: 'pointer', fontWeight: 700, transition: 'all 0.3s ease'
                }}>
                Changer mon mot de passe
              </button>
            </div>

            <div style={{ ...sectionStyle, marginBottom: '0' }}>
              <h2 style={sectionTitleStyle}>Ma Forge en chiffres</h2>
              <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{
                    fontFamily: 'Cinzel Decorative, serif', fontSize: '3rem',
                    color: '#ff6b1a', marginBottom: '8px', lineHeight: 1
                  }}>{nbTrames}</p>
                  <p style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                    letterSpacing: '2px', textTransform: 'uppercase', color: '#7a6a52'
                  }}>Trames possédées</p>
                </div>
                <div style={{ width: '1px', background: 'rgba(201,146,42,0.2)' }} />
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{
                    fontFamily: 'Cinzel Decorative, serif', fontSize: '3rem',
                    color: '#ff6b1a', marginBottom: '8px', lineHeight: 1
                  }}>{nbHistoires}</p>
                  <p style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                    letterSpacing: '2px', textTransform: 'uppercase', color: '#7a6a52'
                  }}>Histoires forgées</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}