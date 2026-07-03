import { absoluteUrl } from "./seo";

type BlogSection = {
  heading: string;
  body: readonly string[];
};

export type BlogPost = {
  slug: string;
  path: string;
  href: string;
  title: string;
  description: string;
  keyword: string;
  category: string;
  readingTime: string;
  publishedAt: string;
  updatedAt: string;
  summary: string;
  takeaways: readonly string[];
  sections: readonly BlogSection[];
  relatedLinks: readonly {
    href: string;
    label: string;
  }[];
};

export const blogPosts: readonly BlogPost[] = [
  {
    slug: "compte-rendu-osteopathe-animalier-proprietaire",
    path: "/blog/compte-rendu-osteopathe-animalier-proprietaire",
    href: absoluteUrl("/blog/compte-rendu-osteopathe-animalier-proprietaire"),
    title: "Compte rendu ostéopathe animalier: quoi envoyer au propriétaire ?",
    description:
      "Structurez un compte rendu d'ostéopathe animalier lisible, rassurant et utile au propriétaire sans rallonger votre fin de séance.",
    keyword: "compte rendu ostéopathe animalier",
    category: "Compte rendu",
    readingTime: "6 min",
    publishedAt: "2026-07-03",
    updatedAt: "2026-07-03",
    summary:
      "Un bon compte rendu ne cherche pas à tout dire. Il aide le propriétaire à comprendre ce qui a été observé, ce qui compte maintenant et quand reprendre contact.",
    takeaways: [
      "Commencez par une synthèse courte avant les détails techniques.",
      "Séparez observations, conseils et points de vigilance.",
      "Gardez une relance claire pour transformer le compte rendu en suivi.",
    ],
    sections: [
      {
        heading: "Partir de l'intention du propriétaire",
        body: [
          "Le propriétaire ne relit pas un compte rendu comme un praticien. Il cherche surtout à savoir ce que vous avez remarqué, ce qu'il doit surveiller et comment accompagner son animal après la séance.",
          "Pour le mot-clé compte rendu ostéopathe animalier, l'intention est très pratique: modèles, exemples, structure et temps gagné. Votre contenu doit donc répondre vite avant d'entrer dans les nuances métier.",
        ],
      },
      {
        heading: "Une structure simple en quatre blocs",
        body: [
          "Le format le plus lisible reste: contexte de la séance, points observés, conseils transmis, prochaine étape. Cette progression évite de mélanger constat, pédagogie et suivi.",
          "La partie technique peut rester présente, mais elle gagne à être reformulée avec des phrases courtes. Le propriétaire doit pouvoir retrouver l'idée principale sans devoir décoder votre jargon.",
        ],
      },
      {
        heading: "Transformer le compte rendu en suivi post-séance",
        body: [
          "Le compte rendu devient plus utile lorsqu'il prépare une relance J+7 ou J+30. Vous pouvez demander un retour sur le confort, la mobilité, le comportement ou l'activité reprise, selon l'animal et le cadre de la séance.",
          "Biume aide à garder ce fil: le praticien valide le résumé, l'animal conserve sa timeline et les prochains échanges partent d'une base claire.",
        ],
      },
    ],
    relatedLinks: [
      { href: "/compte-rendu-osteopathe-animalier", label: "Page compte rendu" },
      { href: "/modele-compte-rendu-osteopathe-animalier", label: "Modèle de compte rendu" },
      { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
    ],
  },
  {
    slug: "modele-compte-rendu-osteopathe-animalier",
    path: "/blog/modele-compte-rendu-osteopathe-animalier",
    href: absoluteUrl("/blog/modele-compte-rendu-osteopathe-animalier"),
    title: "Modèle compte rendu ostéopathe animalier: structure prête à adapter",
    description:
      "Utilisez un modèle de compte rendu ostéopathe animalier clair: synthèse propriétaire, observations, conseils et suivi post-séance.",
    keyword: "modèle compte rendu ostéopathe animalier",
    category: "Modèle",
    readingTime: "7 min",
    publishedAt: "2026-07-03",
    updatedAt: "2026-07-03",
    summary:
      "Un modèle de compte rendu aide à gagner du temps sans standardiser votre pratique. L'objectif est de garder votre regard métier tout en rendant le suivi plus lisible pour le propriétaire.",
    takeaways: [
      "Gardez une synthèse propriétaire courte avant les détails de séance.",
      "Séparez observations, conseils transmis et points de suivi.",
      "Ajoutez toujours une prochaine étape claire, même si aucun rendez-vous n'est prévu.",
    ],
    sections: [
      {
        heading: "Le modèle simple à reprendre",
        body: [
          "Un modèle compte rendu ostéopathe animalier efficace commence par une Synthèse propriétaire. Cette première partie résume en quelques lignes le motif, les observations principales et ce que le propriétaire doit retenir après la séance.",
          "Vous pouvez ensuite structurer le document en quatre blocs: contexte de la séance, points observés, conseils transmis et suivi recommandé. Cette base reste assez souple pour un chien, un cheval, un chat ou un animal suivi dans la durée.",
        ],
      },
      {
        heading: "Bloc 1: contexte de la séance",
        body: [
          "Indiquez l'animal, la date, le motif de consultation, les informations importantes partagées par le propriétaire et les limites éventuelles de la séance. Ce bloc évite de perdre le contexte lors d'un futur suivi.",
          "Le but n'est pas d'écrire une anamnèse interminable. Deux ou trois phrases bien choisies suffisent souvent à comprendre pourquoi la séance a eu lieu et ce qui devra être comparé plus tard.",
        ],
      },
      {
        heading: "Bloc 2: observations et zones travaillées",
        body: [
          "Listez les points observés avec un vocabulaire professionnel, puis ajoutez une reformulation simple pour le propriétaire. Cette double lecture permet de garder la précision métier sans rendre le compte rendu opaque.",
          "Exemple de formulation: observations de mobilité sur certaines zones, adaptation du travail selon les réactions de l'animal, puis résumé en langage propriétaire sur le confort ou la vigilance à garder.",
        ],
      },
      {
        heading: "Bloc 3: conseils et suivi post-séance",
        body: [
          "Terminez par les consignes transmises: repos, reprise progressive, observation d'un comportement, retour attendu ou moment de relance. Ce bloc est souvent celui que le propriétaire relit vraiment après votre départ.",
          "Biume peut vous aider à transformer ce modèle en résumé propriétaire validé, puis à conserver la séance dans une timeline animal pour préparer la relance J+7 ou la prochaine consultation.",
        ],
      },
    ],
    relatedLinks: [
      { href: "/modele-compte-rendu-osteopathe-animalier", label: "Page modèle de compte rendu" },
      { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu propriétaire" },
      { href: "/tarifs", label: "Essayer Biume" },
    ],
  },
  {
    slug: "suivi-post-seance-animal-relance",
    path: "/blog/suivi-post-seance-animal-relance",
    href: absoluteUrl("/blog/suivi-post-seance-animal-relance"),
    title: "Suivi post-séance animal: quand relancer sans être intrusif ?",
    description:
      "Organisez le suivi post-séance animal avec des relances utiles, sobres et validées par le praticien pour garder un lien client clair.",
    keyword: "suivi post-séance animal",
    category: "Suivi client",
    readingTime: "5 min",
    publishedAt: "2026-07-03",
    updatedAt: "2026-07-03",
    summary:
      "Une relance utile n'est pas une relance commerciale. Elle donne au propriétaire un moment simple pour observer, répondre et continuer le suivi.",
    takeaways: [
      "J+7 sert souvent à recueillir un premier retour propriétaire.",
      "J+30 peut aider à valider l'évolution ou rappeler une étape prévue.",
      "La relance doit rester contextualisée par la séance, pas automatisée à l'aveugle.",
    ],
    sections: [
      {
        heading: "Pourquoi le timing compte",
        body: [
          "Un suivi post-séance animal arrive trop tôt lorsqu'il ne laisse rien à observer. Il arrive trop tard lorsque le propriétaire a déjà oublié les consignes ou les signaux à surveiller.",
          "Dans beaucoup de pratiques, J+7 donne assez de recul pour un premier retour simple. J+30 sert plutôt à consolider l'évolution ou à préparer une suite si elle a été évoquée pendant la séance.",
        ],
      },
      {
        heading: "Ce qu'une bonne relance doit contenir",
        body: [
          "La relance doit rappeler l'animal, la date de séance et un ou deux points surveillés. Elle peut ensuite poser une question précise: confort, mobilité, repos, reprise d'activité ou comportement observé.",
          "Cette précision limite les réponses vagues et montre que le suivi est réellement lié à l'animal, pas à un message générique envoyé à tout le fichier client.",
        ],
      },
      {
        heading: "Garder la main du praticien",
        body: [
          "L'automatisation ne doit pas décider à votre place. Le bon équilibre consiste à préparer les messages, conserver les informations dans la timeline animal et laisser le praticien valider ce qui part au propriétaire.",
          "C'est ce positionnement qui rend le suivi plus professionnel sans donner l'impression d'une séquence marketing froide.",
        ],
      },
    ],
    relatedLinks: [
      { href: "/suivi-post-seance-animal", label: "Page suivi post-séance" },
      { href: "/relance-client-osteopathe-animalier", label: "Relance client" },
      { href: "/logiciel-osteopathe-animalier", label: "Logiciel ostéopathe animalier" },
    ],
  },
  {
    slug: "logiciel-osteopathe-animalier-choisir",
    path: "/blog/logiciel-osteopathe-animalier-choisir",
    href: absoluteUrl("/blog/logiciel-osteopathe-animalier-choisir"),
    title: "Logiciel ostéopathe animalier: les critères avant de choisir",
    description:
      "Comparez les critères d'un logiciel ostéopathe animalier: agenda, compte rendu, suivi propriétaire, mobilité et validation par le praticien.",
    keyword: "logiciel ostéopathe animalier",
    category: "Logiciel métier",
    readingTime: "7 min",
    publishedAt: "2026-07-03",
    updatedAt: "2026-07-03",
    summary:
      "Le meilleur outil dépend rarement d'une liste infinie de fonctionnalités. Il dépend du moment de votre pratique que vous voulez vraiment améliorer.",
    takeaways: [
      "Distinguez gestion administrative et qualité du suivi après séance.",
      "Vérifiez la simplicité mobile si vous travaillez en déplacement.",
      "Cherchez un outil qui vous laisse valider les contenus sensibles.",
    ],
    sections: [
      {
        heading: "Clarifier le besoin principal",
        body: [
          "Avant de choisir un logiciel ostéopathe animalier, séparez les besoins administratifs des besoins de suivi. Agenda, facturation et réservation ne résolvent pas les mêmes problèmes qu'un compte rendu propriétaire ou une timeline animal.",
          "Cette distinction évite d'empiler des outils trop larges alors que le vrai irritant se situe parfois dans les dix minutes qui suivent chaque séance.",
        ],
      },
      {
        heading: "Comparer sur des cas concrets",
        body: [
          "Prenez trois scénarios: une première séance, un retour propriétaire à J+7, puis une séance de suivi trois mois plus tard. Un bon logiciel doit vous aider à retrouver le contexte sans repartir de zéro.",
          "Les fiches de comparaison deviennent plus utiles lorsqu'elles décrivent ces situations réelles plutôt qu'une simple grille de fonctionnalités.",
        ],
      },
      {
        heading: "Évaluer la place de l'IA",
        body: [
          "L'IA peut aider à reformuler, synthétiser et préparer un message. Elle ne doit pas remplacer votre jugement clinique, votre vocabulaire ni la validation finale.",
          "Biume se place dans cette logique: accélérer la production d'un résumé propriétaire et structurer le suivi, tout en laissant le praticien garder la main.",
        ],
      },
    ],
    relatedLinks: [
      { href: "/logiciel-osteopathe-animalier", label: "Logiciel ostéopathe animalier" },
      { href: "/comparatifs", label: "Comparatifs logiciels" },
      { href: "/tarifs", label: "Tarifs Biume" },
    ],
  },
  {
    slug: "migrer-depuis-neovoice-pro",
    path: "/blog/migrer-depuis-neovoice-pro",
    href: absoluteUrl("/blog/migrer-depuis-neovoice-pro"),
    title: "Migrer depuis NeoVoice Pro: garder ses comptes rendus et son suivi",
    description:
      "Vous envisagez de migrer depuis NeoVoice Pro ? Voici comment préserver vos comptes rendus, suivis client et relances dans Biume.",
    keyword: "migrer depuis NeoVoice Pro",
    category: "Migration",
    readingTime: "6 min",
    publishedAt: "2026-07-03",
    updatedAt: "2026-07-03",
    summary:
      "Si vous utilisez NeoVoice Pro et que vous envisagez de changer d'outil, le sujet n'est pas seulement de comparer des fonctionnalités. Il faut préserver la continuité du suivi propriétaire.",
    takeaways: [
      "Commencez par identifier vos suivis actifs et vos comptes rendus récents.",
      "Priorisez les animaux actifs et les séances récentes pour redémarrer vite.",
      "Testez Biume sur quelques suivis avant de migrer toute votre pratique.",
    ],
    sections: [
      {
        heading: "Pourquoi préparer une migration depuis NeoVoice Pro",
        body: [
          "Changer d'outil peut vite créer une rupture dans le suivi client. Pour un praticien animalier, les éléments sensibles sont souvent les comptes rendus, les animaux suivis, les retours propriétaire et les prochaines relances.",
          "La bonne approche consiste à préparer une transition progressive: garder ce qui sert vraiment au suivi post-séance, puis tester un nouveau flux sur quelques cas récents.",
        ],
      },
      {
        heading: "La checklist avant de changer d'outil",
        body: [
          "Commencez par repérer vos suivis actifs, vos comptes rendus importants et les animaux vus récemment. Rangez ensuite ces informations par client ou par animal, même de façon simple.",
          "Identifiez aussi les animaux vus récemment, les prochains rendez-vous et les clients qui attendent un retour. Ce sont eux qui doivent passer en premier dans votre nouvel outil.",
        ],
      },
      {
        heading: "Comment repartir proprement dans Biume",
        body: [
          "Dans Biume, vous pouvez reconstruire le flux autour de la séance: observations, résumé propriétaire, timeline animal et relance post-séance. Vous n'avez pas besoin de tout reprendre d'un coup pour créer de la valeur.",
          "Le plus efficace consiste à démarrer avec quelques cas récents: un compte rendu à envoyer, un retour propriétaire à demander, puis une relance J+7 ou J+30 à préparer.",
        ],
      },
      {
        heading: "Transformer une contrainte en amélioration du suivi",
        body: [
          "Changer d'outil est pénible, mais c'est aussi l'occasion de séparer l'administratif du suivi. Si votre priorité est que le propriétaire comprenne mieux la séance et garde un lien clair avec vous, Biume peut devenir votre espace dédié à l'après-séance.",
          "L'important est de ne pas attendre d'être sous pression: préparez vos informations utiles, testez un nouveau flux, puis migrez progressivement les suivis les plus importants.",
        ],
      },
    ],
    relatedLinks: [
      { href: "/alternatives/neovoice", label: "Alternative NeoVoice" },
      { href: "/comparatifs/neovoice-vs-biume", label: "NeoVoice vs Biume" },
      { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu propriétaire" },
      { href: "/tarifs", label: "Tester Biume" },
    ],
  },
] as const;

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
