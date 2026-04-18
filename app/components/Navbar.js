'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(to top, #ff6600, #ffaa33)',
      padding: '16px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '32px', flexWrap: 'wrap',
      boxShadow: '0 -2px 20px rgba(255,107,26,0.3)'
    }}>

      {/* INSTAGRAM */}
      <a href="https://www.instagram.com/hephiastos.store" target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px', background: 'rgba(0,0,0,0.15)',
          borderRadius: '50%', cursor: 'pointer', transition: 'background 0.3s ease', textDecoration: 'none' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#000000">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </a>

      {/* TIKTOK */}
      <a href="https://www.tiktok.com/@hephiastos.store" target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px', background: 'rgba(0,0,0,0.15)',
          borderRadius: '50%', cursor: 'pointer', transition: 'background 0.3s ease', textDecoration: 'none' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#000000">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
        </svg>
      </a>

      {/* SÉPARATEUR */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.2)' }} />

      {/* EMAIL */}
      <a href="mailto:contact@hephiastos.store"
        style={{ display: 'flex', alignItems: 'center', gap: '8px',
          textDecoration: 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px', background: 'rgba(0,0,0,0.15)', borderRadius: '50%' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem',
          letterSpacing: '1px', color: '#000000' }}>
          contact@hephiastos.store
        </span>
      </a>

      {/* SÉPARATEUR */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.2)' }} />

      {/* COPYRIGHT */}
      <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
        letterSpacing: '2px', textTransform: 'uppercase',
        color: '#000000', margin: '0'
      }}>© 2026 HéphIAstos</p>

    </footer>
  )
}

export default function Navbar({ credits, onLogout, activePage }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  const menuStyle = (page) => ({
    fontFamily: 'Cinzel, serif',
    fontSize: isMobile ? '1rem' : '1rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: activePage === page ? '#555555' : '#000',
    cursor: 'pointer',
    fontWeight: 700,
    padding: isMobile ? '14px 0' : '0',
    borderBottom: isMobile ? '1px solid rgba(0,0,0,0.1)' : 'none',
    display: 'block',
    width: '100%',
  })

  const navItems = [
    { label: 'Comment ça marche ?', page: 'comment', path: '/comment' },
    { label: 'Les Trames', page: 'catalogue', path: '/catalogue' },
    { label: 'La Bourse aux Crédits', page: 'credits', path: '/credits' },
    { label: 'Mon Compte', page: 'compte', path: '/compte' },
    { label: 'Ma Forge', page: 'forge', path: '/forge' },
    { label: 'Conditions Générales', page: 'conditions', path: '/conditions' },
  ]

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <nav style={{
        padding: isMobile ? '0 16px' : '0 40px',
        height: '66px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to top, #ff6600, #ffaa33)',
        boxShadow: '0 2px 20px rgba(255,107,26,0.5)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>

        {/* LOGO */}
        <img
          src="/logo_icon.png"
          alt="HéphIAstos"
          style={{ height: '58px', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => router.push('/')}
        />

        {/* DESKTOP : liens normaux */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '56px' }}>
            {navItems.map(item => (
              <span key={item.page} onClick={() => router.push(item.path)} style={menuStyle(item.page)}>
                {item.label}
              </span>
            ))}
            {/* Crédits */}
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: '#000', borderRadius: '999px', padding: '9px 20px',
              fontFamily: 'Cinzel, serif', fontSize: '1.2rem', fontWeight: 700, color: '#4db8ff',
              boxShadow: '0 0 20px rgba(77,184,255,0.3)', minWidth: '80px', height: '40px'
            }}>
              {credits} <img src="/diamond.png" alt="crédits" style={{ height: '20px', width: '20px', objectFit: 'contain' }} />
            </span>
            <button onClick={onLogout} style={{
              background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.3)',
              color: '#000', padding: '6px 14px', fontFamily: 'Cinzel, serif',
              fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase',
              cursor: 'pointer', fontWeight: 700
            }}>Déconnexion</button>
          </div>
        )}

        {/* MOBILE : crédits + burger */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Compteur crédits compact */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: '#000', borderRadius: '999px', padding: '6px 14px',
              fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 700, color: '#4db8ff',
              boxShadow: '0 0 12px rgba(77,184,255,0.3)',
            }}>
              {credits} <img src="/diamond.png" alt="crédits" style={{ height: '18px', width: '18px', objectFit: 'contain' }} />
            </span>

            {/* Bouton hamburger */}
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o) }}
              style={{
                background: 'rgba(0,0,0,0.15)', border: 'none',
                borderRadius: '8px', width: '42px', height: '42px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '5px', cursor: 'pointer', padding: '0', flexShrink: 0,
              }}
              aria-label="Menu"
            >
              <span style={{
                display: 'block', width: '22px', height: '2px', background: '#000',
                borderRadius: '2px',
                transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                transition: 'transform 0.25s ease',
              }} />
              <span style={{
                display: 'block', width: '22px', height: '2px', background: '#000',
                borderRadius: '2px',
                opacity: menuOpen ? 0 : 1,
                transition: 'opacity 0.2s ease',
              }} />
              <span style={{
                display: 'block', width: '22px', height: '2px', background: '#000',
                borderRadius: '2px',
                transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                transition: 'transform 0.25s ease',
              }} />
            </button>
          </div>
        )}
      </nav>

      {/* MENU DÉROULANT MOBILE */}
      {isMobile && menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed', top: '66px', left: 0, right: 0,
            background: 'linear-gradient(to bottom, #ffaa33, #ff6600)',
            boxShadow: '0 8px 32px rgba(255,107,26,0.5)',
            zIndex: 99,
            padding: '8px 24px 16px',
            animation: 'slideDown 0.2s ease',
          }}
        >
          {navItems.map(item => (
            <span
              key={item.page}
              onClick={() => { router.push(item.path); setMenuOpen(false) }}
              style={menuStyle(item.page)}
            >
              {item.label}
            </span>
          ))}

          {/* Déconnexion dans le menu mobile */}
          <button
            onClick={() => { onLogout(); setMenuOpen(false) }}
            style={{
              marginTop: '12px',
              background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.3)',
              color: '#000', padding: '10px 20px', fontFamily: 'Cinzel, serif',
              fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase',
              cursor: 'pointer', fontWeight: 700, width: '100%', borderRadius: '4px',
            }}
          >
            Déconnexion
          </button>
        </div>
      )}
    </>
  )
}
