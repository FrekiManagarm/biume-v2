import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@biume/ui/components/accordion";

import { FAQ, FAQ_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5Faq() {
  return (
    <section
      id="questions"
      aria-labelledby="faq-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-[clamp(28px,5vw,72px)]">
        <Reveal className="min-w-[260px] max-w-[14ch] flex-1 basis-[280px]">
          <h2
            id="faq-title"
            className="text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
          >
            {FAQ_TITLE}
          </h2>
        </Reveal>
        <Reveal delay={90} className="min-w-[300px] flex-1 basis-[480px]">
          <Accordion hiddenUntilFound className="border-t border-[color:var(--lv5-line)]">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-[color:var(--lv5-line)]">
                <AccordionTrigger className="min-h-14 text-[1.08rem] font-semibold leading-[1.35] text-[color:var(--lv5-ink)] **:data-[slot=accordion-trigger-icon]:text-[color:var(--lv5-violet)]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="max-w-[62ch] text-[1rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
                    {item.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
