import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@biume/ui/components/accordion";

import { FAQ, FAQ_CONTACT, FAQ_TITLE } from "./content";

export function LandingV5Faq() {
  return (
    <section
      id="questions"
      aria-labelledby="faq-title"
      className="py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[900px]">
        <h2
          id="faq-title"
          className="text-center text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-.04em] text-[color:var(--lv5-ink)]"
        >
          {FAQ_TITLE}
        </h2>

        <Accordion className="mt-10 flex flex-col gap-3">
          {FAQ.map((entry, index) => (
            <AccordionItem
              key={entry.q}
              value={`faq-${index}`}
              className="rounded-[16px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] px-5"
            >
              <AccordionTrigger className="min-h-14 text-left text-[0.98rem] font-semibold text-[color:var(--lv5-ink)]">
                {entry.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[0.94rem] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
                {entry.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-8 text-center text-sm text-[color:var(--lv5-ink-soft)]">
          {FAQ_CONTACT}
        </p>
      </div>
    </section>
  );
}
