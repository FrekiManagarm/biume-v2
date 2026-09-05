import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const appDir = fileURLToPath(new URL("../app", import.meta.url));

/**
 * Cherche tous les `page.tsx` sous `app/` dont le chemin passe par un segment
 * `dashboard` — à n'importe quelle profondeur, y compris sous un futur
 * groupe de routes comme `app/dashboard/(fullscreen)/…/page.tsx`. Équivalent
 * d'un glob `app/**\/dashboard/**\/page.tsx` écrit à la main : aucune
 * dépendance de glob n'est présente dans `apps/web`.
 */
function findDashboardPageFiles(
  dir: string,
  segments: readonly string[] = [],
): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(
        ...findDashboardPageFiles(path.join(dir, entry.name), [
          ...segments,
          entry.name,
        ]),
      );
      continue;
    }

    if (entry.name === "page.tsx" && segments.includes("dashboard")) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

describe("garde de facturation des pages dashboard", () => {
  /**
   * Un layout Next n'est pas ré-exécuté à la navigation cliente entre deux
   * pages qu'il partage : la garde de facturation ne protège donc chaque
   * page que si CHAQUE page du dashboard appelle elle-même
   * `requireActiveBilling` (voir lib/dashboard-billing-guard.ts). Aucun
   * mécanisme de framework ne rend cet oubli impossible — `template.tsx` a
   * été vérifié inopérant pour ce besoin. Ce test est donc le seul filet :
   * il casse à l'instant exact où une page dashboard naît sans sa garde, et
   * c'est sa seule raison d'être. Zéro coût à l'exécution de l'application :
   * il ne lit que des fichiers source, jamais chargés en production.
   */
  it("chaque page.tsx sous app/**/dashboard/** appelle requireActiveBilling", () => {
    const pageFiles = findDashboardPageFiles(appDir);

    // Si cette liste est vide, le test passerait vide de sens : elle doit au
    // moins contenir `app/dashboard/page.tsx`.
    expect(pageFiles.length).toBeGreaterThan(0);

    const pagesWithoutGuard = pageFiles
      .filter((file) => !readFileSync(file, "utf8").includes("requireActiveBilling"))
      .map((file) => path.relative(appDir, file));

    expect(pagesWithoutGuard).toEqual([]);
  });
});
