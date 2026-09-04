import {
  ATELIER_EYEBROW,
  ATELIER_HISTORY,
  ATELIER_LEAD,
  ATELIER_TITLE,
  ATELIER_VERSIONS,
  ATELIER_WORKSPACE,
} from "./content";
import { HeroAnatomyPreview } from "./anatomy-widget";
import { appFontVariables } from "./app-fonts";
import { Reveal } from "./motion";

/**
 * Vocabulaire d'état repris tel quel du module rapport réel
 * (apps/web/.../reports-module/components/ReportSidebarNavigation.tsx,
 * `professionalStateLabel`) — aucun libellé inventé pour cette maquette.
 */
const SECTION_STATE_LABEL: Record<string, string> = {
  confirmed: "Confirmé",
  needs_confirmation: "À confirmer",
  proposed: "Proposé",
  empty: "À renseigner",
};

/**
 * `professionalStateClassName` du module : le confirmé passe au vert, le
 * reste au blanc atténué — et au violet sur l'onglet actif, dont la surface
 * est blanche.
 */
function sectionStateColor(state: string, active: boolean) {
  if (state === "confirmed") return active ? "#047857" : "#A7F3D0";
  return active ? "rgba(106,82,214,.75)" : "rgba(255,255,255,.80)";
}

/** `ownerStatusPresentation` : le vert quand c'est prêt, l'ambre sinon. */
const OWNER_STATUS: Record<string, { color: string; background: string }> = {
  "Prêt": { color: "#064E3B", background: "#D1FAE5" },
  "À préparer": { color: "#78350F", background: "#FEF3C7" },
};

const WIDE_TILE =
  "min-w-0 rounded-[22px] border border-(--lv5-line) bg-(--lv5-surface) p-[clamp(18px,2.2vw,26px)]";

const NARROW_TILE =
  "min-w-0 rounded-[22px] border border-(--lv5-line) bg-(--lv5-surface) p-[clamp(22px,2.6vw,30px)]";

const TILE_TITLE = "m-0 mb-2.5 text-[1.2rem] font-semibold tracking-[-.015em] text-(--lv5-ink)";

export function LandingV5Atelier() {
  return (
    <section
      id="atelier"
      aria-labelledby="atelier-title"
      className="bg-(--lv5-surface-muted) py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[1180px]">
        <p className="m-0 flex justify-center">
          <span className="inline-flex items-center rounded-full border border-(--lv5-line) bg-(--lv5-surface) px-3.5 py-[5px] text-[0.76rem] font-semibold uppercase tracking-[.06em] text-(--lv5-violet)">
            {ATELIER_EYEBROW}
          </span>
        </p>

        <h2
          id="atelier-title"
          className="mx-auto mt-[18px] max-w-[26ch] text-center text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-.04em] text-(--lv5-ink)"
        >
          {ATELIER_TITLE}
        </h2>

        <p className="mx-auto mt-[18px] max-w-[58ch] text-center text-[1.02rem] leading-[1.65] text-(--lv5-ink-soft) [text-wrap:pretty]">
          {ATELIER_LEAD}
        </p>

        <div className="mt-[clamp(32px,4vw,52px)] flex flex-col gap-[clamp(16px,2.2vw,24px)] text-left">
          <Reveal delay={0} className={WIDE_TILE}>
            <h3 className={TILE_TITLE}>{ATELIER_WORKSPACE.title}</h3>
            <p className="m-0 mb-4 max-w-[56ch] text-[0.98rem] leading-[1.6] text-(--lv5-ink-soft)">
              {ATELIER_WORKSPACE.body}
            </p>

            <div
              aria-hidden="true"
              className={`biume-app-mock biume-web-mock ${appFontVariables} overflow-hidden rounded-2xl border border-(--lv5-frame-border) shadow-[0_1px_2px_rgba(29,29,33,.05)]`}
              style={{ background: "var(--app-muted)" }}
            >
              <div className="flex items-center gap-1.5 border-b border-(--lv5-frame-border) bg-(--lv5-canvas) px-3.5 py-2.5">
                <span className="size-2.5 rounded-full bg-(--lv5-line)" />
                <span className="size-2.5 rounded-full bg-(--lv5-line)" />
                <span className="size-2.5 rounded-full bg-(--lv5-line)" />
                <span className="mx-auto rounded-full bg-(--lv5-surface) px-4 py-1 text-[0.72rem] text-(--lv5-ink-tertiary)">
                  {ATELIER_WORKSPACE.url}
                </span>
              </div>

              <div className="flex flex-col gap-3 p-3 text-left sm:flex-row">
                {/* La barre latérale du module : la seule surface pleine
                    violette de l'application, et la seule à porter les états. */}
                <aside
                  className="flex w-full shrink-0 flex-col gap-3 rounded-[18px] p-3 sm:w-56"
                  style={{ background: "var(--app-violet)", color: "#fff" }}
                >
                  <div className="border-b border-white/15 pb-3">
                    <p className="m-0 text-[0.82rem] font-semibold">
                      {ATELIER_WORKSPACE.sidebarTitle}
                    </p>
                    <p className="m-0 mt-0.5 text-[0.72rem] text-white/70">
                      {ATELIER_WORKSPACE.progressLabel}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {ATELIER_WORKSPACE.sections.map((section) => (
                      <span
                        key={section.label}
                        className="flex items-center gap-2 rounded-[10px] px-2.5 py-2"
                        style={{
                          background: section.active ? "#fff" : "transparent",
                          color: section.active ? "var(--app-violet)" : "#fff",
                        }}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.82rem] font-medium">
                            {section.label}
                            <span className="ml-1.5 text-[0.7rem] opacity-75">
                              {section.count}
                            </span>
                          </span>
                          <span
                            className="mt-0.5 block text-[0.64rem] font-medium"
                            style={{
                              color: sectionStateColor(section.state, section.active),
                            }}
                          >
                            {SECTION_STATE_LABEL[section.state]}
                          </span>
                        </span>
                        {section.owner ? (
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold"
                            style={OWNER_STATUS[section.owner]}
                          >
                            {section.owner}
                          </span>
                        ) : null}
                      </span>
                    ))}
                  </div>

                  <span
                    className="mt-1 flex items-center justify-center rounded-[10px] py-2 text-[0.76rem] font-semibold"
                    style={{ background: "#fff", color: "var(--app-violet)" }}
                  >
                    {ATELIER_WORKSPACE.prepare}
                  </span>
                </aside>

                <div
                  className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[18px]"
                  style={{
                    border: "1px solid var(--app-line-strong)",
                    background: "var(--app-canvas)",
                  }}
                >
                  <div className="min-w-0 flex-1 p-[clamp(14px,2vw,22px)]">
                    <HeroAnatomyPreview />
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-(--lv5-violet-soft) px-3 py-1 text-[0.76rem] font-semibold text-(--lv5-violet-ink)">
                        {ATELIER_WORKSPACE.anatomyZone}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-(--lv5-line) px-3 py-1 text-[0.76rem] text-(--lv5-ink-mid)">
                        {ATELIER_WORKSPACE.anatomySide}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-(--lv5-line) px-3 py-1 text-[0.76rem] text-(--lv5-ink-mid)">
                        {ATELIER_WORKSPACE.anatomySeverity}
                      </span>
                    </div>
                  </div>

                  {/* La barre de décision, collée en bas comme dans le module :
                      c'est elle qui fait passer la section à « Confirmé ». */}
                  <div
                    className="flex flex-wrap items-center gap-2 px-[clamp(14px,2vw,22px)] py-2.5"
                    style={{
                      borderTop: "1px solid var(--app-line-strong)",
                      background: "var(--app-canvas)",
                    }}
                  >
                    <span
                      className="inline-flex h-8 items-center rounded-[12px] px-3 text-[0.78rem] font-medium"
                      style={{
                        border: "1px solid var(--app-line-strong)",
                        background: "var(--app-surface)",
                        color: "var(--app-ink)",
                      }}
                    >
                      {ATELIER_WORKSPACE.decisionConfirm}
                    </span>
                    <span
                      className="inline-flex h-8 items-center rounded-[12px] px-3 text-[0.78rem] font-medium"
                      style={{ color: "var(--app-ink-soft)" }}
                    >
                      {ATELIER_WORKSPACE.decisionDismiss}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-[clamp(16px,2.2vw,24px)] sm:grid-cols-2">
          <Reveal delay={90} className={NARROW_TILE}>
            <h3 className={TILE_TITLE}>{ATELIER_HISTORY.title}</h3>
            <p className="m-0 mb-4 text-[0.98rem] leading-[1.6] text-(--lv5-ink-soft)">
              {ATELIER_HISTORY.body}
            </p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {ATELIER_HISTORY.rows.map((row) => (
                <li
                  key={row.when}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-(--lv5-line) px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="m-0 font-(--lv5-font-mono) text-[0.7rem] text-(--lv5-ink-tertiary)">
                      {row.when}
                    </p>
                    <p className="m-0 text-[0.86rem] text-(--lv5-ink)">{row.label}</p>
                  </div>
                  <span className="shrink-0 text-[0.72rem] font-semibold text-(--lv5-violet)">
                    {row.recurrence}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={150} className={NARROW_TILE}>
            <h3 className={TILE_TITLE}>{ATELIER_VERSIONS.title}</h3>
            <p className="m-0 mb-4 text-[0.98rem] leading-[1.6] text-(--lv5-ink-soft)">
              {ATELIER_VERSIONS.body}
            </p>
            <div className="flex flex-col gap-2.5">
              {/* Lecture seule sur fond atténué, comme le `Textarea` du
                  panneau : le texte professionnel ne se réécrit pas. */}
              <div
                className="rounded-[10px] border p-3"
                style={{
                  borderColor: "var(--app-line-strong)",
                  background: "var(--app-muted)",
                }}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[.05em] text-(--lv5-ink-tertiary)">
                    {ATELIER_VERSIONS.practitioner.label}
                  </span>
                  <span className="text-[0.68rem] font-semibold text-(--lv5-green-ink)">
                    {ATELIER_VERSIONS.practitioner.status}
                  </span>
                </div>
                <p className="m-0 text-[0.82rem] leading-[1.55] text-(--lv5-ink-soft)">
                  {ATELIER_VERSIONS.practitioner.extract}
                </p>
              </div>

              <div className="rounded-[10px] border border-(--lv5-line) p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[.05em] text-(--lv5-ink-tertiary)">
                    {ATELIER_VERSIONS.owner.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-(--lv5-green-ink)">
                    <span className="size-1.5 rounded-full bg-(--lv5-green)" />
                    {ATELIER_VERSIONS.owner.status}
                  </span>
                </div>
                <p className="m-0 text-[0.84rem] leading-[1.5] text-(--lv5-ink)">
                  {ATELIER_VERSIONS.owner.extract}
                </p>
              </div>
            </div>
          </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
