import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// GET — récupérer le draft d'un utilisateur pour une trame
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const trameId = searchParams.get('trameId')

  if (!userId || !trameId) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('stories_draft')
    .select('*')
    .eq('user_id', userId)
    .eq('trame_id', trameId)
    .single()

  if (error || !data) {
    return NextResponse.json({ draft: null })
  }

  return NextResponse.json({ draft: data })
}

// POST — créer ou mettre à jour un draft (upsert)
export async function POST(req) {
  const {
    userId,
    trameId,
    trameTitre,
    chapterIndex,
    score,
    chapterTexts,
    previousChoices
  } = await req.json()

  if (!userId || !trameId) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('stories_draft')
    .upsert({
      user_id: userId,
      trame_id: trameId,
      trame_titre: trameTitre,
      chapter_index: chapterIndex,
      score,
      chapter_texts: chapterTexts,
      previous_choices: previousChoices,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,trame_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur upsert draft:', error)
    return NextResponse.json({ error: 'Erreur sauvegarde draft' }, { status: 500 })
  }

  return NextResponse.json({ draft: data })
}

// DELETE — supprimer le draft quand l'histoire est terminée
export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const trameId = searchParams.get('trameId')

  if (!userId || !trameId) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const { error } = await supabase
    .from('stories_draft')
    .delete()
    .eq('user_id', userId)
    .eq('trame_id', trameId)

  if (error) {
    console.error('Erreur suppression draft:', error)
    return NextResponse.json({ error: 'Erreur suppression draft' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
