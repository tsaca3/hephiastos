'use client'
import { useRouter } from 'next/navigation'

export default function Forge() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8' }}>
      <h1>Conditions générales</h1>
    </div>
  )
}