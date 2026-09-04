import Image from "next/image";

import {
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
  HERO_LEAD,
  HERO_PILL_BADGE,
  HERO_PILL_TEXT,
  HERO_TITLE_LINE_1,
  HERO_TITLE_LINE_2,
  TRIAL_NOTE,
  WEB_MOCK_REPORT,
} from "./content";
import { BrowserFrame } from "../frames/browser-frame";
import { WebReportEditor } from "./web-mockups";
import { PhoneFrame } from "../frames/phone-frame";
import { AppFinalizeScreen } from "./app-mockups";
import { appFontVariables } from "./app-fonts";
import { ANATOMY_ZONES } from "./anatomy-widget";
import { webAppPath } from "../../lib/web-app-url";
import { Reveal } from "./motion";

export function LandingV5Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="lv5-grid-bg relative overflow-hidden pt-[calc(68px+clamp(44px,6vw,80px))] pb-[clamp(52px,7vw,96px)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(64% 44% at 50% 0%, rgba(107,90,200,.16), transparent 72%)",
        }}
      />

      <div className="relative mx-auto max-w-190 px-[clamp(18px,4vw,34px)] text-center">
        <a
          href="#produit"
          className="inline-flex items-center gap-2 rounded-full border border-(--lv5-line) bg-[rgba(253,253,251,.9)] py-1.25 pl-1.25 pr-3.5 text-sm text-(--lv5-ink-mid) shadow-[0_1px_2px_rgba(29,29,33,.05)]"
        >
          <span className="rounded-full bg-(--lv5-violet) px-2.5 py-0.5 text-xs font-semibold text-white">
            {HERO_PILL_BADGE}
          </span>
          {HERO_PILL_TEXT}
          <span aria-hidden="true" className="text-(--lv5-violet)">
            →
          </span>
        </a>

        <h1
          id="hero-title"
          className="mt-[clamp(20px,2.6vw,30px)] text-[clamp(2.7rem,6.6vw,5.2rem)] font-[650] leading-[.96] tracking-[-.045em] text-(--lv5-ink) text-balance"
        >
          {HERO_TITLE_LINE_1}
          <br />
          <span className="text-(--lv5-violet)">{HERO_TITLE_LINE_2}</span>
        </h1>

        <p className="mx-auto mt-[clamp(18px,2.2vw,24px)] max-w-[54ch] text-[clamp(1rem,1.3vw,1.14rem)] leading-[1.6] text-(--lv5-ink-soft)">
          {HERO_LEAD}
        </p>

        <div className="mt-[clamp(24px,3vw,34px)] flex flex-wrap items-center justify-center gap-3">
          <a
            href={webAppPath("/signup")}
            data-conversion="hero-signup"
            className="inline-flex h-13 items-center justify-center rounded-full bg-(--lv5-violet) px-7 text-base font-semibold text-white shadow-(--lv5-shadow-cta) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--lv5-violet)"
          >
            {HERO_CTA_PRIMARY}
          </a>
          <a
            href="#produit"
            className="inline-flex h-13 items-center justify-center rounded-full border border-(--lv5-line) bg-(--lv5-surface) px-6 text-base font-semibold text-(--lv5-ink) transition-colors hover:bg-(--lv5-surface-muted) focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--lv5-violet)"
          >
            {HERO_CTA_SECONDARY}
          </a>
        </div>

        <p className="mt-4 text-[.84rem] text-(--lv5-ink-tertiary)">
          {TRIAL_NOTE}
        </p>
      </div>

      <Reveal
        delay={200}
        className="relative mx-auto mt-[clamp(34px,4.5vw,58px)] max-w-280 px-[clamp(18px,4vw,34px)]"
      >
        <div
          aria-hidden="true"
          className="relative rounded-3xl"
          style={{
            padding: "8px",
            background: "rgba(253,253,251,.6)",
            border: "1px solid var(--lv5-frame-border)",
            filter: "drop-shadow(0 26px 56px rgba(29,29,33,.18))",
          }}
        >
          <HeroMockMobile />

          {/*
            Le module de rapports tel qu'il est, pas un schéma : la maquette
            reprend l'écran de `apps/web/.../reports-module`, panneau
            « Préparation guidée » ouvert. Voir web-mockups.tsx.

            Le `BrowserFrame` dessine son contenu sur un plan de 1120px puis
            le met à l'échelle du cadre. Sous 1024px ce facteur descend sous
            0.8 et la maquette passe en dessous de 10px : illisible, tassée.
            On lui substitue alors la version fluide ci-dessus, qui reprend le
            même contenu à la taille réelle du texte de la page.
          */}
          <div className="hidden lg:block">
            <BrowserFrame urlLabel={WEB_MOCK_REPORT.url}>
              <WebReportEditor />
            </BrowserFrame>
          </div>

          {/*
            La finalisation plutôt que l'espace propriétaire : c'est le titre
            du hero mis en écran — le compte rendu prêt à partir — et elle
            reste lisible à 180px, portée par trois blocs et un bouton.
            L'espace propriétaire garde sa place dans sa propre section.

            Posée en bas à droite : c'est le seul coin de la maquette web où
            elle ne recouvre rien — le schéma corporel occupe le haut du
            panneau, la barre de décision reste dégagée à gauche.
          */}
          <PhoneFrame className="absolute -bottom-10 -right-6 w-45 max-lg:hidden animate-[biume-float_6s_ease-in-out_infinite]">
            <AppFinalizeScreen />
          </PhoneFrame>
        </div>
      </Reveal>
    </section>
  );
}

/**
 * Version fluide de la maquette du hero, servie sous 1024px à la place du
 * `BrowserFrame` : sous cette largeur le facteur d'échelle du cadre passe
 * sous 0.8 et la maquette descend en dessous de 10px, illisible. Celle-ci est
 * dessinée à la largeur réelle du conteneur, à la taille de texte de la page.
 *
 * Elle reprend la disposition mobile du module (bloc `lg:hidden` de
 * `reports-editor.tsx`) : en-tête collant, sélecteur de section à la place de
 * la barre latérale, puis le contenu de l'onglet et la barre de décision.
 */
function HeroMockMobile() {
  const mock = WEB_MOCK_REPORT;

  return (
    <div
      className={`biume-app-mock biume-web-mock ${appFontVariables} overflow-hidden rounded-2xl border border-(--lv5-frame-border) text-left lg:hidden`}
      style={{ background: "var(--app-muted)" }}
    >
      <div className="flex items-center gap-1.5 border-b border-(--lv5-frame-border) bg-(--lv5-canvas) px-3.5 py-2.5">
        <span className="size-2.5 shrink-0 rounded-full bg-(--lv5-line)" />
        <span className="size-2.5 shrink-0 rounded-full bg-(--lv5-line)" />
        <span className="size-2.5 shrink-0 rounded-full bg-(--lv5-line)" />
        <span className="mx-auto truncate rounded-full bg-(--lv5-surface) px-4 py-1 text-[0.72rem] text-(--lv5-ink-tertiary)">
          {mock.url}
        </span>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
        style={{
          background: "var(--app-surface)",
          borderBottom: "1px solid var(--app-line-strong)",
        }}
      >
        <div className="min-w-0">
          <p className="m-0 text-[1rem] font-semibold" style={{ color: "var(--app-ink)" }}>
            {mock.title}
          </p>
          <p className="m-0 mt-1 text-[0.8rem]" style={{ color: "var(--app-ink-mute)" }}>
            {mock.patient.join(" · ")}
          </p>
        </div>
        <span
          className="inline-flex h-9 items-center rounded-[12px] px-4 text-[0.84rem] font-semibold text-white"
          style={{ background: "var(--app-violet)" }}
        >
          {mock.finalize}
        </span>
      </div>

      {/* Le sélecteur de section remplace la barre latérale sous 1024px. */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3"
        style={{
          background: "var(--app-surface)",
          borderBottom: "1px solid var(--app-line-strong)",
        }}
      >
        <span
          className="inline-flex h-10 flex-1 items-center justify-between gap-2 rounded-[12px] px-3 text-[0.86rem] font-medium"
          style={{ border: "1px solid var(--app-line-strong)", color: "var(--app-ink)" }}
        >
          {mock.sidebarTabs[1].label}
          <span aria-hidden="true" style={{ color: "var(--app-ink-mute)" }}>
            ▾
          </span>
        </span>
        <span
          className="inline-flex h-10 items-center gap-1.5 rounded-[12px] px-3 text-[0.84rem] font-semibold text-white"
          style={{ background: "var(--app-violet)" }}
        >
          + {mock.anatomyAdd}
        </span>
      </div>

      <div style={{ background: "rgba(248,250,252,.6)" }}>
        <div className="relative mx-auto w-full max-w-[420px] p-4 pt-16">
          <Image
            src="/assets/images/horse-anatomy-widget.jpg"
            alt=""
            width={900}
            height={600}
            className="block h-auto w-full mix-blend-multiply"
          />
          <svg
            viewBox="0 0 500 380"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-x-4 bottom-4 top-16 h-[calc(100%-5rem)] w-[calc(100%-2rem)]"
          >
            {ANATOMY_ZONES.map((zone, index) => (
              <path
                key={zone.label}
                d={zone.path}
                transform={zone.transform}
                fill={index === 0 ? "rgba(234,179,8,.5)" : "rgba(34,197,94,.5)"}
                stroke={index === 0 ? "rgba(234,179,8,1)" : "rgba(34,197,94,1)"}
                strokeWidth="5"
              />
            ))}
          </svg>

          <div
            className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-[14px] p-1"
            style={{
              border: "1px solid var(--app-line-strong)",
              background: "rgba(249,250,251,.9)",
            }}
          >
            {mock.anatomyViews.map((view, index) => (
              <span
                key={view}
                className="inline-flex h-8 items-center rounded-[10px] px-2.5 text-[0.74rem]"
                style={{
                  fontWeight: index === 0 ? 600 : 500,
                  color: index === 0 ? "var(--app-ink)" : "var(--app-ink-mute)",
                  background: index === 0 ? "var(--app-accent)" : "transparent",
                }}
              >
                {view}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3"
        style={{
          borderTop: "1px solid var(--app-line-strong)",
          background: "var(--app-canvas)",
        }}
      >
        <span
          className="inline-flex h-9 items-center rounded-[12px] px-3 text-[0.84rem] font-medium"
          style={{
            border: "1px solid var(--app-line-strong)",
            background: "var(--app-surface)",
            color: "var(--app-ink)",
          }}
        >
          {mock.decisionConfirm}
        </span>
        <span
          className="inline-flex h-9 items-center rounded-[12px] px-3 text-[0.84rem] font-medium"
          style={{ color: "var(--app-ink-soft)" }}
        >
          {mock.decisionDismiss}
        </span>
      </div>
    </div>
  );
}
