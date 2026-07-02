export interface AppContext {
  organizationId?: string;
  currentPage: string;
  selectedPatient?: {
    id: string;
    name?: string;
  };
  selectedClient?: {
    id: string;
    name?: string;
  };
  recentActions: string[];
}

export function buildContextPrompt(context: AppContext): string {
  const sections: string[] = [];
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatted = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  sections.push(
    `Date actuelle : ${dateFormatted} a ${timeFormatted} (ISO : ${now.toISOString()}).`,
  );

  if (context.currentPage) {
    sections.push(`Page actuelle : ${getPageDisplayName(context.currentPage)}.`);
  }

  if (context.organizationId) {
    sections.push(`Organisation active : ${context.organizationId}.`);
  }

  if (context.selectedPatient) {
    sections.push(
      `Patient selectionne : ${context.selectedPatient.name ?? context.selectedPatient.id}.`,
    );
  }

  if (context.selectedClient) {
    sections.push(
      `Client selectionne : ${context.selectedClient.name ?? context.selectedClient.id}.`,
    );
  }

  if (context.recentActions.length > 0) {
    sections.push(`Actions recentes : ${context.recentActions.join(" ; ")}.`);
  }

  return sections.join("\n");
}

function getPageDisplayName(pathname: string): string {
  const pageMap: Record<string, string> = {
    "/dashboard": "Tableau de bord",
    "/dashboard/agenda": "Agenda",
    "/dashboard/patients": "Patients",
    "/dashboard/clients": "Clients",
    "/dashboard/reports": "Rapports",
    "/dashboard/settings": "Parametres",
  };

  for (const [path, name] of Object.entries(pageMap)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return name;
    }
  }

  return pathname;
}

export function addActionToHistory(action: string): void {
  if (typeof window === "undefined") return;

  const stored = window.localStorage.getItem("biume-ai-actions-history");
  const history = stored ? (JSON.parse(stored) as string[]) : [];
  const nextHistory = [action, ...history].slice(0, 5);

  window.localStorage.setItem(
    "biume-ai-actions-history",
    JSON.stringify(nextHistory),
  );
}

export function getActionsHistory(): string[] {
  if (typeof window === "undefined") return [];

  const stored = window.localStorage.getItem("biume-ai-actions-history");
  return stored ? (JSON.parse(stored) as string[]) : [];
}
