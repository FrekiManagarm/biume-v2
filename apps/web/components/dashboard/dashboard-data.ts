export type OwnerStatus = "stable" | "attention" | "blocked";
export type ReportStatus = "ready" | "review" | "draft";

export type Owner = {
  id: string;
  name: string;
  company: string;
  portfolio: string;
  units: number;
  openReports: number;
  revenue: string;
  nextTouch: string;
  status: OwnerStatus;
};

export type AgendaItem = {
  time: string;
  title: string;
  owner: string;
  location: string;
  tone: "default" | "warning" | "success";
};

export type Report = {
  id: string;
  title: string;
  owner: string;
  property: string;
  status: ReportStatus;
  progress: number;
  due: string;
  inspector: string;
  risk: "Low" | "Medium" | "High";
  summary: string;
  sections: Array<{
    name: string;
    state: "Done" | "Review" | "Missing";
    notes: string;
  }>;
  timeline: Array<{
    label: string;
    date: string;
    detail: string;
  }>;
};

export const overviewStats = [
  {
    label: "Portefeuilles actifs",
    value: "28",
    delta: "+4 ce mois",
    glyph: "P",
  },
  {
    label: "Rapports a valider",
    value: "12",
    delta: "3 urgents",
    glyph: "R",
  },
  {
    label: "Rendez-vous semaine",
    value: "47",
    delta: "9 aujourd'hui",
    glyph: "A",
  },
  {
    label: "Conformite moyenne",
    value: "91%",
    delta: "+2.4 pts",
    glyph: "C",
  },
] satisfies Array<{
  label: string;
  value: string;
  delta: string;
  glyph: string;
}>;

export const owners: Owner[] = [
  {
    id: "marceau-holding",
    name: "Aline Marceau",
    company: "Marceau Patrimoine",
    portfolio: "Paris Nord",
    units: 42,
    openReports: 3,
    revenue: "84.7k EUR",
    nextTouch: "Mar 30 juin, 09:30",
    status: "stable",
  },
  {
    id: "belair-fonciere",
    name: "Romain Belair",
    company: "Belair Fonciere",
    portfolio: "Lyon Presqu'ile",
    units: 31,
    openReports: 5,
    revenue: "67.2k EUR",
    nextTouch: "Mer 1 juil, 14:00",
    status: "attention",
  },
  {
    id: "keller-immo",
    name: "Mina Keller",
    company: "Keller Immo",
    portfolio: "Bordeaux Centre",
    units: 24,
    openReports: 1,
    revenue: "46.9k EUR",
    nextTouch: "Jeu 2 juil, 11:15",
    status: "stable",
  },
  {
    id: "saint-eloy",
    name: "Gabriel Saint-Eloy",
    company: "Atelier Saint-Eloy",
    portfolio: "Marseille Littoral",
    units: 18,
    openReports: 6,
    revenue: "38.4k EUR",
    nextTouch: "Ven 3 juil, 16:45",
    status: "blocked",
  },
];

export const agendaItems: AgendaItem[] = [
  {
    time: "08:45",
    title: "Revue incidents techniques",
    owner: "Aline Marceau",
    location: "Visio",
    tone: "warning",
  },
  {
    time: "10:30",
    title: "Etat des lieux T3 - rue Oberkampf",
    owner: "Mina Keller",
    location: "Paris 11",
    tone: "default",
  },
  {
    time: "13:15",
    title: "Validation devis toiture",
    owner: "Romain Belair",
    location: "Lyon 2",
    tone: "success",
  },
  {
    time: "16:00",
    title: "Preparation rapport annuel",
    owner: "Gabriel Saint-Eloy",
    location: "Bureau",
    tone: "default",
  },
];

export const reports: Report[] = [
  {
    id: "audit-1842",
    title: "Audit conformite annuel",
    owner: "Aline Marceau",
    property: "23 rue Oberkampf, Paris",
    status: "review",
    progress: 78,
    due: "30 juin",
    inspector: "Nora Villard",
    risk: "Medium",
    summary:
      "Les controles de securite sont complets. Les justificatifs energetiques attendent la signature proprietaire.",
    sections: [
      {
        name: "Securite",
        state: "Done",
        notes: "Detecteurs et extincteurs verifies.",
      },
      {
        name: "Energie",
        state: "Review",
        notes: "DPE recu, signature manquante.",
      },
      {
        name: "Photos",
        state: "Done",
        notes: "42 photos classees par piece.",
      },
    ],
    timeline: [
      {
        label: "Inspection terrain",
        date: "24 juin",
        detail: "Releve complet transmis par Nora Villard.",
      },
      {
        label: "Controle documentaire",
        date: "26 juin",
        detail: "Deux annexes fiscales ajoutees au dossier.",
      },
      {
        label: "Validation finale",
        date: "30 juin",
        detail: "Attente retour proprietaire avant emission.",
      },
    ],
  },
  {
    id: "sinistre-2719",
    title: "Dossier sinistre degat des eaux",
    owner: "Romain Belair",
    property: "14 quai Saint-Antoine, Lyon",
    status: "draft",
    progress: 46,
    due: "2 juillet",
    inspector: "Ilan Touati",
    risk: "High",
    summary:
      "Le rapport est structure mais les photos de reprise et le devis plombier doivent encore etre consolides.",
    sections: [
      {
        name: "Constat",
        state: "Done",
        notes: "Origine probable identifiee cote cuisine.",
      },
      {
        name: "Pieces jointes",
        state: "Missing",
        notes: "Devis plombier non transmis.",
      },
      {
        name: "Assurance",
        state: "Review",
        notes: "Franchise a confirmer.",
      },
    ],
    timeline: [
      {
        label: "Declaration",
        date: "21 juin",
        detail: "Signalement locataire et ouverture dossier.",
      },
      {
        label: "Visite technique",
        date: "27 juin",
        detail: "Releve humidite et photos effectues.",
      },
      {
        label: "Envoi assureur",
        date: "2 juillet",
        detail: "Cible apres ajout du devis.",
      },
    ],
  },
  {
    id: "revision-3926",
    title: "Revision charges locatives",
    owner: "Mina Keller",
    property: "8 place Fernand Lafargue, Bordeaux",
    status: "ready",
    progress: 100,
    due: "Pret",
    inspector: "Adele Roussel",
    risk: "Low",
    summary:
      "Charges, index et justificatifs sont controles. Le rapport peut etre partage au proprietaire.",
    sections: [
      {
        name: "Charges",
        state: "Done",
        notes: "Comparatif N-1 integre.",
      },
      {
        name: "Index",
        state: "Done",
        notes: "Compteurs conformes aux releves.",
      },
      {
        name: "Synthese",
        state: "Done",
        notes: "Version courte prete.",
      },
    ],
    timeline: [
      {
        label: "Import comptable",
        date: "18 juin",
        detail: "Fichier charges copropriete normalise.",
      },
      {
        label: "Controle ecarts",
        date: "23 juin",
        detail: "Deux lignes corrigees.",
      },
      {
        label: "Publication",
        date: "29 juin",
        detail: "Pret pour envoi.",
      },
    ],
  },
];

export const reportStatusLabels: Record<ReportStatus, string> = {
  ready: "Pret",
  review: "A relire",
  draft: "Brouillon",
};

export const ownerStatusLabels: Record<OwnerStatus, string> = {
  stable: "Stable",
  attention: "A surveiller",
  blocked: "Bloque",
};

export function getReportById(id: string) {
  return reports.find((report) => report.id === id);
}
