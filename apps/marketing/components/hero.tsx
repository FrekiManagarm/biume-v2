import Link from "next/link";
import { webAppPath } from "../lib/web-app-url";

const proofStats = [
  ["4.9/5", "note moyenne"],
  ["15 j", "essai gratuit"],
  ["0 CB", "sans carte bancaire"],
] as const;

const carePoints = [
  ["Dos", "mobilite reduite"],
  ["Bassin", "tension droite"],
  ["Suivi", "repos 48 h"],
] as const;

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-4 pb-16 pt-[7.5rem] md:px-6 md:pb-24 md:pt-[8.5rem]">
      <GridBackdrop />
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-3xl">
          <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-sm font-semibold text-primary shadow-[0_16px_44px_-34px_rgba(124,102,238,0.6)] backdrop-blur-md">
            <span className="relative flex size-2.5 rounded-full bg-secondary">
              <span className="absolute inset-0 rounded-full bg-secondary/45 landing-pulse" />
            </span>
            L&apos;IA au service de la santé animale
          </div>

          <h1 className="landing-reveal landing-reveal-2 mt-7 max-w-2xl text-4xl font-semibold leading-none tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Vos rapports,{" "}
            <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              simplifiés par l&apos;IA
            </span>
          </h1>

          <p className="landing-reveal landing-reveal-3 mt-6 max-w-[60ch] text-base leading-7 text-muted-foreground md:text-lg">
            Biume génère des comptes rendus professionnels, analyse
            l&apos;historique de vos patients et vulgarise vos diagnostics pour que
            vous puissiez vous concentrer sur le soin.
          </p>

          <div className="landing-reveal landing-reveal-4 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_42px_-30px_rgba(124,102,238,0.75)] transition-all hover:bg-primary/88 active:scale-[0.98] sm:w-auto"
            >
              Commencer gratuitement
              <ArrowIcon />
            </Link>
            <Link
              href="https://cal.com/mathieu-chambaud-biume"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-foreground/20 hover:bg-card active:scale-[0.98] sm:w-auto"
            >
              Voir la démo
            </Link>
          </div>

          <div className="landing-reveal landing-reveal-5 mt-10 grid max-w-xl grid-cols-3 divide-x divide-border border-y border-border py-4">
            {proofStats.map(([value, label]) => (
              <div key={label} className="px-4 first:pl-0 last:pr-0">
                <p className="font-mono text-lg font-semibold tracking-tight text-foreground md:text-2xl">
                  {value}
                </p>
                <p className="mt-1 text-xs font-medium leading-4 text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-reveal landing-reveal-3 min-w-0">
          <AppMockup />
        </div>
      </div>
    </section>
  );
}

function AppMockup() {
  return (
    <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-border bg-card/95 p-3 shadow-[0_42px_110px_-72px_rgba(20,18,28,0.52)] backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(rgba(20,18,28,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(20,18,28,0.04)_1px,transparent_1px)] bg-size-[34px_34px]"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-[1.7rem] border border-border/70 bg-background text-foreground shadow-[0_30px_76px_-58px_rgba(20,18,28,0.74)]">
        <div className="border-b border-border bg-card/70 px-4 py-4 md:px-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Résumé de séance
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Naya
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Berger australien · suivi post-séance
              </p>
            </div>
            <div className="hidden rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary sm:block">
              validé par le praticien
            </div>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-border bg-muted/25 p-5 md:border-b-0 md:border-r">
            <div className="relative mx-auto aspect-[4/3] max-w-[280px] rounded-[1.4rem] border border-border bg-card p-5">
              <AnimalBodyMap />
              <div className="absolute left-[48%] top-[32%] size-3 rounded-full border-2 border-background bg-secondary shadow-[0_0_0_6px_rgba(32,184,100,0.12)]" />
              <div className="absolute left-[58%] top-[56%] size-3 rounded-full border-2 border-background bg-secondary/75 shadow-[0_0_0_6px_rgba(32,184,100,0.1)]" />
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-[1.1rem] border border-border bg-card">
              {carePoints.map(([label, value]) => (
                <div key={label} className="px-3 py-3">
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-4 text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5">
            <div className="border-b border-border pb-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
                Points observés
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                Restriction thoraco-lombaire avec compensation du bassin droit.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Mobilite a reprendre progressivement, sans effort intense sur
                les prochaines 48 heures.
              </p>
            </div>

            <div className="py-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Version propriétaire
              </p>
              <div className="mt-3 rounded-[1.2rem] bg-foreground p-4 text-background shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="text-sm font-medium leading-6">
                  Naya a montre une gene sur le bas du dos et le bassin droit.
                  La seance vise a relancer la mobilite, avec repos conseille
                  pendant 48 heures.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[1.1rem] border border-secondary/20 bg-secondary/8 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                Résumé propriétaire prêt
              </p>
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                PDF
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimalBodyMap() {
  return (
    <svg
      viewBox="0 0 260 180"
      className="h-full w-full text-foreground"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M54 95c10-30 39-47 82-45 38 2 65 17 78 42"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="14"
        opacity="0.12"
      />
      <path
        d="M72 92c11-19 31-29 61-29h33c20 0 38 10 48 27"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="16"
        opacity="0.2"
      />
      <path
        d="M57 96c-10-7-18-8-27-3m178-2 18-20m-117 27-10 43m57-43 12 43m-83-41-16 38m117-37 21 35"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="8"
        opacity="0.18"
      />
      <path
        d="M206 85c10-12 20-16 32-11 5 2 8 7 8 12 0 8-6 13-16 13h-18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="10"
        opacity="0.18"
      />
      <path
        d="M86 67c29-16 79-15 110 11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        opacity="0.28"
      />
    </svg>
  );
}

function GridBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 opacity-[0.62] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--border) 72%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--border) 62%, transparent) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />
      <div className="absolute left-[12%] top-[16%] size-[34rem] rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute bottom-[10%] right-[8%] size-[28rem] rounded-full bg-secondary/7 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4 transition-transform group-hover:translate-x-0.5"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h9m0 0-3.5-3.5M12 8l-3.5 3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
