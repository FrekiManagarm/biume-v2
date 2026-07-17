export const REPORT_TRANSFORMATION_DEMO = {
  note: "Restriction thoracique gauche. Mobilité améliorée après travail. Conseiller du calme pendant 48 h.",
  sections: [
    { label: "Zone observée", value: "Thorax gauche" },
    {
      label: "Évolution",
      value: "Mobilité améliorée après le travail manuel",
    },
    {
      label: "Conseil",
      value: "Prévoir une activité calme pendant 48 heures",
    },
  ],
  ownerSummary:
    "La mobilité du thorax a été travaillée pendant la séance. Prévoyez une activité calme pendant les prochaines 48 heures.",
} as const;

export type ReportTransformationDemo = typeof REPORT_TRANSFORMATION_DEMO;
