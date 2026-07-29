import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { DEMO_URL, TRIAL_NOTE } from "./constants";
import { Reveal } from "./motion";

/**
 * Bande média de clôture : la page se referme sur le geste, pas sur un
 * bloc de texte. Voile opaque calibré pour que le blanc tienne
 * largement AA sur toute la surface de la photo.
 */
export function Close() {
  return (
    <section
      aria-labelledby="lv2-close-title"
      className="relative isolate overflow-hidden"
    >
      <Image
        src="/assets/images/landing/atelier-practice.webp"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[62%_28%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          // Opaque là où le texte se pose, franchement ouvert à droite
          // pour que la photographie existe encore.
          background:
            "linear-gradient(100deg, rgb(32 32 36 / 0.92) 0%, rgb(32 32 36 / 0.88) 38%, rgb(32 32 36 / 0.55) 70%, rgb(32 32 36 / 0.3) 100%)",
        }}
      />

      <div className="mx-auto max-w-[1240px] px-5 py-28 md:px-8 md:py-36">
        <div className="max-w-[38rem]">
          <Reveal as="h2">
            <span
              id="lv2-close-title"
              className="lv2-headline block text-[color:var(--lv2-on-dark)]"
            >
              Préparez votre prochain compte rendu.
            </span>
          </Reveal>

          <Reveal as="p">
            <span className="lv2-body mt-5 block text-[color:var(--lv2-on-dark-2)]">
              Quinze jours pour écrire vos notes comme d&apos;habitude et voir
              ce que le propriétaire reçoit à l&apos;arrivée.
            </span>
          </Reveal>

          <Reveal>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                data-conversion="close-signup"
                className="lv2-btn lv2-btn-on-dark w-full sm:w-auto"
              >
                Essayer gratuitement
              </Link>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-conversion="close-demo"
                className="lv2-btn lv2-btn-ghost-dark w-full sm:w-auto"
              >
                Demander une démonstration
              </a>
            </div>
            <p className="mt-4 text-[0.85rem] text-[color:var(--lv2-on-dark-2)]">
              {TRIAL_NOTE}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
