import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { DEMO_URL, TRIAL_NOTE } from "./chapters";
import { Reveal } from "./motion";

/**
 * Clôture — le récit revient sur le plan sombre qui l'a ouvert. La
 * page se referme sur le geste, pas sur un bloc de texte.
 *
 * Voile calibré pour que le blanc tienne largement AA sur toute la
 * surface où l'encre se pose (mesuré : 12:1 au pire point).
 */
export function Close() {
  return (
    <section
      aria-labelledby="lv3-close-title"
      className="relative isolate overflow-hidden bg-[color:var(--lv3-anthracite)]"
    >
      <Image
        src="/assets/images/landing/atelier-practice.webp"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[62%_26%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(100deg, rgb(32 32 36 / 0.93) 0%, rgb(32 32 36 / 0.88) 38%, rgb(32 32 36 / 0.55) 70%, rgb(32 32 36 / 0.3) 100%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-5 py-28 md:px-8 md:py-36">
        <div className="max-w-[38rem]">
          <Reveal as="h2">
            <span
              id="lv3-close-title"
              className="lv3-chapter-title block text-[color:var(--lv3-on-dark)]"
            >
              Préparez votre prochain compte rendu.
            </span>
          </Reveal>

          <Reveal as="p">
            <span className="lv3-lead mt-5 block text-[color:var(--lv3-on-photo)]">
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
                className="lv3-btn lv3-btn-on-dark w-full sm:w-auto"
              >
                Essayer gratuitement
              </Link>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-conversion="close-demo"
                className="lv3-btn lv3-btn-ghost-dark w-full sm:w-auto"
              >
                Demander une démonstration
              </a>
            </div>
            <p className="mt-4 text-[0.85rem] text-[color:var(--lv3-on-photo)]">
              {TRIAL_NOTE}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
