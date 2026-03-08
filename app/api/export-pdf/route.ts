import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storyId = searchParams.get('id')

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single()

  if (error || !story) {
    return NextResponse.json({ error: 'Histoire introuvable' }, { status: 404 })
  }

  return NextResponse.json(story)
}