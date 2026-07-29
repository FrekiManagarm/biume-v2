import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { DEMO_URL, TRIAL_NOTE } from "./content";
import { Magnetic, Parallax, Reveal } from "./motion";

/**
 * Clôture. L'appel est calé à gauche, comme tout le reste : la v4 n'a
 * pas une seule composition centrée.
 */
export function Close() {
  return (
    <section aria-labelledby="lv4-close-title" className="relative">
      <div className="mx-auto max-w-[1320px] px-[var(--lv4-gutter)] py-28 md:py-36">
        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Parallax distance={34}>
              <Reveal as="h2">
                <span id="lv4-close-title" className="lv4-display block">
                  Écrivez votre prochaine séance comme d&apos;habitude.
                  Envoyez-la autrement.
                </span>
              </Reveal>
            </Parallax>
          </div>

          <Reveal className="lg:col-span-4 lg:col-start-9">
            <div className="flex flex-col gap-3 lg:mt-3">
              <Magnetic strength={0.22} className="w-full">
                <Link
                  href={webAppPath("/signup")}
                  prefetch={false}
                  data-conversion="close-signup"
                  className="lv4-btn lv4-btn-primary w-full"
                >
                  Essayer gratuitement
                </Link>
              </Magnetic>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-conversion="close-demo"
                className="lv4-btn lv4-btn-ghost w-full"
              >
                Demander une démonstration
              </a>
              <p className="lv4-note mt-1 text-center text-[color:var(--lv4-text-3)]">
                {TRIAL_NOTE}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
