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
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>

      {/* BANDEAU ORANGE EN HAUT */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '66px',
        background: 'linear-gradient(to top, #ff6600, #ffaa33)',
        boxShadow: '0 2px 20px rgba(255,107,26,0.5)',
        display: 'flex', alignItems: 'center',
        padding: '0 40px', zIndex: 10
      }}>
        <img src="/logo_icon.png" alt="HéphIAstos" style={{ height: '58px' }} />
      </div>

      {/* CARTE FORMULAIRE */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#0d0800',
        border: '1px solid rgba(201,146,42,0.35)',
        boxShadow: '0 0 60px rgba(255,107,26,0.15), 0 0 120px rgba(255,107,26,0.05)',
        padding: '0px 40px 48px',
        marginTop: '66px'
      }}>

        {/* LOGO */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0px' }}>
          <img
            src="/logo.png"
            alt="HéphIAstos"
            style={{
              width: '440px',
              filter: 'drop-shadow(0 0 30px rgba(255,107,26,0.5))'
            }}
          />
        </div>

        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.8rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#7a6a52',
          textAlign: 'center',
          marginBottom: '8px'
        }}>Forgez votre histoire</p>

        {/* PHRASE ÉPIQUE */}
        <p style={{
          fontFamily: 'Crimson Text, serif',
          fontSize: '1.15rem',
          fontStyle: 'italic',
          color: '#cc7700',
          textAlign: 'center',
          marginBottom: '36px',
          lineHeight: '1.6',
          borderTop: '1px solid rgba(201,146,42,0.2)',
          borderBottom: '1px solid rgba(201,146,42,0.2)',
          padding: '12px 0'
        }}>
          Chaque grande histoire commence par une étincelle. La vôtre commence ici.<br/> 
        </p>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#cc4400',
                  brandAccent: '#ff6b1a',
                  inputBackground: '#1a0f00',
                  inputBorder: 'rgba(201,146,42,0.3)',
                  inputText: '#e8dcc8',
                  inputLabelText: '#cc7700',
                  inputPlaceholderText: '#7a6a52',
                  anchorTextColor: '#cc7700',
                  anchorTextHoverColor: '#ff6b1a',
                  messageTextDanger: '#ff4444',
                }
              }
            },
            style: {
              button: {
                background: 'linear-gradient(135deg, #cc4400, #ff6b1a)',
                border: 'none',
                color: '#000',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.8rem',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontWeight: 700,
                padding: '14px',
                boxShadow: '0 4px 20px rgba(255,107,26,0.4)',
                cursor: 'pointer'
              },
              input: {
                fontFamily: 'Crimson Text, serif',
                fontSize: '1rem',
                borderRadius: '0',
              },
              label: {
                fontFamily: 'Cinzel, serif',
                fontSize: '0.85rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              },
              anchor: {
                fontFamily: 'Cinzel, serif',
                fontSize: '0.8rem',
                letterSpacing: '1px',
              }
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Mot de passe',
                button_label: 'Entrer dans la forge',
                link_text: 'Déjà forgeron ? Connectez-vous',
                email_input_placeholder: 'votre@email.com',
                password_input_placeholder: '••••••••••'
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Mot de passe',
                button_label: 'Rejoindre la forge',
                link_text: 'Pas encore de compte ? Inscrivez-vous',
                email_input_placeholder: 'votre@email.com',
                password_input_placeholder: '••••••••••'
              },
              forgotten_password: {
                link_text: 'Mot de passe oublié ?',
                button_label: 'Envoyer les instructions',
                email_label: 'Email',
                email_input_placeholder: 'votre@email.com'
              }
            }
          }}
          providers={[]}
        />
      </div>
    </div>
  )
}