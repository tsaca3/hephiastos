import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    const { chapterIndex, choiceIndex, previousChoices, score, trameId, context, choiceText, totalChapters } = await req.json()

    const historyText = previousChoices.length > 0
      ? `\nChoix précédents du joueur :\n${previousChoices.map((c: string, i: number) => `- Chapitre ${i + 1}: ${c}`).join('\n')}`
      : ''

    const prompt = `Tu es le narrateur d'une histoire interactive intitulée "${trameId}".

Contexte du chapitre ${chapterIndex + 1}/${totalChapters} : ${context}
${historyText}

Le joueur vient de choisir : "${choiceText}"
Score actuel : ${score}

Écris un paragraphe narratif de 4 à 6 phrases qui :
1. Décrit les conséquences immédiates du choix du joueur
2. Fait avancer l'histoire de manière cohérente
3. Se termine par une situation qui amène naturellement la suite

Style : immersif et poétique. À la deuxième personne du singulier (vous).
Ne mentionne pas le score. Ne liste pas les choix suivants. Écris uniquement le paragraphe narratif.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ text })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 })
  }
}