'use client'
import { useRouter } from 'next/navigation'

export default function Navbar({ credits, onLogout, activePage }) {
  const router = useRouter()

  const menuStyle = (page) => ({
    fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '2px',
    textTransform: 'uppercase',
    color: activePage === page ? '#555555' : '#000',
    cursor: 'pointer', fontWeight: 700
  })

  return (
    <nav style={{
      padding: '0 40px', height: '66px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'linear-gradient(to top, #ff6600, #ffaa33)',
      boxShadow: '0 2px 20px rgba(255,107,26,0.5)',
      position: 'sticky', top: 0, zIndex: 10
    }}>
      <img src="/logo_icon.png" alt="HéphIAstos" style={{ height: '58px', cursor: 'pointer' }} onClick={() => router.push('/')} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '56px' }}>
        <span onClick={() => router.push('/comment')} style={menuStyle('comment')}>Comment ça marche ?</span>
        <span onClick={() => router.push('/catalogue')} style={menuStyle('catalogue')}>Les Trames</span>
        <span onClick={() => router.push('/credits')} style={menuStyle('credits')}>La Bourse aux Crédits</span>
        <span onClick={() => router.push('/compte')} style={menuStyle('compte')}>Mon Compte</span>
        <span onClick={() => router.push('/forge')} style={menuStyle('forge')}>Ma Forge</span>
        <span onClick={() => router.push('/conditions')} style={menuStyle('conditions')}>Conditions Générales</span>
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
    </nav>
  )
}