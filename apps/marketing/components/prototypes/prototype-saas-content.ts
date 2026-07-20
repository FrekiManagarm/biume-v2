export const SAAS_NARRATIVE_CONTENT = {
  trust: {
    eyebrow: "Biume pour le suivi après séance",
    title: "Le compte rendu propriétaire reste sous votre contrôle.",
    body: "Vos notes restent la base. Vous validez chaque contenu avant son partage.",
  },
  tension: {
    title: "Après la séance, le bon message ne devrait pas dépendre de la mémoire.",
    body: "Les observations, les conseils et la prochaine étape ont besoin d'un fil clair pour le propriétaire comme pour le praticien.",
  },
  method: {
    title: "Un parcours simple, de vos notes au suivi.",
    steps: [
      "Structurer le compte rendu propriétaire à partir de vos notes.",
      "Valider le contenu avant de le partager.",
      "Exporter un PDF professionnel et préparer le prochain rappel.",
    ],
  },
  benefits: [
    "Un compte rendu propriétaire structuré.",
    "Une validation du praticien avant chaque partage.",
    "Un export PDF professionnel.",
    "Des rappels de suivi préparés au moment choisi.",
  ],
  useCases: [
    {
      title: "Après le rendez-vous",
      body: "Préparez un compte rendu clair à partir de vos observations, puis gardez la main sur chaque formulation.",
    },
    {
      title: "Pour la suite",
      body: "Conservez le contexte de la séance et préparez un rappel lorsque vous le jugez pertinent.",
    },
  ],
  comparison: {
    without: "Des notes, un partage et un suivi à retrouver séparément.",
    with: "Un parcours qui relie compte rendu propriétaire, validation, PDF et rappel de suivi.",
  },
  pricing: {
    annual: "24,99 €",
    monthly: "29,99 €",
    trial: "15 jours",
    cardRequired: false,
    annualDetail: "par mois, facturé annuellement",
    monthlyDetail: "par mois, facturation mensuelle",
  },
  faq: [
    {
      question: "Puis-je valider le texte avant le partage ?",
      answer: "Oui. Le praticien garde la validation finale avant tout partage.",
    },
    {
      question: "Que reçoit le propriétaire ?",
      answer: "Un PDF professionnel que vous choisissez de partager.",
    },
    {
      question: "Comment fonctionne l'essai ?",
      answer: "L'essai dure 15 jours et ne demande pas de carte bancaire.",
    },
  ],
} as const;
