import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const CHAPTERS = [
  {
    context: "C'est le soir du Grand Bal de la Moisson à Velmoor. Vous venez d'arriver et remarquez Maelis, la fille du forgeron.",
    choices: [
      { text: "Approcher Maelis avec un sourire et l'inviter à danser", pts: 3 },
      { text: "Attendre et observer Maelis de loin avant d'agir", pts: 1 },
      { text: "Vous mêler à la foule sans la remarquer", pts: 0 }
    ]
  },
  {
    context: "La fête bat son plein. Un cri retentit — on a volé la coupe d'argent du seigneur !",
    choices: [
      { text: "Chercher Maelis des yeux pour vous assurer qu'elle va bien", pts: 3 },
      { text: "Tenter de retrouver le voleur pour impressionner", pts: 1 },
      { text: "Profiter de la confusion pour explorer les lieux", pts: 0 }
    ]
  },
  {
    context: "Vous retrouvez Maelis près de l'entrée, visiblement agitée, se dirigeant vers le cellier.",
    choices: [
      { text: "La rejoindre discrètement et lui demander si elle a besoin d'aide", pts: 3 },
      { text: "La suivre à distance pour comprendre", pts: 1 },
      { text: "L'ignorer et continuer à chercher le voleur", pts: -1 }
    ]
  },
  {
    context: "Dans le cellier, vous découvrez Maelis tenant la coupe — son père doit de l'argent au seigneur.",
    choices: [
      { text: "Prendre sa main : « Je vais vous aider à trouver une solution »", pts: 4 },
      { text: "La persuader de remettre la coupe et promettre de plaider sa cause", pts: 2 },
      { text: "Lui dire froidement que voler n'est pas la bonne solution", pts: -2 }
    ]
  },
  {
    context: "Un inconnu encapuchonné apparaît et propose une solution mystérieuse.",
    choices: [
      { text: "Rester aux côtés de Maelis et lui demander ce qu'elle souhaite", pts: 3 },
      { text: "Écouter l'inconnu, main protectrice sur l'épaule de Maelis", pts: 2 },
      { text: "Repousser l'inconnu et gérer seul", pts: 1 }
    ]
  },
  {
    context: "L'inconnu est un émissaire du Duc. Il offre d'effacer les dettes contre un document compromettant sur Aldric.",
    choices: [
      { text: "« La décision t'appartient Maelis, je serai là quoi qu'il arrive »", pts: 4 },
      { text: "Lui conseiller prudemment les risques de chaque option", pts: 2 },
      { text: "Prendre la décision à sa place sans lui demander son avis", pts: -2 }
    ]
  },
  {
    context: "Vous êtes dans le manoir pour récupérer le document. Vous bousculez accidentellement Maelis.",
    choices: [
      { text: "Vous arrêter pour vous assurer qu'elle n'est pas blessée", pts: 3 },
      { text: "Murmurer des excuses rapides et continuer", pts: 1 },
      { text: "Continuer sans vous retourner", pts: -2 }
    ]
  },
  {
    context: "Document en main, vous faites face à Aldric. Maelis apparaît derrière vous, prête à prendre votre défense.",
    choices: [
      { text: "La protéger en lui signalant de rester en arrière", pts: 2 },
      { text: "La laisser parler — son courage mérite d'être entendu", pts: 3 },
      { text: "Gérer Aldric seul sans regarder Maelis", pts: 0 }
    ]
  },
  {
    context: "La crise est résolue. Vous vous retrouvez seuls près de la fontaine. Maelis vous regarde avec intensité.",
    choices: [
      { text: "Lui avouer que cette nuit a changé quelque chose en vous", pts: 4 },
      { text: "Lui sourire sans mot dire, laisser le silence parler", pts: 3 },
      { text: "Plaisanter légèrement pour désamorcer l'émotion", pts: 1 }
    ]
  },
  {
    context: "Le soleil se lève sur Velmoor. La nuit du bal touche à sa fin. Vous vous retrouvez seuls, Maelis et vous, près de la fontaine de la place.",
    choices: [
      { text: "Lui avouer que cette nuit a changé quelque chose en vous", pts: 4 },
      { text: "Lui sourire sans mot dire, laisser le silence parler", pts: 3 },
      { text: "Plaisanter légèrement pour désamorcer l'émotion", pts: 1 }
    ]
  }
]

export async function POST(req: NextRequest) {
  try {
    const { chapterIndex, choiceIndex, previousChoices, score } = await req.json()

    const chapter = CHAPTERS[chapterIndex]
    const choiceText = chapter.choices[choiceIndex]?.text || ''

    // Construire l'historique des choix
    const historyText = previousChoices.length > 0
      ? `\nChoix précédents du joueur :\n${previousChoices.map((c: string, i: number) => `- Chapitre ${i + 1}: ${c}`).join('\n')}`
      : ''

    const prompt = `Tu es le narrateur d'une histoire interactive médiévale romantique intitulée "Bal de Village".

Contexte du chapitre ${chapterIndex + 1}/10 : ${chapter.context}
${historyText}

Le joueur vient de choisir : "${choiceText}"
Score de séduction actuel : ${score}/30

Écris un paragraphe narratif de 4 à 6 phrases qui :
1. Décrit les conséquences immédiates du choix du joueur
2. Fait avancer l'histoire de manière cohérente
3. Reflète subtilement l'état de la relation avec Maelis selon le score (${score < 8 ? 'froide et distante' : score < 15 ? 'prudente et réservée' : score < 23 ? 'attirée mais hésitante' : 'clairement séduite'})
4. Se termine par une situation qui amène naturellement les choix suivants

Style : médiéval, poétique, immersif. À la deuxième personne du singulier (vous).
Ne mentionne pas le score. Ne liste pas les choix suivants. Écris uniquement le paragraphe narratif.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({
      text,
      pts: chapter.choices[choiceIndex]?.pts || 0
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 })
  }
}