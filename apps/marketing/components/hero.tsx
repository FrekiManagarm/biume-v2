import Link from "next/link";
import Image from "next/image";
import { webAppPath } from "../lib/web-app-url";

const proofStats = [
  ["4.9/5", "note moyenne"],
  ["15 j", "essai gratuit"],
  ["0 CB", "sans carte bancaire"],
] as const;

const animalAssets = [
  {
    src: "/assets/images/horse-left-side.png",
    alt: "Schéma ostéologique latéral d'un cheval",
    label: "Cheval",
    number: "01",
    note: "chaîne dorsale",
  },
  {
    src: "/assets/images/dog-right-side.jpg",
    alt: "Schéma ostéologique latéral d'un chien",
    label: "Chien",
    number: "02",
    note: "bassin droit",
  },
  {
    src: "/assets/images/cat-left-side.jpg",
    alt: "Schéma ostéologique latéral d'un chat",
    label: "Chat",
    number: "03",
    note: "mobilité cervicale",
  },
] as const;

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-4 pb-16 pt-[7.5rem] md:px-6 md:pb-24 md:pt-[8.5rem]">
      <GridBackdrop />
      <div className="relative mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="max-w-2xl">
          <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-sm font-semibold text-foreground shadow-[0_14px_34px_-30px_rgba(124,102,238,0.52)] backdrop-blur-md">
            <span className="relative flex size-2.5 rounded-full bg-secondary">
              <span className="absolute inset-0 rounded-full bg-secondary/45 landing-pulse" />
            </span>
            L&apos;IA au service de la santé animale
          </div>

          <h1 className="landing-reveal landing-reveal-2 mt-6 max-w-2xl text-4xl font-semibold leading-none tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Vos rapports,{" "}
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              simplifiés par l&apos;IA
            </span>
          </h1>

          <p className="landing-reveal landing-reveal-3 mt-5 max-w-[56ch] text-base leading-7 text-muted-foreground md:text-lg">
            Biume génère des comptes rendus professionnels, analyse
            l&apos;historique de vos patients et vulgarise vos diagnostics pour que
            vous puissiez vous concentrer sur le soin.
          </p>

          <div className="landing-reveal landing-reveal-4 mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_42px_-30px_rgba(124,102,238,0.68)] transition-all hover:bg-primary/88 active:scale-[0.98] sm:w-auto"
            >
              Commencer gratuitement
              <ArrowIcon />
            </Link>
            <Link
              href="https://cal.com/mathieu-chambaud-biume"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full border border-secondary/25 bg-background/70 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-secondary/45 hover:bg-secondary/8 active:scale-[0.98] sm:w-auto"
            >
              Voir la démo
            </Link>
          </div>

          <div className="landing-reveal landing-reveal-5 mt-8 hidden max-w-xl grid-cols-3 divide-x divide-border border-y border-border py-4 sm:grid">
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
          <AtlasMockup />
        </div>
      </div>
    </section>
  );
}

function AtlasMockup() {
  const [horse, dog, cat] = animalAssets;

  return (
    <div className="relative mx-auto min-h-[520px] w-full max-w-3xl sm:min-h-[580px] lg:min-h-[610px]">
      <div className="hero-field-drift absolute inset-x-2 bottom-9 top-5 rounded-[2.25rem] border border-white/70 bg-[linear-gradient(135deg,rgba(124,102,238,0.2),rgba(255,255,255,0.78)_38%,rgba(32,184,100,0.22)_72%,rgba(124,102,238,0.14))] shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_34px_120px_-86px_rgba(20,18,28,0.74)]" />
      <div className="absolute inset-x-2 bottom-9 top-5 overflow-hidden rounded-[2.25rem]">
        <div className="hero-scan-line absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/0 via-white/55 to-white/0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,18,28,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,18,28,0.04)_1px,transparent_1px)] bg-size-[46px_46px] opacity-45" />
      </div>

      <div className="absolute left-2 top-0 z-[1] rounded-full border border-border/70 bg-background/88 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground shadow-[0_18px_42px_-32px_rgba(20,18,28,0.42)] backdrop-blur-md">
        atlas vivant
      </div>

      <AtlasPlate
        animal={horse}
        className="hero-float-a left-0 top-12 w-[96%] rotate-[-2deg] sm:left-1 sm:w-[82%] lg:left-0 lg:top-20 lg:w-[70%]"
        frameClassName="aspect-[3/2]"
        imageClassName="object-contain p-5 contrast-125 sm:p-8"
        markerClassName="left-[38%] top-[36%]"
        priority
      />
      <AtlasPlate
        animal={dog}
        className="hero-float-b right-0 top-[19rem] w-[58%] rotate-[3deg] sm:top-[21rem] sm:w-[44%] lg:right-0 lg:top-8 lg:w-[38%]"
        frameClassName="aspect-square"
        imageClassName="object-contain p-4 contrast-125 sm:p-5"
        markerClassName="left-[58%] top-[36%]"
      />
      <AtlasPlate
        animal={cat}
        className="hero-float-c bottom-6 left-2 w-[62%] rotate-[-4deg] sm:bottom-8 sm:w-[48%] lg:bottom-20 lg:left-auto lg:right-8 lg:w-[45%]"
        frameClassName="aspect-[3/2]"
        imageClassName="object-contain p-4 contrast-125 sm:p-5"
        markerClassName="left-[52%] top-[42%]"
      />

      <div className="absolute bottom-0 left-4 right-4 z-[2] grid gap-3 rounded-[1.35rem] border border-white/70 bg-background/80 p-4 shadow-[0_24px_80px_-62px_rgba(20,18,28,0.7)] backdrop-blur-xl sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            session.capture
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            Observations structurées, puis version propriétaire validée.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <span className="relative size-2 rounded-full bg-secondary">
            <span className="absolute inset-0 rounded-full bg-secondary/45 landing-pulse" />
          </span>
          prêt à partager
        </div>
      </div>
    </div>
  );
}

function AtlasPlate({
  animal,
  className,
  frameClassName,
  imageClassName,
  markerClassName,
  priority = false,
}: {
  animal: (typeof animalAssets)[number];
  className: string;
  frameClassName: string;
  imageClassName: string;
  markerClassName: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`group absolute z-[1] overflow-hidden rounded-[1.35rem] border border-white/80 bg-background/92 shadow-[0_28px_90px_-68px_rgba(20,18,28,0.78)] backdrop-blur transition-transform duration-300 ease-out hover:rotate-0 hover:scale-[1.015] ${className}`}
    >
      <div className={`relative ${frameClassName}`}>
        <Image
          src={animal.src}
          alt={animal.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 520px, 92vw"
          className={`${imageClassName} transition-transform duration-500 ease-out group-hover:scale-[1.025]`}
        />
        <span
          className={`hero-marker-ring absolute ${markerClassName} size-2.5 rounded-full border-2 border-background bg-secondary shadow-[0_0_0_7px_rgba(32,184,100,0.12)]`}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-linear-to-t from-background via-background/90 to-transparent p-4 pt-14">
        <div>
          <p className="text-sm font-semibold text-foreground">{animal.label}</p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {animal.note}
          </p>
        </div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {animal.number}
        </p>
      </div>
    </div>
  );
}

function GridBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="hero-color-wash absolute inset-x-[-8%] top-[8%] h-[38rem] bg-[linear-gradient(115deg,rgba(124,102,238,0.16),rgba(255,255,255,0)_38%,rgba(32,184,100,0.18)_64%,rgba(124,102,238,0.12))]" />
      <div
        className="absolute inset-0 opacity-[0.5] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--border) 72%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--border) 62%, transparent) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-background to-transparent" />
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
