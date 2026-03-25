import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getFin(score) {
  if (score >= 16) return { id: 'heureuse', titre: "L'aurore à deux" }
  if (score >= 10) return { id: 'neutre',   titre: "Le souvenir du bal" }
  return             { id: 'triste',   titre: "Le bal des autres" }
}

export async function POST(req) {
  try {
    const {
      chapterIndex,
      choiceText,
      choicePts,
      score,
      totalChapters,
      promptSysteme
    } = await req.json()

    const isFirst = chapterIndex === 0
    const isLast  = chapterIndex === totalChapters - 1

    let userMsg

    if (isFirst) {
      userMsg = `Chapitre 1 — "L'arrivée au bal"
C'est le tout premier chapitre. Génère la scène d'ouverture qui plante le décor du bal de Valdecour et présente Erwan arrivant sur la place du village médiéval.
IMPORTANT : L'histoire se déroule entièrement dans le village médiéval de Valdecour. Aucune référence à une ville moderne, à Paris, ou à toute autre localisation qui ne soit pas ce village médiéval.`
    } else if (isLast) {
      const fin = getFin(score)
      userMsg = `Chapitre ${chapterIndex + 1} — "L'aube" (dernier chapitre)
Choix du joueur au chapitre précédent : "${choiceText}"
Valeur du choix : ${choicePts} point(s) sur 2
Score final : ${score} / 20
Fin déclenchée : ${fin.id} — "${fin.titre}"
Génère le texte de clôture de cette fin. Environ 150 à 250 mots, de manière indicative.
IMPORTANT : L'histoire se déroule entièrement dans le village médiéval de Valdecour. Aucune référence à une ville moderne, à Paris, ou à toute autre localisation anachronique.`
    } else {
      userMsg = `Chapitre ${chapterIndex + 1} / ${totalChapters}
Choix du joueur au chapitre précédent : "${choiceText}"
Valeur du choix : ${choicePts} point(s) sur 2
Score actuel : ${score} / 20
Génère le texte narratif de ce chapitre.
IMPORTANT : L'histoire se déroule entièrement dans le village médiéval de Valdecour. Aucune référence à une ville moderne, à Paris, ou à toute autre localisation anachronique.`
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 500,
      system: promptSysteme,
      messages: [{ role: 'user', content: userMsg }]
    })

    const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ text })

  } catch (error) {
    console.error('Erreur generer-chapitre:', error)
    return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 })
  }
}
