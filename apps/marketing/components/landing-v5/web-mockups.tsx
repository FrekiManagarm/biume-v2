/**
 * Maquette du module de rapports de l'application praticien.
 *
 * Elle reproduit l'écran réel — `apps/web/src/components/dashboard/pages/
 * reports-module/reports-editor.tsx` et ses composants — plutôt qu'un schéma
 * inventé pour la landing : barre latérale violette repliable, en-tête à trois
 * boutons, onglet actif, barre de décision de section, et le panneau
 * « Préparation guidée » ouvert par-dessus.
 *
 * Elle est dessinée dans le repère de l'application (1440 × 840) puis ramenée
 * à l'échelle du plan du `BrowserFrame`. Comme pour les écrans mobiles, garder
 * le repère d'origine permet de reprendre les cotes du produit telles quelles
 * — `p-4`, `gap-5`, `w-72`, la feuille à 32rem — et de relire ce fichier
 * contre l'application au lieu de le comparer à une conversion.
 *
 * Palette : `.biume-app-mock` (identique à `product.css`), police Hanken
 * Grotesk via `.biume-web-mock`.
 */
import type { CSSProperties, ReactNode } from "react";

import Image from "next/image";

import { WEB_MOCK_REPORT } from "./content";
import { ANATOMY_ZONES } from "./anatomy-widget";
import { appFontVariables } from "./app-fonts";

const APP_WIDTH = 1440;
const APP_HEIGHT = 840;

/** Largeur du plan de contenu du `BrowserFrame`. */
const BROWSER_CONTENT_WIDTH = 1120;
const APP_SCALE = BROWSER_CONTENT_WIDTH / APP_WIDTH;

/* `--radius` de `product.css` : 0.875rem. shadcn en dérive `rounded-md`. */
const RADIUS = 14;

/** `ownerStatusPresentation` : le vert quand c'est prêt, l'ambre sinon. */
const OWNER_STATUS = {
  Prêt: { color: "#064E3B", background: "#D1FAE5", ring: "#6EE7B799" },
  "À préparer": { color: "#78350F", background: "#FEF3C7", ring: "#FCD34D99" },
} as const;

/**
 * Pose le repère de l'application dans le plan du cadre navigateur.
 *
 * `position: relative` sur la racine : la feuille latérale est posée en
 * absolu par-dessus, comme le `Sheet` de l'application.
 */
function WebScreen({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className="h-full w-full overflow-hidden">
      <div
        className={`biume-app-mock biume-web-mock ${appFontVariables} relative`}
        style={{
          width: APP_WIDTH,
          height: APP_HEIGHT,
          transform: `scale(${APP_SCALE})`,
          transformOrigin: "top left",
          background: "var(--app-muted)",
          color: "var(--app-ink)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Barre latérale ────────────────────────────────────────────────
   Seule surface pleine violette de l'application : elle porte la
   progression et l'état de chaque section. */

const SIDEBAR_CONTROL: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "rgba(255,255,255,.10)",
  flex: "none",
};

/**
 * `professionalStateClassName` : l'état confirmé passe au vert, les autres
 * restent en blanc atténué — et en violet sur l'onglet actif, dont la surface
 * est blanche.
 */
function sectionStateColor(state: string, active: boolean) {
  if (state === "Confirmé") return active ? "#047857" : "#A7F3D0";
  return active ? "rgba(106,82,214,.75)" : "rgba(255,255,255,.80)";
}

function Sidebar() {
  const mock = WEB_MOCK_REPORT;

  return (
    <aside
      className="flex min-h-0 flex-col overflow-hidden"
      style={{
        width: 288,
        borderRadius: 24,
        background: "var(--app-violet)",
        color: "#fff",
        padding: 16,
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          gap: 8,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,.15)",
        }}
      >
        <span className="flex items-center justify-center" style={SIDEBAR_CONTROL}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block" style={{ fontSize: 14, fontWeight: 600 }}>
            {mock.sidebarTitle}
          </span>
          <span
            className="mt-0.5 block"
            style={{ fontSize: 12, color: "rgba(255,255,255,.70)" }}
          >
            {mock.sidebarProgress}
          </span>
        </span>

        <span className="flex" style={{ gap: 4 }}>
          <span className="flex items-center justify-center" style={SIDEBAR_CONTROL}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
            </svg>
          </span>
          <span className="flex items-center justify-center" style={SIDEBAR_CONTROL}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16M16 9l-3 3 3 3" />
            </svg>
          </span>
        </span>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col"
        style={{ gap: 8, padding: "16px 0" }}
      >
        {mock.sidebarTabs.map((tab) => {
          const status = tab.owner ? OWNER_STATUS[tab.owner] : null;

          return (
            <span
              key={tab.label}
              className="flex w-full items-center"
              style={{
                gap: 12,
                padding: "10px 12px",
                borderRadius: 12,
                background: tab.active ? "#fff" : "transparent",
                color: tab.active ? "var(--app-violet)" : "#fff",
                boxShadow: tab.active ? "0 0 0 2px rgba(255,255,255,.30)" : undefined,
              }}
            >
              <span
                className="flex items-center justify-center"
                style={{ width: 16, height: 16, flex: "none" }}
              >
                <TabIcon label={tab.label} />
              </span>

              <span className="min-w-0 flex-1">
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {tab.label}
                  <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.75 }}>
                    {tab.count}
                  </span>
                </span>
                <span
                  className="mt-0.5 block"
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: sectionStateColor(tab.state, tab.active),
                  }}
                >
                  {tab.state}
                </span>
              </span>

              {status ? (
                <span
                  style={{
                    borderRadius: 999,
                    padding: "4px 8px",
                    fontSize: 10,
                    fontWeight: 600,
                    flex: "none",
                    color: status.color,
                    background: status.background,
                    boxShadow: `inset 0 0 0 1px ${status.ring}`,
                  }}
                >
                  {tab.owner}
                </span>
              ) : null}
            </span>
          );
        })}
      </nav>

      <span
        className="flex w-full items-center justify-center"
        style={{
          gap: 8,
          padding: "12px 0",
          borderRadius: RADIUS - 2,
          background: "#fff",
          color: "var(--app-violet)",
          fontSize: 14,
          fontWeight: 600,
          border: "1px solid rgba(255,255,255,.20)",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
          <path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
        </svg>
        {mock.sidebarPrepare}
      </span>
    </aside>
  );
}

/** Icônes de `tabIcons` : presse-papiers, activité, coche, document. */
function TabIcon({ label }: { label: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (label === "Anatomie") {
    return (
      <svg {...common}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    );
  }
  if (label === "Recommandations") {
    return (
      <svg {...common}>
        <path d="M4 12.5l5 5L20 6.5" />
      </svg>
    );
  }
  if (label === "Notes additionnelles") {
    return (
      <svg {...common}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

/* ── Boutons de l'en-tête ─────────────────────────────────────────
   Tailles shadcn : `default` en h-9 px-4, `sm` en h-8 px-3. */

function Button({
  children,
  variant = "outline",
  size = "default",
}: {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
}) {
  const base: CSSProperties = {
    height: size === "sm" ? 32 : 36,
    padding: size === "sm" ? "0 12px" : "0 16px",
    borderRadius: RADIUS - 2,
    fontSize: 14,
    fontWeight: 500,
    gap: 8,
  };

  const tone: CSSProperties =
    variant === "default"
      ? { background: "var(--app-violet)", color: "#fff" }
      : variant === "outline"
        ? {
            background: "var(--app-surface)",
            color: "var(--app-ink)",
            border: "1px solid var(--app-line-strong)",
          }
        : { background: "transparent", color: "var(--app-ink-soft)" };

  return (
    <span className="inline-flex items-center justify-center" style={{ ...base, ...tone }}>
      {children}
    </span>
  );
}

/* ── Contenu principal ────────────────────────────────────────────
   En-tête, onglet Observations, puis la barre de décision de section
   qui reste collée en bas — c'est elle qui débloque « Finaliser ». */

function Main() {
  const mock = WEB_MOCK_REPORT;

  return (
    <main
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        borderRadius: 24,
        border: "1px solid var(--app-line-strong)",
        background: "var(--app-canvas)",
        boxShadow: "0 1px 2px rgba(2,6,23,.05)",
      }}
    >
      <header
        className="flex flex-none items-center justify-between"
        style={{
          gap: 16,
          padding: "16px 20px",
          borderBottom: "1px solid var(--app-line-strong)",
          background: "var(--app-canvas)",
        }}
      >
        <div className="min-w-0">
          <p
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: "var(--app-ink)",
            }}
          >
            {mock.title}
          </p>
          <div
            className="mt-2 flex flex-wrap items-center"
            style={{ gap: "4px 16px", fontSize: 14, color: "var(--app-ink-mute)" }}
          >
            <span className="flex items-center" style={{ gap: 6, fontWeight: 500 }}>
              {mock.patient.map((part, index) => (
                <span key={part} className="flex items-center" style={{ gap: 6 }}>
                  {index > 0 ? <span>·</span> : null}
                  {part}
                </span>
              ))}
            </span>
            <span className="flex items-center" style={{ gap: 6 }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <rect x="3" y="4.5" width="18" height="16" rx="2" />
                <path d="M8 2.5v4M16 2.5v4M3 9.5h18M12 13v3l2 1" />
              </svg>
              {mock.appointment}
            </span>
          </div>
        </div>

        <div className="flex flex-none items-center" style={{ gap: 8 }}>
          <Button>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
              <circle cx="12" cy="12" r="2.6" />
            </svg>
            {mock.preview}
          </Button>
          <Button>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h11l5 5v11H4z" />
              <path d="M8 4v5h7M8 20v-6h8v6" />
            </svg>
            {mock.save}
          </Button>
          <Button variant="default">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
            {mock.finalize}
          </Button>
        </div>
      </header>

      <section
        className="flex min-h-0 flex-1 flex-col"
        style={{ background: "rgba(248,250,252,.6)" }}
      >
        <AnatomyCanvas />

        <div
          className="flex flex-none items-center"
          style={{
            gap: 8,
            padding: "12px 20px",
            borderTop: "1px solid var(--app-line-strong)",
            background: "var(--app-canvas)",
          }}
        >
          <Button size="sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
            {mock.decisionConfirm}
          </Button>
          <Button size="sm" variant="ghost">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M5.6 5.6l12.8 12.8" />
            </svg>
            {mock.decisionDismiss}
          </Button>
        </div>
      </section>
    </main>
  );
}

/* ── Onglet Anatomie ──────────────────────────────────────────────
   Le schéma occupe toute la surface, les outils flottent par-dessus : les
   vues en haut à droite, l'aide, la liste et l'ajout en haut à gauche. */

/** `getSeverityFillColor` : le remplissage d'une zone suit sa gravité. */
const ZONE_FILL = ["rgba(234,179,8,.5)", "rgba(34,197,94,.5)"] as const;
const ZONE_STROKE = ["rgba(234,179,8,1)", "rgba(34,197,94,1)"] as const;

/** Coque des deux barres flottantes : bordure, fond translucide, p-1. */
const FLOATING_BAR: CSSProperties = {
  position: "absolute",
  top: 16,
  zIndex: 30,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  borderRadius: 16,
  border: "1px solid var(--app-line-strong)",
  background: "rgba(249,250,251,.9)",
  padding: 4,
  boxShadow: "0 1px 2px rgba(2,6,23,.05)",
};

const TOOL_BUTTON: CSSProperties = {
  height: 36,
  borderRadius: 12,
  padding: "0 12px",
  fontSize: 12,
  fontWeight: 500,
  gap: 6,
  color: "var(--app-ink-mute)",
};

function AnatomyCanvas() {
  const mock = WEB_MOCK_REPORT;

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
      {/* Le schéma et ses zones : l'image et les tracés du module
          (`data/horse/dataHorse.ts`), repris par `anatomy-widget.tsx`. */}
      {/* `mix-blend-multiply` : le fond blanc du dessin se fond dans la
          surface du panneau, comme dans le module où le schéma n'est pas
          posé sur une carte. */}
      <div className="relative" style={{ width: 780 }}>
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
          className="absolute inset-0 h-full w-full"
        >
          {ANATOMY_ZONES.map((zone, index) => (
            <path
              key={zone.label}
              d={zone.path}
              transform={zone.transform}
              fill={ZONE_FILL[index]}
              stroke={ZONE_STROKE[index]}
              strokeWidth="5"
            />
          ))}
        </svg>
      </div>

      <div style={{ ...FLOATING_BAR, left: 16 }}>
        <span
          className="inline-flex items-center justify-center"
          style={{ ...TOOL_BUTTON, padding: "0 12px" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.8-.9 1.5M12 17h.01" />
          </svg>
          {mock.anatomyHelp}
        </span>

        <span className="inline-flex items-center justify-center" style={TOOL_BUTTON}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          >
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          {mock.anatomyElements}
          <span
            style={{
              borderRadius: 999,
              padding: "2px 6px",
              fontSize: 10,
              fontWeight: 600,
              color: "var(--app-violet)",
              background: "rgba(106,82,214,.10)",
            }}
          >
            {mock.anatomyElementsCount}
          </span>
        </span>

        <span
          className="inline-flex items-center justify-center"
          style={{
            ...TOOL_BUTTON,
            fontWeight: 600,
            color: "#fff",
            background: "var(--app-violet)",
            boxShadow: "0 1px 2px rgba(2,6,23,.05)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          {mock.anatomyAdd}
          <span
            style={{
              borderRadius: 6,
              padding: "2px 6px",
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,.8)",
              background: "rgba(255,255,255,.15)",
            }}
          >
            {mock.anatomyAddKey}
          </span>
        </span>
      </div>

      <div style={{ ...FLOATING_BAR, right: 16 }}>
        {mock.anatomyViews.map((view, index) => (
          <span
            key={view}
            className="inline-flex items-center justify-center"
            style={{
              ...TOOL_BUTTON,
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
  );
}

/** Le module de rapports, tel qu'il s'ouvre sur une séance à préparer. */
export function WebReportEditor() {
  return (
    <WebScreen>
      <div className="flex h-full" style={{ gap: 20, padding: 16 }}>
        <Sidebar />
        <Main />
      </div>
    </WebScreen>
  );
}
