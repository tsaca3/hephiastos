'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.push('/')
    })
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0b08',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#1a1409',
        border: '1px solid rgba(201,146,42,0.2)',
        padding: '40px'
      }}>
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '1.5rem',
          color: '#e8b84b',
          textAlign: 'center',
          marginBottom: '8px'
        }}>HéphIAstos</h1>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.6rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#7a6a52',
          textAlign: 'center',
          marginBottom: '32px'
        }}>Forgez votre histoire</p>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#8b2020',
                  brandAccent: '#a82828',
                  inputBackground: '#0d0b08',
                  inputBorder: 'rgba(201,146,42,0.2)',
                  inputText: '#e8dcc8',
                }
              }
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                link_text: 'Déjà un compte ? Connectez-vous'
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Mot de passe',
                button_label: 'Créer mon compte',
                link_text: 'Pas encore de compte ? Inscrivez-vous'
              }
            }
          }}
          providers={[]}
        />
      </div>
    </div>
  )
}