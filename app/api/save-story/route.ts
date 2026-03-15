import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, trame, score, outcome, chapters, chapterTexts, storyId } = await req.json()

    if (storyId) {
      // Mettre à jour l'histoire existante
      const { error } = await supabase.from('stories').update({
        score,
        outcome,
        chapters,
        chapter_texts: chapterTexts
      }).eq('id', storyId)

      if (error) throw error
      return NextResponse.json({ success: true, storyId })
    } else {
      // Créer une nouvelle histoire
      const { data, error } = await supabase.from('stories').insert({
        user_id: userId,
        trame,
        score,
        outcome,
        chapters,
        chapter_texts: chapterTexts
      }).select('id').single()

      if (error) throw error
      return NextResponse.json({ success: true, storyId: data.id })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 })
  }
}