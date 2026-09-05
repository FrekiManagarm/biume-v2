import { usePathname } from "next/navigation";

type PageBannerCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

const defaultPageCopy: PageBannerCopy = {
  eyebrow: "Activité",
  title: "Vue d'ensemble",
  description: "Séances du jour, comptes rendus à terminer et signaux utiles.",
};

const pageCopy: Array<{
  match: (pathname: string) => boolean;
  copy: PageBannerCopy;
}> = [
    {
      match: (pathname) => pathname === "/dashboard" || pathname === "/dashboard/",
      copy: defaultPageCopy,
    },
    {
      match: (pathname) => pathname.startsWith("/dashboard/agenda"),
      copy: {
        eyebrow: "Planning",
        title: "Agenda",
        description:
          "Rendez-vous, créneaux du jour et prochaines consultations.",
      },
    },
    {
      match: (pathname) => pathname.startsWith("/dashboard/assistant"),
      copy: {
        eyebrow: "Assistant",
        title: "Assistant Biume",
        description:
          "Préparez les consultations et structurez vos prochaines actions.",
      },
    },
    {
      match: (pathname) => pathname.startsWith("/dashboard/clients"),
      copy: {
        eyebrow: "Portefeuille",
        title: "Clients",
        description: "Propriétaires, coordonnées et dossiers rattachés.",
      },
    },
    {
      match: (pathname) => pathname.startsWith("/dashboard/patients"),
      copy: {
        eyebrow: "Suivi clinique",
        title: "Patients",
        description: "Animaux suivis, propriétaires et historique de soins.",
      },
    },
    {
      match: (pathname) =>
        pathname.includes("/dashboard/reports") && pathname.includes("/edit"),
      copy: {
        eyebrow: "Comptes rendus",
        title: "Édition du rapport",
        description:
          "Structure clinique, observations et transmission au client.",
      },
    },
    {
      match: (pathname) => pathname.includes("/dashboard/reports"),
      copy: {
        eyebrow: "Comptes rendus",
        title: "Rapports",
        description:
          "Bibliothèque clinique, brouillons et transmissions client.",
      },
    },
    {
      match: (pathname) => pathname.startsWith("/dashboard/settings"),
      copy: {
        eyebrow: "Réglages",
        title: "Paramètres",
        description: "Identité, notifications et abonnement de l'entreprise.",
      },
    },
  ];

export function DashboardPageBanner() {
  const pathname = usePathname();
  const copy =
    pageCopy.find((item) => item.match(pathname))?.copy ?? defaultPageCopy;

  return (
    <section className="mb-5 border-b border-slate-200/80 pb-4 pt-1 text-slate-950">
      <div className="min-w-0">
        <div className="grid max-w-3xl gap-2">
          <h1 className="truncate text-2xl font-semibold leading-none tracking-tight text-slate-950 md:text-3xl">
            {copy.title}
          </h1>
          <p className="text-sm leading-5 text-slate-500">
            {copy.description}
          </p>
        </div>
      </div>
    </section>
  );
}
