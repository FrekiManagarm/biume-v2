import { Tabs, TabsContent, TabsList, TabsTrigger } from "@biume/ui/components/tabs";

import { SPECIMEN_STEPS, TABS_EYEBROW, TABS_LEAD, TABS_NOTE, TABS_SUBJECT, TABS_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5ReportTabs() {
  return (
    <section
      id="produit"
      aria-labelledby="tabs-title"
      className="lv5-grid-bg-dark bg-(--lv5-anthracite) py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)] text-[rgba(253,253,251,.82)]"
    >
      <div className="mx-auto max-w-295">
        <p className="text-[0.76rem] font-semibold uppercase tracking-[.06em] text-(--lv5-violet-light)">
          {TABS_EYEBROW}
        </p>
        <h2 id="tabs-title" className="mt-2 text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-0.04em] text-(--lv5-surface)">
          {TABS_TITLE}
        </h2>
        <p className="mt-4 max-w-[54ch] text-[rgba(253,253,251,.66)]">{TABS_LEAD}</p>

        <Reveal delay={120}>
          <Tabs defaultValue={SPECIMEN_STEPS[0]!.id} className="mt-10">
            <TabsList aria-label={TABS_TITLE} className="flex flex-wrap gap-2 bg-transparent p-0">
              {SPECIMEN_STEPS.map((step) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="min-h-11 rounded-full px-5 text-sm font-semibold text-[rgba(253,253,251,.62)] data-active:bg-(--lv5-violet) data-active:text-white not-data-active:bg-[rgba(253,253,251,.08)]"
                >
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {SPECIMEN_STEPS.map((step) => (
              <TabsContent key={step.id} value={step.id} className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-(--lv5-radius-card) bg-[rgba(253,253,251,.05)] p-5">
                  <p className="text-xs uppercase tracking-[.06em] text-[rgba(253,253,251,.44)]">
                    {TABS_SUBJECT}
                  </p>
                  <p className="mt-3 font-(--lv5-font-mono) text-[0.84rem] text-[rgba(253,253,251,.72)]">
                    {step.raw}
                  </p>
                </div>
                <div className="rounded-(--lv5-radius-card) bg-(--lv5-surface) p-5 text-(--lv5-ink)">
                  <p className="text-xs font-(--lv5-font-mono) uppercase tracking-[.06em] text-(--lv5-ink-tertiary)">
                    Compte rendu propriétaire
                  </p>
                  <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.015em]">
                    {step.heading}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-[1.6] text-(--lv5-ink-mid)">
                    {step.out}
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Reveal>

        <p className="mt-6 text-xs text-[rgba(253,253,251,.4)]">{TABS_NOTE}</p>
      </div>
    </section>
  );
}
