/// Le plancher est métier : un questionnaire envoyé le lendemain ne mesure
/// rien, l'animal n'a pas eu le temps d'évoluer. Le plafond évite qu'une
/// échéance lointaine se perde dans un agenda et ne soit jamais honorée.
const int followUpMinDelayDays = 3;
const int followUpMaxDelayDays = 90;
const int followUpDefaultDelayDays = 7;

/// Copie exacte du contrat serveur (`packages/contracts/src/followup.ts`,
/// constante `defaultFollowUpQuestionnaire`).
///
/// Le mobile **valide, il n'édite pas** : ce questionnaire n'est pas
/// personnalisable depuis l'application, la personnalisation reste sur le
/// web. Toute divergence avec le contrat romprait le décodage des réponses
/// côté serveur.
const Map<String, dynamic> defaultFollowUpQuestionnaire = {
  'questions': [
    {
      'kind': 'scale',
      'id': 'evolution',
      'label': 'Comment va votre animal depuis la séance ?',
      'options': [
        {'value': 'better', 'label': 'Mieux'},
        {'value': 'same', 'label': 'Pareil'},
        {'value': 'worse', 'label': 'Moins bien'},
      ],
    },
    {
      'kind': 'text',
      'id': 'reaction',
      'label': 'Avez-vous remarqué une réaction ou un changement particulier ?',
    },
    {
      'kind': 'boolean',
      'id': 'wantsContact',
      'label': 'Souhaitez-vous être recontacté ?',
    },
  ],
};

/// Les libellés à afficher, dans l'ordre du questionnaire — identiques à
/// ceux de [defaultFollowUpQuestionnaire]. Un test vérifie qu'ils restent en
/// phase : toute divergence entre l'écran et ce qui part réellement au
/// serveur serait invisible sinon.
const List<String> defaultFollowUpQuestionLabels = [
  'Comment va votre animal depuis la séance ?',
  'Avez-vous remarqué une réaction ou un changement particulier ?',
  'Souhaitez-vous être recontacté ?',
];
