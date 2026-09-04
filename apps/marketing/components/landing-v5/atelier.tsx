import {
  ATELIER_EYEBROW,
  ATELIER_HISTORY,
  ATELIER_LEAD,
  ATELIER_TITLE,
  ATELIER_VERSIONS,
  ATELIER_WORKSPACE,
} from "./content";
import { HeroAnatomyPreview } from "./anatomy-widget";
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

const SECTION_STATE_TONE: Record<string, string> = {
  confirmed: "text-(--lv5-green-ink)",
  needs_confirmation: "text-(--lv5-violet-ink)",
  proposed: "text-(--lv5-ink-tertiary)",
  empty: "text-(--lv5-ink-tertiary)",
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
              className="overflow-hidden rounded-2xl border border-(--lv5-frame-border) bg-(--lv5-canvas) shadow-[0_1px_2px_rgba(29,29,33,.05)]"
            >
              <div className="flex items-center gap-1.5 border-b border-(--lv5-frame-border) px-3.5 py-2.5">
                <span className="size-2.5 rounded-full bg-(--lv5-line)" />
                <span className="size-2.5 rounded-full bg-(--lv5-line)" />
                <span className="size-2.5 rounded-full bg-(--lv5-line)" />
                <span className="mx-auto rounded-full bg-(--lv5-surface) px-4 py-1 text-[0.72rem] text-(--lv5-ink-tertiary)">
                  app.biume.com/rapports/nashira
                </span>
              </div>

              <div className="flex flex-col text-left sm:flex-row">
                <aside className="flex w-full shrink-0 flex-col gap-4 border-b border-(--lv5-frame-border) bg-(--lv5-canvas) p-3.5 sm:w-48 sm:border-r sm:border-b-0">
                  <div>
                    <p className="m-0 text-[0.72rem] font-semibold text-(--lv5-ink)">
                      {ATELIER_WORKSPACE.progressLabel}
                    </p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-(--lv5-line)">
                      <div
                        className="h-full rounded-full bg-(--lv5-violet)"
                        style={{ width: `${ATELIER_WORKSPACE.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {ATELIER_WORKSPACE.sections.map((section) => {
                      const active = "active" in section && section.active;

                      return (
                        <span
                          key={section.label}
                          className={
                            active
                              ? "flex flex-col gap-0.5 rounded-[9px] bg-(--lv5-violet-soft) px-2.5 py-2"
                              : "flex flex-col gap-0.5 rounded-[9px] px-2.5 py-2"
                          }
                        >
                          <span
                            className={`text-[0.82rem] font-semibold ${
                              active ? "text-(--lv5-violet-ink)" : "text-(--lv5-ink-mid)"
                            }`}
                          >
                            {section.label}
                          </span>
                          <span
                            className={`text-[0.66rem] font-semibold ${SECTION_STATE_TONE[section.state]}`}
                          >
                            {SECTION_STATE_LABEL[section.state]}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </aside>

                <div className="min-w-0 flex-1 bg-(--lv5-surface) p-[clamp(14px,2vw,22px)]">
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
              <div
                className="rounded-[10px] p-3"
                style={{ background: "var(--lv5-anthracite)", color: "rgba(253,253,251,.86)" }}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span
                    className="text-[0.68rem] font-semibold uppercase tracking-[.05em]"
                    style={{ color: "rgba(253,253,251,.5)" }}
                  >
                    {ATELIER_VERSIONS.practitioner.label}
                  </span>
                  <span className="text-[0.68rem] font-semibold text-(--lv5-green)">
                    {ATELIER_VERSIONS.practitioner.status}
                  </span>
                </div>
                <p className="m-0 font-(--lv5-font-mono) text-[0.78rem] leading-[1.5]">
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
