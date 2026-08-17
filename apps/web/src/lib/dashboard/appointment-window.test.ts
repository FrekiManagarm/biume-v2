import { describe, expect, test } from "vitest";

import { defaultAppointmentWindow } from "./appointment-window";

describe("defaultAppointmentWindow", () => {
  test("produit des bornes identiques pour deux appels dans la même journée", () => {
    // Régression : TanStack Router construit la clé de chaque match à partir
    // de `JSON.stringify(loaderDeps)`. Avec `defaultPreload: "intent"` et
    // `defaultPreloadStaleTime: 0`, survoler le lien puis cliquer dessus
    // appelle cette fonction deux fois, à quelques millisecondes d'écart. Si
    // les bornes ne sont pas quantifiées au jour, chaque appel produit une
    // clé différente et le loader tourne deux fois pour la même fenêtre
    // logique.
    const first = defaultAppointmentWindow(
      new Date(2026, 7, 17, 9, 12, 34, 111),
    );
    const second = defaultAppointmentWindow(
      new Date(2026, 7, 17, 18, 45, 1, 999),
    );

    expect(second).toEqual(first);
  });

  test("ne change pas de journée à minuit près", () => {
    // Heures locales explicites (et non des instants UTC) : la quantification
    // se fait au jour civil local, donc le test doit franchir minuit dans le
    // fuseau local, pas dans un fuseau arbitraire.
    const justBeforeMidnight = defaultAppointmentWindow(
      new Date(2026, 7, 17, 23, 59, 59),
    );
    const justAfterMidnight = defaultAppointmentWindow(
      new Date(2026, 7, 18, 0, 0, 1),
    );

    expect(justAfterMidnight).not.toEqual(justBeforeMidnight);
  });

  test("ne déborde pas de mois sur un jour de fin de mois (bug setMonth)", () => {
    // `date.setMonth(date.getMonth() - 2)` sur un 31 août ne clampe pas le
    // débordement de jour : juin n'a que 30 jours, donc `setMonth` roule
    // silencieusement sur le 1er juillet au lieu du 30 juin. `subMonths`
    // (date-fns) clampe correctement.
    const now = new Date(2026, 7, 31, 12, 0, 0); // 31 août 2026, heure locale
    const window = defaultAppointmentWindow(now);
    const from = new Date(window.fromISO);

    expect(from.getMonth()).toBe(5); // juin, jamais juillet (mois 6)
    expect(from.getFullYear()).toBe(2026);
  });

  test("borne le début au début de journée et la fin à la fin de journée", () => {
    const now = new Date(2026, 7, 17, 14, 30, 0);
    const window = defaultAppointmentWindow(now);
    const from = new Date(window.fromISO);
    const to = new Date(window.toISO);

    expect([
      from.getHours(),
      from.getMinutes(),
      from.getSeconds(),
      from.getMilliseconds(),
    ]).toEqual([0, 0, 0, 0]);
    expect([to.getHours(), to.getMinutes(), to.getSeconds()]).toEqual([
      23, 59, 59,
    ]);
  });
});
