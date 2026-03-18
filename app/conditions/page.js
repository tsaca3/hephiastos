'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'

export default function Conditions() {
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      supabase.from('profiles').select('credits').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits) })
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const sectionTitleStyle = {
    fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: '#e8b84b',
    marginBottom: '16px', marginTop: '40px',
    borderBottom: '1px solid rgba(201,146,42,0.2)', paddingBottom: '8px'
  }

  const textStyle = {
    fontFamily: 'Crimson Text, serif', fontSize: '1.1rem',
    color: '#a89880', lineHeight: '1.8', marginBottom: '12px'
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e8dcc8', fontFamily: 'Crimson Text, serif' }}>

      <Navbar credits={credits} onLogout={logout} activePage="conditions" />

      {/* CONTENU */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 40px' }}>

        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          background: 'linear-gradient(135deg, #ff6b1a, #e8b84b, #ff6b1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textAlign: 'center', marginBottom: '12px'
        }}>Conditions Générales d'Utilisation</h1>

        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '3px',
          textTransform: 'uppercase', color: '#7a6a52',
          textAlign: 'center', marginBottom: '16px'
        }}>En vigueur au 16 mars 2026</p>

        <p style={{
          fontFamily: 'Crimson Text, serif', fontSize: '1rem', fontStyle: 'italic',
          color: '#7a6a52', textAlign: 'center', marginBottom: '60px',
          borderBottom: '1px solid rgba(201,146,42,0.15)', paddingBottom: '40px'
        }}>
          En utilisant HéphIAstos, vous acceptez les présentes conditions générales d'utilisation dans leur intégralité.
        </p>

        <h2 style={sectionTitleStyle}>Article 1 — Présentation de la plateforme</h2>
        <p style={textStyle}>
          HéphIAstos est une plateforme de création narrative assistée par intelligence artificielle, accessible à l'adresse hephiastos.store. Elle permet aux utilisateurs de générer des histoires personnalisées à partir de trames narratives prédéfinies, en échange de crédits de forge.
        </p>
        <p style={textStyle}>
          La plateforme est éditée et exploitée par HéphIAstos, domiciliée en Suisse, soumise au droit suisse, notamment à la Loi fédérale sur la protection des données (LPD) et au Code des obligations (CO).
        </p>

        <h2 style={sectionTitleStyle}>Article 2 — Accès et inscription</h2>
        <p style={textStyle}>
          L'accès à HéphIAstos est ouvert à toute personne disposant d'une connexion internet. L'inscription est gratuite et nécessite la création d'un compte avec une adresse email valide et un pseudo unique.
        </p>
        <p style={textStyle}>
          L'utilisateur est responsable de la confidentialité de ses identifiants de connexion et de toute activité effectuée depuis son compte. En cas de perte ou de compromission de ses accès, il doit contacter HéphIAstos dans les plus brefs délais.
        </p>

        <h2 style={sectionTitleStyle}>Article 3 — Crédits de forge et paiements</h2>
        <p style={textStyle}>
          L'utilisation des trames narratives et la génération d'histoires requièrent des crédits de forge, acquis via la Bourse aux Crédits. Les crédits sont vendus en packs et débités au moment de leur utilisation.
        </p>
        <p style={textStyle}>
          Les paiements sont traités par Stripe, prestataire de paiement sécurisé. HéphIAstos ne stocke aucune donnée bancaire. Les crédits achetés sont crédités instantanément sur le compte de l'utilisateur.
        </p>
        <p style={textStyle}>
          Les crédits de forge sont <strong style={{color: '#e8b84b'}}>non remboursables</strong> dès leur achat. En finalisant son achat, l'utilisateur reconnaît expressément que la livraison des crédits est immédiate et renonce à tout droit de rétractation, conformément à l'article 16m de la directive européenne 2011/83/UE relative aux droits des consommateurs.
        </p>
        <p style={textStyle}>
          Les crédits non utilisés ne peuvent faire l'objet d'aucun remboursement, ni d'aucun échange contre des espèces ou tout autre bien ou service en dehors de la plateforme HéphIAstos.
        </p>

        <h2 style={sectionTitleStyle}>Article 4 — Propriété intellectuelle et droits sur les histoires</h2>
        <p style={textStyle}>
          Les histoires générées sur HéphIAstos sont la propriété de l'utilisateur qui les a créées. L'utilisateur est libre de les utiliser, les modifier, les publier ou les monétiser librement, sans restriction de la part de HéphIAstos.
        </p>
        <p style={textStyle}>
          En créant une histoire sur HéphIAstos, l'utilisateur accorde à HéphIAstos une licence non-exclusive, gratuite et mondiale, pour utiliser, reproduire et afficher les histoires générées à des fins promotionnelles et de démonstration, sous forme anonymisée uniquement.
        </p>
        <p style={textStyle}>
          Les trames narratives, l'interface, les textes, logos et éléments graphiques de la plateforme restent la propriété exclusive de HéphIAstos et sont protégés par le droit d'auteur suisse.
        </p>

        <h2 style={sectionTitleStyle}>Article 5 — Utilisation acceptable</h2>
        <p style={textStyle}>
          L'utilisateur s'engage à utiliser HéphIAstos de manière licite et responsable. Sont notamment interdits :
        </p>
        <ul style={{ ...textStyle, paddingLeft: '24px' }}>
          <li style={{ marginBottom: '8px' }}>La génération de contenus illicites, haineux, diffamatoires ou portant atteinte aux droits de tiers</li>
          <li style={{ marginBottom: '8px' }}>L'utilisation de la plateforme à des fins commerciales non autorisées</li>
          <li style={{ marginBottom: '8px' }}>Toute tentative de contournement des systèmes de sécurité ou de crédit</li>
          <li style={{ marginBottom: '8px' }}>La revente de crédits de forge à des tiers</li>
          <li style={{ marginBottom: '8px' }}>L'utilisation de robots ou systèmes automatisés pour générer des histoires en masse</li>
        </ul>
        <p style={textStyle}>
          HéphIAstos se réserve le droit de suspendre ou supprimer tout compte ne respectant pas ces conditions, sans préavis ni remboursement.
        </p>

        <h2 style={sectionTitleStyle}>Article 6 — Protection des données personnelles</h2>
        <p style={textStyle}>
          HéphIAstos collecte et traite les données personnelles de ses utilisateurs conformément à la Loi fédérale suisse sur la protection des données (LPD) et au Règlement général sur la protection des données (RGPD) pour les utilisateurs résidant dans l'Union européenne.
        </p>
        <p style={textStyle}>
          Les données collectées (email, pseudo, historique des histoires générées) sont utilisées exclusivement pour le fonctionnement de la plateforme et ne sont jamais cédées à des tiers à des fins commerciales.
        </p>
        <p style={textStyle}>
          L'utilisateur dispose d'un droit d'accès, de rectification, de suppression et de portabilité de ses données, qu'il peut exercer en contactant HéphIAstos à l'adresse : contact@hephiastos.store
        </p>

        <h2 style={sectionTitleStyle}>Article 7 — Intelligence artificielle</h2>
        <p style={textStyle}>
          Les histoires générées sur HéphIAstos sont produites par un système d'intelligence artificielle. HéphIAstos ne garantit pas l'exactitude, la cohérence ou l'originalité absolue des contenus générés.
        </p>
        <p style={textStyle}>
          L'utilisateur reconnaît que les histoires générées peuvent présenter des similarités avec d'autres œuvres existantes, sans que cela constitue une violation du droit d'auteur de la part de HéphIAstos.
        </p>
        <p style={textStyle}>
          HéphIAstos s'engage à mettre en œuvre les mesures raisonnables pour éviter la génération de contenus problématiques, sans pouvoir en garantir l'absence totale.
        </p>

        <h2 style={sectionTitleStyle}>Article 8 — Limitation de responsabilité</h2>
        <p style={textStyle}>
          HéphIAstos met tout en œuvre pour assurer la disponibilité et la qualité de la plateforme, sans pouvoir garantir un service ininterrompu. La plateforme peut être temporairement inaccessible pour maintenance ou en cas de force majeure.
        </p>
        <p style={textStyle}>
          HéphIAstos ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme, ni du contenu des histoires générées par l'intelligence artificielle.
        </p>

        <h2 style={sectionTitleStyle}>Article 9 — Modification des conditions</h2>
        <p style={textStyle}>
          HéphIAstos se réserve le droit de modifier les présentes conditions générales à tout moment. Les utilisateurs seront informés de toute modification significative par email ou notification sur la plateforme.
        </p>
        <p style={textStyle}>
          La poursuite de l'utilisation de la plateforme après notification des modifications vaut acceptation des nouvelles conditions.
        </p>

        <h2 style={sectionTitleStyle}>Article 10 — Droit applicable et juridiction</h2>
        <p style={textStyle}>
          Les présentes conditions générales sont soumises au droit suisse. Tout litige relatif à leur interprétation ou à leur exécution sera soumis à la juridiction exclusive des tribunaux compétents du canton de domicile de HéphIAstos, sous réserve des dispositions impératives applicables au consommateur.
        </p>

        <div style={{
          marginTop: '60px', padding: '24px',
          border: '1px solid rgba(201,146,42,0.2)',
          background: '#0d0800', textAlign: 'center'
        }}>
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '2px',
            textTransform: 'uppercase', color: '#e8b84b', marginBottom: '8px'
          }}>Contact</p>
          <p style={{ ...textStyle, marginBottom: '0', textAlign: 'center' }}>
            Pour toute question relative aux présentes conditions : <span style={{ color: '#ff6b1a' }}>contact@hephiastos.store</span>
          </p>
        </div>

        <p style={{
          fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '1px',
          color: '#7a6a52', textAlign: 'center', marginTop: '40px'
        }}>
          © 2026 HéphIAstos — Tous droits réservés
        </p>

      </div>
    </div>
  )
}