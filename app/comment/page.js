'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Comment() {
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [faqOpen, setFaqOpen] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits) })
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const menuStyle = {
    fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: '#000', cursor: 'pointer', fontWeight: 700
  }

  const faq = [
    {
      q: 'Puis-je forger plusieurs histoires avec la même trame ?',
      r: 'Oui ! Une trame ajoutée à votre forge vous appartient pour toujours. Vous pouvez forger autant d\'histoires que vous voulez avec elle — chacune coûte 1 crédit et sera unique.'
    },
    {
      q: 'Les histoires sont-elles vraiment uniques ?',
      r: 'Absolument. L\'intelligence artificielle génère un texte différent à chaque fois en fonction de vos choix. Deux joueurs faisant les mêmes choix obtiendront des histoires différentes.'
    },
    {
      q: 'Qui possède les droits sur mon histoire ?',
      r: 'Vous, entièrement. Les histoires que vous forgez vous appartiennent. Vous pouvez les publier, les partager ou les monétiser librement. HéphIAstos conserve uniquement une licence pour les utiliser à des fins promotionnelles anonymisées.'
    },
    {
      q: 'Peut-on relire ses anciennes histoires ?',
      r: 'Oui ! Toutes vos histoires forgées sont sauvegardées dans Ma Forge et téléchargeables en PDF à tout moment.'
    },
    {
      q: 'Que se passe-t-il si je manque de crédits ?',
      r: 'Rendez-vous à la Bourse aux Crédits pour acquérir un nouveau pack. Vous avez le choix entre 4 packs selon vos besoins, de 10 à 100 crédits.'
    },
  ]

  if (!user) return null

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
          <span onClick={() => router.push('/credits')} style={menuStyle}>La Bourse aux Crédits</span>
          <span onClick={() => router.push('/compte')} style={menuStyle}>Mon Compte</span>
          <span onClick={() => router.push('/forge')} style={menuStyle}>Ma Forge</span>
          <span onClick={() => router.push('/comment')} style={{ ...menuStyle, color: '#555555' }}>Comment ça marche ?</span>
          <span onClick={() => router.push('/conditions')} style={menuStyle}>Conditions Générales</span>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: '#000', borderRadius: '999px', padding: '9px 20px',
            fontFamily: 'Cinzel, serif', fontSize: '1.2rem', fontWeight: 700, color: '#4db8ff',
            boxShadow: '0 0 20px rgba(77,184,255,0.3)', minWidth: '80px', height: '40px'
          }}>
            {credits} <img src="/diamond.png" alt="crédits" style={{ height: '20px', width: '20px', objectFit: 'contain' }} />
          </span>
          <button onClick={logout} style={{
            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.3)',
            color: '#000', padding: '6px 14px', fontFamily: 'Cinzel, serif',
            fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase',
            cursor: 'pointer', fontWeight: 700
          }}>Déconnexion</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 40px' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: 'clamp(1.7rem, 3vw, 2.7rem)',
            background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '20px'
          }}>Comment ça marche ?</h1>
          <p style={{
            fontFamily: 'Crimson Text, serif', fontSize: '1.3rem',
            color: '#e8dcc8', lineHeight: '1.8', maxWidth: '700px', margin: '0 auto 12px'
          }}>
            HéphIAstos forge vos histoires uniques grâce à l'intelligence artificielle.
          </p>
          <p style={{
            fontFamily: 'Crimson Text, serif', fontSize: '1.1rem', fontStyle: 'italic',
            color: '#7a6a52', maxWidth: '600px', margin: '0 auto'
          }}>
            Chaque choix que vous faites forge une histoire qui n'existera qu'une seule fois.
          </p>
        </div>

        {/* ÉTAPES */}
        {[
          {
            num: '01',
            titre: 'Choisissez votre trame',
            texte: 'Parcourez notre catalogue de trames narratives. Chaque trame est un univers à part entière — romance médiévale, thriller, aventure fantastique... Certaines sont gratuites, d\'autres requièrent des crédits de forge.',
            image: '/comment/etape-1.png',
            reverse: false
          },
          {
            num: '02',
            titre: 'Ajoutez-la à votre forge',
            texte: 'Ajoutez la trame à votre forge personnelle. Elle y restera pour toujours — vous pourrez forger autant d\'histoires différentes que vous le souhaitez avec elle, à tout moment.',
            image: '/comment/etape-2.png',
            reverse: true
          },
          {
            num: '03',
            titre: 'Forgez votre histoire',
            texte: 'Chapitre après chapitre, faites vos choix. Chaque décision oriente l\'histoire dans une direction unique. L\'intelligence artificielle génère votre récit en temps réel, adapté à vos choix.',
            image: '/comment/etape-3.png',
            reverse: false
          },
          {
            num: '04',
            titre: 'Téléchargez votre PDF',
            texte: 'À la fin de l\'aventure, votre histoire complète est sauvegardée dans Ma Forge. Téléchargez-la en PDF à tout moment. Elle vous appartient entièrement — publiez-la, partagez-la, relisez-la.',
            image: '/comment/etape-4.png',
            reverse: true
          }
        ].map((etape, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: etape.reverse ? 'row-reverse' : 'row',
            gap: '60px', alignItems: 'center',
            marginBottom: '80px'
          }}>
            {/* TEXTE */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <span style={{
                  fontFamily: 'Cinzel Decorative, serif', fontSize: '3rem',
                  color: 'rgba(255,107,26,0.2)', lineHeight: 1, fontWeight: 700
                }}>{etape.num}</span>
                <h2 style={{
                  fontFamily: 'Cinzel, serif', fontSize: '1.1rem', letterSpacing: '2px',
                  textTransform: 'uppercase', color: '#e8b84b'
                }}>{etape.titre}</h2>
              </div>
              <div style={{
                width: '40px', height: '2px',
                background: 'linear-gradient(to right, #ff6b1a, transparent)',
                marginBottom: '20px'
              }} />
              <p style={{
                fontFamily: 'Crimson Text, serif', fontSize: '1.15rem',
                color: '#a89880', lineHeight: '1.8'
              }}>{etape.texte}</p>
            </div>

            {/* IMAGE */}
            <div style={{ flex: 1 }}>
              <div style={{
                border: '1px solid rgba(201,146,42,0.2)',
                overflow: 'hidden',
                boxShadow: '0 0 40px rgba(255,107,26,0.1)'
              }}>
                <img
                  src={etape.image}
                  alt={etape.titre}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentNode.style.background = '#0d0800'
                    e.target.parentNode.style.minHeight = '200px'
                    e.target.parentNode.style.display = 'flex'
                    e.target.parentNode.style.alignItems = 'center'
                    e.target.parentNode.style.justifyContent = 'center'
                    e.target.parentNode.innerHTML = `<p style="font-family:Cinzel,serif;font-size:0.7rem;letter-spacing:2px;color:#7a6a52;text-transform:uppercase">Screenshot à venir</p>`
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* SECTION CRÉDITS */}
        <div style={{
          background: '#0d0800',
          border: '1px solid rgba(201,146,42,0.2)',
          padding: '48px', marginBottom: '80px',
          boxShadow: '0 0 40px rgba(255,107,26,0.05)'
        }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif', fontSize: '1.1rem', letterSpacing: '3px',
            textTransform: 'uppercase', color: '#e8b84b',
            textAlign: 'center', marginBottom: '40px'
          }}>💎 Comment fonctionnent les crédits ?</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              {
                titre: 'Crédits offerts',
                valeur: '100',
                texte: 'À l\'inscription, vous recevez 100 crédits offerts pour découvrir la plateforme.'
              },
              {
                titre: 'Forger une histoire',
                valeur: '1',
                texte: 'Chaque histoire forgée coûte 1 crédit, quel que soit le nombre de chapitres.'
              },
              {
                titre: 'Acquérir une trame',
                valeur: '0 à X',
                texte: 'Les trames gratuites sont accessibles sans crédits. Les trames premium requièrent des crédits.'
              }
            ].map((item, i) => (
              <div key={i} style={{
                textAlign: 'center',
                borderRight: i < 2 ? '1px solid rgba(201,146,42,0.15)' : 'none',
                paddingRight: i < 2 ? '32px' : '0'
              }}>
                <p style={{
                  fontFamily: 'Cinzel Decorative, serif', fontSize: '2.5rem',
                  color: '#ff6b1a', marginBottom: '8px', lineHeight: 1
                }}>{item.valeur}</p>
                <p style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: '#e8b84b', marginBottom: '12px'
                }}>{item.titre}</p>
                <p style={{
                  fontFamily: 'Crimson Text, serif', fontSize: '1rem',
                  color: '#7a6a52', lineHeight: '1.6'
                }}>{item.texte}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button onClick={() => router.push('/credits')} style={{
              background: 'transparent',
              border: '1px solid rgba(201,146,42,0.3)',
              color: '#c9922a', padding: '12px 32px',
              fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
              letterSpacing: '2px', textTransform: 'uppercase',
              cursor: 'pointer', fontWeight: 700
            }}>
              Voir la Bourse aux Crédits →
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif', fontSize: '1.1rem', letterSpacing: '3px',
            textTransform: 'uppercase', color: '#e8b84b',
            textAlign: 'center', marginBottom: '40px'
          }}>Questions fréquentes</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faq.map((item, i) => (
              <div key={i} style={{
                background: '#0d0800',
                border: faqOpen === i
                  ? '1px solid rgba(255,107,26,0.4)'
                  : '1px solid rgba(201,146,42,0.2)',
                transition: 'all 0.3s ease'
              }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{
                    width: '100%', padding: '20px 24px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: '0.85rem',
                    letterSpacing: '1px', color: '#e8dcc8', fontWeight: 700
                  }}>{item.q}</span>
                  <span style={{
                    color: '#ff6b1a', fontSize: '1.2rem', flexShrink: 0, marginLeft: '16px'
                  }}>{faqOpen === i ? '−' : '+'}</span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: '0 24px 20px' }}>
                    <p style={{
                      fontFamily: 'Crimson Text, serif', fontSize: '1.05rem',
                      color: '#a89880', lineHeight: '1.8'
                    }}>{item.r}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center',
          borderTop: '1px solid rgba(201,146,42,0.15)',
          paddingTop: '60px'
        }}>
          <h2 style={{
            fontFamily: 'Cinzel Decorative, serif', fontSize: '1.8rem',
            color: '#e8b84b', marginBottom: '16px'
          }}>Prêt à forger votre légende ?</h2>
          <p style={{
            fontFamily: 'Crimson Text, serif', fontSize: '1.1rem', fontStyle: 'italic',
            color: '#7a6a52', marginBottom: '32px'
          }}>Vous avez {credits} crédits disponibles — votre première histoire n'attend que vous.</p>
          <button onClick={() => router.push('/catalogue')} style={{
            background: 'linear-gradient(135deg, #cc4400, #ff6b1a)',
            border: 'none', color: '#000', padding: '16px 48px',
            fontFamily: 'Cinzel, serif', fontSize: '0.8rem',
            letterSpacing: '3px', textTransform: 'uppercase',
            cursor: 'pointer', fontWeight: 700,
            boxShadow: '0 4px 20px rgba(255,107,26,0.4)'
          }}>⚒ Commencer à forger</button>
        </div>

      </div>
    </div>
  )
}