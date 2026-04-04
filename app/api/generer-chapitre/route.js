import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Fin BdV 1 (score unique)
function getFinBdV1(score) {
  if (score >= 16) return { id: 'heureuse', titre: "L'aurore à deux" }
  if (score >= 10) return { id: 'neutre',   titre: "Le souvenir du bal" }
  return                   { id: 'triste',   titre: "Le bal des autres" }
}

// Fin Nuit d'Été (3 jauges)
function getFinTriJauges(fins, desir, confiance, mystere) {
  if (!fins) return { titre: 'Trop tard' }
  const sorted = [...fins].sort((a, b) => a.priorite - b.priorite)
  for (const fin of sorted) {
    if (fin.id === 'union_des_ames'       && desir >= 14 && confiance >= 14) return fin
    if (fin.id === 'coup_de_foudre_libre' && desir >= 14 && mystere >= 14 && confiance < 14) return fin
    if (fin.id === 'ami_precieux'         && confiance >= 14 && desir < 14) return fin
    if (fin.id === 'enigme_non_resolue'   && mystere >= 14 && confiance < 14 && desir < 14) return fin
    if (fin.id === 'malentendu'           && desir >= 14 && confiance < 7) return fin
    if (fin.id === 'trop_tard') return fin
  }
  return sorted[sorted.length - 1]
}

function nettoyerTexte(texte) {
  if (!texte) return ''
  let t = texte
  t = t.replace(/^#{1,6}\s+.*/gm, '')
  t = t.replace(/^[-*]{3,}\s*$/gm, '')
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1')
  t = t.replace(/\*([^*]+)\*/g, '$1')
  t = t.replace(/\*/g, '')
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
    if (match !== -1) t = t.substring(0, match)
  }
  t = t.replace(/\n{3,}/g, '\n\n')
  return t.trim()
}

export async function POST(req) {
  try {
    const {
      chapterIndex,
      choiceText,
      choicePts,
      scores,
      isTriJauges,
      totalChapters,
      promptSysteme,
      professionParent,
      prenomProtagoniste,
      prenomCible
    } = await req.json()

    const isFirst = chapterIndex === 0
    const isLast  = chapterIndex === totalChapters - 1

    let userMsg

    if (isTriJauges) {
      // ── MODE NUIT D'ÉTÉ (3 jauges) ──────────────────────────────────
      const desir     = scores?.desir     || 0
      const confiance = scores?.confiance || 0
      const mystere   = scores?.mystere   || 0
      const prot = prenomProtagoniste || 'le protagoniste'
      const cible = prenomCible || 'l\'autre'

      if (isFirst) {
        userMsg = `Chapitre 1 — "L'arrivée"
C'est le tout premier chapitre. Génère la scène d'ouverture qui plante le décor du bal de village en plein air (été, de nos jours) et présente ${prot} arrivant sur les lieux. ${cible} apparaît dans la foule.
IMPORTANT : Ne génère que le texte narratif. Aucun titre, aucun séparateur, aucune liste de choix, aucun "Que faites-vous ?".`

      } else if (isLast) {
        const fin = getFinTriJauges(null, desir, confiance, mystere)
        const titreFin = professionParent
          ? `Secret révélé : ${cible} est la fille/le fils d'un·e ${professionParent} (invente un nom fictif crédible — jamais une personne réelle).`
          : ''

        userMsg = `Chapitre ${chapterIndex + 1} — "La vérité" (dernier chapitre)
Choix du joueur au chapitre précédent : "${choiceText}"
État des jauges : Désir ${desir}/20 — Confiance ${confiance}/20 — Mystère ${mystere}/20
${titreFin}
Fin déclenchée : "${fin?.titre || 'Trop tard'}"
Génère le texte de clôture. Le secret de ${cible} est enfin révélé dans ce chapitre. Environ 200 à 300 mots, de manière indicative.
IMPORTANT : Ne génère que le texte narratif. Aucun titre, aucun séparateur, aucune liste de choix.`

      } else {
        userMsg = `Chapitre ${chapterIndex + 1} / ${totalChapters}
Choix du joueur au chapitre précédent : "${choiceText}"
État des jauges : Désir ${desir}/20 — Confiance ${confiance}/20 — Mystère ${mystere}/20
Génère le texte narratif de ce chapitre.
IMPORTANT : Ne révèle pas encore le secret de ${cible} — cela se passe uniquement au chapitre ${totalChapters}.
IMPORTANT : Ne génère que le texte narratif. Aucun titre, aucun séparateur, aucune liste de choix, aucun "Que faites-vous ?".`
      }

    } else {
      // ── MODE BAL DE VILLAGE 1 (score unique) ─────────────────────────
      const score = scores?.score || 0

      if (isFirst) {
        userMsg = `Chapitre 1 — "L'arrivée au bal"
C'est le tout premier chapitre. Génère la scène d'ouverture qui plante le décor du bal de Valdecour et présente Erwan arrivant sur la place du village médiéval.
IMPORTANT : L'histoire se déroule entièrement dans le village médiéval de Valdecour. Aucune référence à une ville moderne, à Paris, ou à toute autre localisation qui ne soit pas ce village médiéval.
IMPORTANT : Ne génère que le texte narratif. Aucun titre, aucun séparateur, aucune liste de choix, aucun "Que faites-vous ?".`

      } else if (isLast) {
        const fin = getFinBdV1(score)
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
