import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";

export function LandingClose() {
  return (
    <aside
      aria-labelledby="landing-close-title"
      className="flex min-h-full flex-col rounded-[var(--atelier-surface-radius)] bg-[color:var(--atelier-blue)] p-8 text-[color:var(--atelier-ink)] sm:p-10 lg:p-12"
    >
      <h2
        id="landing-close-title"
        className="max-w-[11ch] text-balance text-[clamp(2.5rem,4.5vw,4.5rem)] font-semibold leading-none tracking-[-0.03em]"
      >
        Préparez votre prochain compte rendu.
      </h2>
      <p className="mt-6 max-w-[42ch] text-pretty text-base leading-7 md:text-lg">
        15 jours pour découvrir tout le parcours, sans carte bancaire.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-auto lg:pt-16">
        <Link
          href={webAppPath("/signup")}
          prefetch={false}
          data-conversion="final-signup"
          className="atelier-action inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-[color:var(--atelier-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--atelier-ink)]"
        >
          Essayer gratuitement
        </Link>
        <Link
          href="https://cal.com/mathieu-chambaud-biume"
          target="_blank"
          rel="noopener noreferrer"
          data-conversion="final-demo"
          className="atelier-action inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-[color:var(--atelier-ink)] bg-transparent px-6 text-sm font-semibold text-[color:var(--atelier-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--atelier-ink)]"
        >
          Demander une démo
        </Link>
      </div>
    </aside>
  );
}
