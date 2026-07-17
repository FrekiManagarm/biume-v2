import type { JSX } from "react";

import { PractitionerControlDemo } from "./practitioner-control-demo";

export function PractitionerControl(): JSX.Element {
  return (
    <section
      data-landing-section="control"
      className="bg-[color:var(--atelier-violet)] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(38rem,1.28fr)] lg:items-center lg:gap-16">
        <div>
          <h2 className="max-w-[11ch] text-balance text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[0.96] tracking-[-0.035em]">
            Biume prépare. Vous gardez la main.
          </h2>
          <p className="mt-6 max-w-[54ch] text-pretty text-base leading-7 text-white/85 md:text-lg">
            Biume structure vos notes sans décider à votre place. Vous
            relisez, reformulez et validez chaque passage. Rien n’est partagé
            automatiquement.
          </p>
        </div>

        <PractitionerControlDemo />
      </div>
    </section>
  );
}
