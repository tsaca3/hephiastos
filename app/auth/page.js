'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
  // Vérification initiale
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) router.push('/')
  })

  // Écoute la connexion en temps réel
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') router.push('/')
  })

  return () => subscription.unsubscribe()
}, [])

  const handleLogin = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou mot de passe incorrect.')
    setLoading(false)
  }

  const handleRegister = async () => {
    setLoading(true); setError('')
    if (!pseudo.trim()) { setError('Veuillez choisir un pseudo.'); setLoading(false); return }
    if (pseudo.length < 3) { setError('Le pseudo doit faire au moins 3 caractères.'); setLoading(false); return }

    // Vérifier si le pseudo est déjà pris
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', pseudo.trim()).single()
    if (existing) { setError('Ce pseudo est déjà pris, choisissez-en un autre.'); setLoading(false); return }

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    // Sauvegarder le pseudo dans profiles
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: pseudo.trim(),
        credits: 100
      })
    }
    setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
    setLoading(false)
  }

  const handleForgot = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setError('Erreur lors de l\'envoi. Vérifiez votre email.')
    else setSuccess('Instructions envoyées ! Vérifiez votre boîte mail.')
    setLoading(false)
  }

  // Styles réutilisables
  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: '#1a0f00', border: '1px solid rgba(201,146,42,0.3)',
    color: '#e8dcc8', fontFamily: 'Crimson Text, serif', fontSize: '1rem',
    outline: 'none', boxSizing: 'border-box', marginTop: '6px'
  }
  const labelStyle = {
    fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
    letterSpacing: '2px', textTransform: 'uppercase', color: '#cc7700',
    display: 'block', marginTop: '16px'
  }
  const btnStyle = {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #cc4400, #ff6b1a)',
    border: 'none', color: '#000',
    fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
    letterSpacing: '3px', textTransform: 'uppercase',
    fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(255,107,26,0.4)',
    marginTop: '24px', opacity: loading ? 0.7 : 1
  }
  const linkStyle = {
    fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
    letterSpacing: '1px', color: '#cc7700',
    cursor: 'pointer', textDecoration: 'underline',
    background: 'none', border: 'none'
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#000000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>

      {/* BANDEAU */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '66px',
        background: 'linear-gradient(to top, #ff6600, #ffaa33)',
        boxShadow: '0 2px 20px rgba(255,107,26,0.5)',
        display: 'flex', alignItems: 'center', padding: '0 40px', zIndex: 10
      }}>
        <img src="/logo_icon.png" alt="HéphIAstos" style={{ height: '58px' }} />
      </div>

      {/* CARTE */}
      <div style={{
        width: '100%', maxWidth: '460px',
        background: '#0d0800',
        border: '1px solid rgba(201,146,42,0.35)',
        boxShadow: '0 0 60px rgba(255,107,26,0.15)',
        padding: '0px 40px 48px',
        marginTop: '66px'
      }}>

        {/* LOGO */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/logo.png" alt="HéphIAstos" style={{
            width: '440px',
            filter: 'drop-shadow(0 0 30px rgba(255,107,26,0.5))'
          }} />
        </div>

        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.8rem', letterSpacing: '3px',
          textTransform: 'uppercase', color: '#7a6a52', textAlign: 'center', marginBottom: '8px'
        }}>Forgez votre histoire</p>

        <p style={{
          fontFamily: 'Crimson Text, serif', fontSize: '1.15rem', fontStyle: 'italic',
          color: '#cc7700', textAlign: 'center', marginBottom: '28px', lineHeight: '1.6',
          borderTop: '1px solid rgba(201,146,42,0.2)', borderBottom: '1px solid rgba(201,146,42,0.2)',
          padding: '12px 0'
        }}>
          Chaque grande histoire commence par une étincelle. La vôtre commence ici.<br />
        </p>

        {/* MESSAGES */}
        {error && <p style={{ color: '#ff4444', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
        {success && <p style={{ color: '#44cc44', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', textAlign: 'center', marginBottom: '12px' }}>{success}</p>}

        {/* FORMULAIRE CONNEXION */}
        {mode === 'login' && (
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" />
            <label style={labelStyle}>Mot de passe</label>
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" />
            <button style={btnStyle} onClick={handleLogin} disabled={loading}>
              {loading ? 'Connexion...' : 'Entrer dans la forge'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button style={linkStyle} onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}>Mot de passe oublié ?</button>
              <button style={linkStyle} onClick={() => { setMode('register'); setError(''); setSuccess('') }}>Pas de compte ? Inscrivez-vous</button>
            </div>
          </div>
        )}

        {/* FORMULAIRE INSCRIPTION */}
        {mode === 'register' && (
          <div>
            <label style={labelStyle}>Pseudo</label>
            <input style={inputStyle} type="text" value={pseudo} onChange={e => setPseudo(e.target.value)} placeholder="VotreNomDeForgeron" />
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" />
            <label style={labelStyle}>Mot de passe</label>
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" />
            <button style={btnStyle} onClick={handleRegister} disabled={loading}>
              {loading ? 'Création...' : 'Rejoindre la forge'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button style={linkStyle} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>Déjà forgeron ? Connectez-vous</button>
            </div>
          </div>
        )}

        {/* FORMULAIRE MOT DE PASSE OUBLIÉ */}
        {mode === 'forgot' && (
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" />
            <button style={btnStyle} onClick={handleForgot} disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer les instructions'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button style={linkStyle} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>← Retour à la connexion</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}