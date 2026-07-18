import { TransformationMotion } from "./transformation-motion";
import type { REPORT_TRANSFORMATION_DEMO } from "./report-transformation-demo";

export function TransformationWorkshop({
  demo,
}: {
  demo: typeof REPORT_TRANSFORMATION_DEMO;
}) {
  const stages = [
    {
      id: "notes",
      title: "Notes de séance",
      body: demo.note,
      tone: "neutral",
    },
    {
      id: "proposal",
      title: "Reformulation proposée",
      body: demo.sections
        .map((section) => `${section.label} : ${section.value}`)
        .join(" · "),
      tone: "blue",
    },
    {
      id: "review",
      title: "Compte rendu à valider",
      body: demo.ownerSummary,
      tone: "violet",
    },
  ] as const;

  return (
    <section
      id="produit"
      data-landing-section="transformation"
      className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(30rem,1.2fr)] lg:gap-16">
        <div className="lg:pt-8">
          <h2 className="max-w-[14ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-semibold leading-none tracking-[-0.03em]">
            Ce que vous notez reste précis. Ce que le propriétaire lit devient
            clair.
          </h2>
          <p className="mt-6 max-w-[56ch] text-pretty text-base leading-7 text-[color:var(--atelier-muted)] md:text-lg">
            Biume organise vos observations sans les appauvrir. Vous retrouvez
            chaque information, puis vous relisez la version destinée au
            propriétaire.
          </p>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <TransformationMotion stages={stages} />
        </div>
      </div>
    </section>
  );
}
