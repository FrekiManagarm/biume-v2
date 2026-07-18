import Image from "next/image";
import type { JSX } from "react";

export function FieldStories(): JSX.Element {
  return (
    <section
      data-landing-section="field-stories"
      className="px-4 py-16 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-16">
        <div className="rounded-[var(--atelier-surface-radius)] border border-[color:var(--atelier-line)] p-6 sm:p-8 lg:p-10">
          <h2 className="max-w-[13ch] text-balance text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[0.96] tracking-[-0.035em]">
            Conçu autour du terrain, pas autour d’un écran.
          </h2>
          <p className="mt-6 max-w-[58ch] text-pretty text-base leading-7 text-[color:var(--atelier-muted)] md:text-lg">
            Biume suit la séquence réelle après la séance&nbsp;: écrire à partir
            de vos notes, expliquer clairement au propriétaire, valider avant
            l’envoi, puis maintenir le contact.
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1.14fr)_minmax(0,0.86fr)] items-end gap-3 sm:gap-5">
          <figure
            data-field-image="practice"
            className="relative aspect-[4/5] overflow-hidden rounded-[var(--atelier-media-radius)]"
          >
            <Image
              src="/assets/images/landing/atelier-practice.webp"
              alt="Les mains d’une ostéopathe animalière palpant l’épaule d’un chien calme"
              fill
              sizes="(min-width: 1024px) 40vw, 57vw"
              className="object-cover"
            />
          </figure>
          <figure
            data-field-image="owner"
            className="relative mb-[12%] aspect-[4/5] overflow-hidden rounded-[var(--atelier-media-radius)]"
          >
            <Image
              src="/assets/images/landing/atelier-owner.webp"
              alt="Une ostéopathe animalière échangeant avec la propriétaire d’un chien après la séance"
              fill
              sizes="(min-width: 1024px) 30vw, 43vw"
              className="object-cover"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
