import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(req: NextRequest) {
  try {
    const { userId, trame, score, outcome, chapters } = await req.json()
    console.log('Save story called:', { userId, trame, score, outcome })
    const { error } = await supabase.from('stories').insert({
      user_id: userId,
      trame,
      score,
      outcome,
      chapters
    })
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 })
  }
}