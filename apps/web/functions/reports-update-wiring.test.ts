import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(
  new URL("./reports.function.ts", import.meta.url),
  "utf8",
);
const updateSource = source.slice(
  source.indexOf("export async function updateReport"),
  source.indexOf("export async function getAnatomicalParts"),
);
// Cette signature vit désormais dans `reports.mutations.ts` : la conversion
// fait de `reports.action.ts` un simple ré-export depuis ce fichier (motif
// validé aux tâches 2 et 3), qui ne retape plus aucune signature en clair.
const mutationsSource = readFileSync(
  new URL("../lib/api/actions/reports.mutations.ts", import.meta.url),
  "utf8",
);

describe("report update server wiring", () => {
  test("requires the endpoint-specific update schema", () => {
    // La conversion hors de `createServerFn` déplace la garde de schéma de
    // `.validator(updateReportSchema)` vers `updateReportSchema.parse(input)`,
    // en première ligne du corps : la propriété testée (c'est bien CE schéma
    // qui garde `updateReport`) survit sous la nouvelle syntaxe.
    expect(updateSource).toContain("updateReportSchema.parse(");
    // Propriété inchangée : le type public reste `z.input`, pas `z.infer` —
    // sinon les champs à `.default()` deviendraient obligatoires et la
    // signature publique casserait (règle découverte à la tâche 3).
    expect(mutationsSource).toContain(
      "report: z.input<typeof updateReportSchema>",
    );
  });

  test("executes the optimistic update and all replacements through one atomic statement", () => {
    expect(updateSource).toContain("expectedRevision");
    expect(updateSource).toContain("buildAtomicReportUpdateStatement");
    expect(updateSource).toContain("updateReportWithExpectedRevision");
    expect(updateSource).toContain("buildReportSectionStateRows(");
    expect(updateSource).not.toContain("db.batch(queries)");
  });
});
