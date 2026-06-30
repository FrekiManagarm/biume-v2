/**
 * Identifiants Autumn alignés sur `autumn.config.ts` (sans dépendance atmn / Node).
 * Utiliser ce module dans les composants client — ne pas importer `autumn.config` côté client.
 */
export const autumnFeatureIds = {
  supportPrioritaire: "support_prioritaire",
  fichesClientsPatientsIllimits: "fiches_clients_patients_illimits",
  suiviDeSantIntelligent: "suivi_de_sant_intelligent",
  exportPdfProfessionnel: "export_pdf_professionnel",
  iaVulgarisation: "ia_vulgarisation",
  rapportsIllimits: "rapports_illimits",
} as const;

export const autumnPlanIds = {
  allInclusiveMonthly: "all_inclusive_monthly",
  allInclusiveYearly: "all_inclusive_yearly",
} as const;
