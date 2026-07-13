export type ReportTransformationStep =
  | Readonly<{ id: "note"; label: "Noter"; body: string }>
  | Readonly<{ id: "structure"; label: "Structurer"; body: string }>
  | Readonly<{
      id: "language";
      label: "Adapter le langage";
      body: string;
    }>
  | Readonly<{ id: "final"; label: "Finaliser"; body: string }>;

export type ReportTransformationDemo = Readonly<{
  observation: string;
  adaptedProposal: string;
  help: string;
  fileName: string;
  finalStatus: string;
  steps: readonly [
    Extract<ReportTransformationStep, { id: "note" }>,
    Extract<ReportTransformationStep, { id: "structure" }>,
    Extract<ReportTransformationStep, { id: "language" }>,
    Extract<ReportTransformationStep, { id: "final" }>,
  ];
}>;

export const REPORT_NOTE_SUMMARY =
  "Mobilité réduite à gauche · thorax. Amélioration pendant la séance.";

export const REPORT_TRANSFORMATION_DEMO = {
  observation:
    "Mobilité réduite à gauche et tension modérée observée au niveau thoracique. La mobilité s'est améliorée pendant la séance.",
  adaptedProposal:
    "Une tension plus présente a été observée du côté gauche, au niveau du thorax. La mobilité s'est améliorée au cours de la séance.",
  help: "Cette proposition remplace le texte du champ lorsque vous choisissez de l'appliquer. Elle reste modifiable.",
  fileName: "Compte-rendu-seance.pdf",
  finalStatus: "Finalisé par vous",
  steps: [
    {
      id: "note",
      label: "Noter",
      body: "Vos observations restent dans votre vocabulaire de praticien.",
    },
    {
      id: "structure",
      label: "Structurer",
      body: "Biume les organise dans les rubriques du compte rendu.",
    },
    {
      id: "language",
      label: "Adapter le langage",
      body: "Vous choisissez d'appliquer une formulation plus accessible, puis vous la modifiez si nécessaire.",
    },
    {
      id: "final",
      label: "Finaliser",
      body: "Vous relisez, finalisez puis déclenchez le téléchargement ou le partage.",
    },
  ],
} as const satisfies ReportTransformationDemo;
