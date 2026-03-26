import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getFin(score) {
  if (score >= 16) return { id: 'heureuse', titre: "L'aurore à deux" }
  if (score >= 10) return { id: 'neutre',   titre: "Le souvenir du bal" }
  return             { id: 'triste',   titre: "Le bal des autres" }
}

function nettoyerTexte(texte) {
  if (!texte) return ''

  let t = texte

  // Supprimer les titres Markdown (# Titre, ## Titre, etc.)
  t = t.replace(/^#{1,6}\s+.*/gm, '')

  // Supprimer les séparateurs --- et ***
  t = t.replace(/^[-*]{3,}\s*$/gm, '')

  // Supprimer le gras **texte**
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1')

  // Supprimer l'italique *texte*
  t = t.replace(/\*([^*]+)\*/g, '$1')

  // Supprimer les astérisques isolés restants
  t = t.replace(/\*/g, '')

  // Couper tout ce qui suit un déclencheur de liste de choix
  // On cherche les patterns typiques que Claude ajoute spontanément
  const declencheurs = [
    /\n+\s*Que (faites-vous|fais-tu|faire)\s*\??/i,
    /\n+\s*Que (allez-vous|vas-tu) faire\s*\??/i,
    /\n+\s*Quelle est votre décision\s*\??/i,
    /\n+\s*Quel est votre choix\s*\??/i,
    /\n+\s*[AaBbCc1-3][.)]\s+/,
    /\n+\s*[-•]\s+(Vous|Tu) (pouvez|peux)/i,
    /\n+\s*Options?\s*:/i,
    /\n+\s*Choix\s*:/i,
  ]

  for (const pattern of declencheurs) {
    const match = t.search(pattern)
    if (match !== -1) {
      t = t.substring(0, match)
    }
  }

  // Nettoyer les lignes vides multiples (garder max 2 sauts de ligne)
  t = t.replace(/\n{3,}/g, '\n\n')

  // Supprimer espaces/sauts de ligne en début et fin
  t = t.trim()

  return t
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
IMPORTANT : L'histoire se déroule entièrement dans le village médiéval de Valdecour. Aucune référence à une ville moderne, à Paris, ou à toute autre localisation qui ne soit pas ce village médiéval.
IMPORTANT : Ne génère que le texte narratif. Aucun titre, aucun séparateur, aucune liste de choix, aucun "Que faites-vous ?".`
    } else if (isLast) {
      const fin = getFin(score)
      userMsg = `Chapitre ${chapterIndex + 1} — "L'aube" (dernier chapitre)
Choix du joueur au chapitre précédent : "${choiceText}"
Valeur du choix : ${choicePts} point(s) sur 2
Score final : ${score} / 20
Fin déclenchée : ${fin.id} — "${fin.titre}"
Génère le texte de clôture de cette fin. Environ 150 à 250 mots, de manière indicative.
IMPORTANT : L'histoire se déroule entièrement dans le village médiéval de Valdecour. Aucune référence à une ville moderne ou anachronique.
IMPORTANT : Ne génère que le texte narratif. Aucun titre, aucun séparateur, aucune liste de choix.`
    } else {
      userMsg = `Chapitre ${chapterIndex + 1} / ${totalChapters}
Choix du joueur au chapitre précédent : "${choiceText}"
Valeur du choix : ${choicePts} point(s) sur 2
Score actuel : ${score} / 20
Génère le texte narratif de ce chapitre.
IMPORTANT : L'histoire se déroule entièrement dans le village médiéval de Valdecour. Aucune référence à une ville moderne ou anachronique.
IMPORTANT : Ne génère que le texte narratif. Aucun titre, aucun séparateur, aucune liste de choix, aucun "Que faites-vous ?".`
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: promptSysteme,
      messages: [{ role: 'user', content: userMsg }]
    })

    const texteBreut = message.content[0]?.type === 'text' ? message.content[0].text : ''
    const texte = nettoyerTexte(texteBreut)

    return NextResponse.json({ text: texte })

  } catch (error) {
    console.error('Erreur generer-chapitre:', error)
    return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 })
  }
}
