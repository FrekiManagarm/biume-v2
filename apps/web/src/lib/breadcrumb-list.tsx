export const breadcrumbProList = (reportId?: string) => [
  {
    title: "Tableau de bord",
    href: `/dashboard`,
  },
  {
    title: "Agenda",
    href: `/dashboard/agenda`,
  },
  {
    title: "Clients",
    href: `/dashboard/clients`,
  },
  {
    title: "Patients",
    href: `/dashboard/patients`,
  },
  {
    title: "Rapports",
    href: `/dashboard/reports`,
    items: [
      {
        title: "Nouveau rapport",
        href: `/dashboard/reports/new`,
      },
      {
        title: "Rapport",
        href: `/dashboard/reports/${reportId}`,
      },
      {
        title: "Edition",
        href: `/dashboard/reports/${reportId}/edit`,
      },
    ],
  },
  {
    title: "Paramètres",
    href: `/dashboard/settings`,
  },
];
