/**
 * Maquettes de l'application mobile, reprises du board de remise
 * (`handoff/Biume Mobile.html`).
 *
 * Les écrans sont dessinés dans le repère du board — 390 × 844, les mêmes
 * cotes en pixels, les mêmes couleurs — puis ramenés à l'échelle de la zone
 * d'écran du `PhoneFrame`. Garder le repère d'origine évite de retraduire
 * chaque valeur à la main : ce fichier se relit ligne à ligne contre le
 * board, et une correction du board se reporte sans arithmétique.
 *
 * D'où les cotes en `style` plutôt qu'en classes utilitaires : ce sont les
 * nombres du board, pas des choix de mise en page de la landing.
 *
 * La palette est celle de l'application (`.biume-app-mock`, cf.
 * landing-v5.css), pas celle de la page. Un écran dans un cadre d'appareil
 * se lit comme un objet à part ; lui prêter les teintes chaudes de la landing
 * en ferait un bloc de la page de plus.
 */
import type { CSSProperties, ReactNode } from "react";

import { APP_MOCK_FINALIZE, APP_MOCK_HOME, APP_MOCK_REPORT } from "./content";
import { appFontVariables } from "./app-fonts";
import { PHONE_CONTENT_WIDTH } from "../frames/phone-frame-geometry";

const BOARD_WIDTH = 390;
const BOARD_HEIGHT = 844;
const BOARD_SCALE = PHONE_CONTENT_WIDTH / BOARD_WIDTH;

const display = "biume-app-display";

/**
 * Pose le repère du board dans la zone d'écran du `PhoneFrame`.
 *
 * `overflow:hidden` sur le conteneur, pas sur l'écran : l'écran fait
 * exactement 844 px de haut dans son repère, et c'est le cadre qui décide de
 * ce qui dépasse.
 */
function AppScreen({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className="h-full w-full overflow-hidden">
      <div
        className={`biume-app-mock ${appFontVariables} relative flex flex-col`}
        style={{
          width: BOARD_WIDTH,
          height: BOARD_HEIGHT,
          transform: `scale(${BOARD_SCALE})`,
          transformOrigin: "top left",
          background: "var(--app-canvas)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Barre d'état. Le `PhoneFrame` dessine déjà l'île dynamique par-dessus le
 * centre de cette bande : l'heure et les indicateurs se rangent de part et
 * d'autre, comme sur l'appareil.
 */
function StatusBar() {
  const ink = "var(--app-ink)";

  return (
    <div
      className="flex flex-none items-center justify-between"
      style={{ height: 54, padding: "0 30px 0 34px" }}
    >
      <span className={display} style={{ fontWeight: 600, fontSize: 16, color: ink }}>
        9:41
      </span>
      <span className="flex items-center" style={{ gap: 5 }}>
        <span style={{ width: 18, height: 11, borderRadius: 2, background: ink }} />
        <span style={{ width: 16, height: 11, borderRadius: 2, background: ink }} />
        <span
          style={{ width: 26, height: 12, borderRadius: 4, border: `1.5px solid ${ink}` }}
        />
      </span>
    </div>
  );
}

function HomeIndicator() {
  return (
    <span
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 9,
        width: 140,
        height: 5,
        borderRadius: 3,
        background: "rgba(2,6,23,.25)",
      }}
    />
  );
}

/* ── Accueil ──────────────────────────────────────────────────────
   « À traiter » passe devant l'agenda, et le socle ne porte qu'un geste. */

const INBOX_TONES = {
  violet: { color: "var(--app-violet)", background: "var(--app-violet-soft)" },
  green: { color: "var(--app-green)", background: "var(--app-green-soft)" },
} satisfies Record<string, CSSProperties>;

const CARD: CSSProperties = {
  background: "var(--app-surface)",
  border: "1px solid var(--app-line)",
  borderRadius: 22,
  padding: "16px 18px",
  boxShadow: "0 6px 18px -14px rgba(2,6,23,.5)",
};

const SECTION_TITLE: CSSProperties = {
  margin: 0,
  fontWeight: 700,
  fontSize: 26,
  letterSpacing: "-.02em",
  color: "var(--app-ink)",
};

export function AppHomeScreen() {
  const mock = APP_MOCK_HOME;

  return (
    <AppScreen>
      <StatusBar />

      <div
        className="flex flex-none items-center justify-between"
        style={{ padding: "6px 22px 0" }}
      >
        <div className="flex items-center" style={{ gap: 12 }}>
          <span
            className="flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "var(--app-brand)",
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
            }}
          >
            {mock.initials}
          </span>
          <span className="flex flex-col" style={{ gap: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--app-ink-mute)" }}>
              {mock.date}
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--app-ink)" }}>
              {mock.practitioner}
            </span>
          </span>
        </div>
        <span
          className="relative flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "var(--app-surface)",
            border: "1px solid var(--app-line)",
          }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--app-ink-strong)"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span
            style={{
              position: "absolute",
              top: 9,
              right: 10,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--app-violet)",
              border: "2px solid #fff",
            }}
          />
        </span>
      </div>

      <div
        className="flex flex-1 flex-col overflow-hidden"
        style={{ padding: "26px 22px 0", gap: 14 }}
      >
        <div className="flex items-baseline justify-between">
          <h2 className={display} style={SECTION_TITLE}>
            {mock.inboxTitle}
          </h2>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--app-violet)",
              background: "var(--app-violet-soft)",
              border: "1px solid var(--app-violet-line)",
              borderRadius: 999,
              padding: "4px 11px",
            }}
          >
            {mock.inboxCount}
          </span>
        </div>

        {mock.inbox.map((item) => (
          <div key={item.subject} className="flex flex-col" style={{ ...CARD, gap: 10 }}>
            <div className="flex items-center justify-between" style={{ gap: 10 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                  borderRadius: 999,
                  padding: "5px 10px",
                  ...INBOX_TONES[item.tone],
                }}
              >
                {item.tag}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--app-ink-mute)",
                  whiteSpace: "nowrap",
                }}
              >
                {item.when}
              </span>
            </div>
            <div className="flex items-center" style={{ gap: 14 }}>
              <span className="flex flex-1 flex-col" style={{ gap: 3 }}>
                <span
                  className={display}
                  style={{ fontWeight: 600, fontSize: 20, color: "var(--app-ink)" }}
                >
                  {item.subject}
                </span>
                <span style={{ fontSize: 14, color: "var(--app-ink-soft)" }}>
                  {item.detail}
                </span>
              </span>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--app-ink-faint)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
          </div>
        ))}

        <div className="flex items-baseline justify-between" style={{ marginTop: 12 }}>
          <h2 className={display} style={SECTION_TITLE}>
            {mock.agendaTitle}
          </h2>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--app-violet)" }}>
            {mock.agendaAside}
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: 8 }}>
          {mock.agenda.map((slot) => (
            <div
              key={slot.time}
              className="flex items-center"
              style={{
                gap: 16,
                borderRadius: 20,
                padding: "14px 16px",
                background: slot.now ? "var(--app-violet-soft)" : "var(--app-surface)",
                border: `1px solid ${slot.now ? "var(--app-violet-line)" : "var(--app-line)"}`,
              }}
            >
              <span
                className={display}
                style={{
                  fontWeight: 700,
                  fontSize: 19,
                  width: 56,
                  flex: "none",
                  color: slot.now ? "var(--app-violet-ink)" : "var(--app-ink)",
                }}
              >
                {slot.time}
              </span>
              <span className="flex min-w-0 flex-1 flex-col" style={{ gap: 3 }}>
                <span className="flex items-center" style={{ gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "var(--app-ink)" }}>
                    {slot.subject}
                  </span>
                  {/* La pastille « Maintenant » se pose sur la ligne du titre,
                      pas sous l'heure — règle explicite de la remise. */}
                  {slot.now ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                        color: "#fff",
                        background: "var(--app-violet)",
                        borderRadius: 999,
                        padding: "3px 8px",
                        whiteSpace: "nowrap",
                        flex: "none",
                      }}
                    >
                      {slot.now}
                    </span>
                  ) : null}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: slot.now ? "var(--app-violet-body)" : "var(--app-ink-mute)",
                  }}
                >
                  {slot.place}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="flex flex-none flex-col"
        style={{
          padding: "14px 22px 26px",
          gap: 10,
          background:
            "linear-gradient(180deg, rgba(249,250,251,0) 0%, var(--app-canvas) 34%)",
        }}
      >
        <span
          className="flex items-center justify-center"
          style={{
            height: 60,
            borderRadius: 999,
            background: "var(--app-brand-action)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 17,
            gap: 10,
            boxShadow: "0 14px 26px -14px rgba(90,70,200,.85)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
          </svg>
          {mock.action}
        </span>
      </div>
      <HomeIndicator />
    </AppScreen>
  );
}

/* ── Finalisation et partage ──────────────────────────────────────
   Le dégradé de marque ne reparaît que là : c'est le second des deux gestes
   qui font avancer la séance. L'irréversible est annoncé avant le bouton. */

export function AppFinalizeScreen() {
  const mock = APP_MOCK_FINALIZE;

  return (
    <AppScreen>
      <StatusBar />

      <div
        className="flex flex-none items-center"
        style={{ padding: "6px 22px 18px", gap: 14 }}
      >
        <span
          className="flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "var(--app-surface)",
            border: "1px solid var(--app-line)",
          }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--app-ink-strong)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </span>
        <span
          className={display}
          style={{
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "-.01em",
            color: "var(--app-ink)",
          }}
        >
          {mock.title}
        </span>
      </div>

      <div
        className="flex flex-1 flex-col overflow-hidden"
        style={{ padding: "0 22px", gap: 14 }}
      >
        <div
          className="flex flex-col"
          style={{
            background: "linear-gradient(140deg, #F3F0FD, #EAF7F1)",
            border: "1px solid var(--app-violet-line)",
            borderRadius: 26,
            padding: 22,
            gap: 16,
          }}
        >
          <span className="flex items-center" style={{ gap: 9 }}>
            <span
              className="flex items-center justify-center"
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "var(--app-green)",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3.4"
                strokeLinecap="round"
              >
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "var(--app-green)",
              }}
            >
              {mock.checked}
            </span>
          </span>
          <span className="flex flex-col" style={{ gap: 4 }}>
            <span
              className={display}
              style={{
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: "-.02em",
                color: "var(--app-ink)",
              }}
            >
              {mock.subject}
            </span>
            <span style={{ fontSize: 15, color: "var(--app-ink-soft)" }}>
              {mock.session}
            </span>
          </span>
        </div>

        <div
          className="flex flex-col"
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-line)",
            borderRadius: 24,
            padding: 18,
            gap: 16,
          }}
        >
          <span style={OVERLINE}>{mock.recipientLabel}</span>

          <div className="flex items-center" style={{ gap: 13 }}>
            <span
              className="flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "var(--app-violet-soft)",
                color: "var(--app-violet)",
                fontWeight: 700,
                fontSize: 15,
                flex: "none",
              }}
            >
              {mock.recipientInitials}
            </span>
            <span className="flex flex-1 flex-col" style={{ gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--app-ink)" }}>
                {mock.recipientName}
              </span>
              <span style={{ fontSize: 14, color: "var(--app-ink-mute)" }}>
                {mock.recipientMail}
              </span>
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--app-violet)" }}>
              {mock.edit}
            </span>
          </div>

          <span className="block" style={{ height: 1, background: "#EEF0F4" }} />

          <div className="flex items-center" style={{ gap: 13 }}>
            <span className="flex flex-1 flex-col" style={{ gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--app-ink)" }}>
                {mock.attachTitle}
              </span>
              <span style={{ fontSize: 13, color: "var(--app-ink-mute)" }}>
                {mock.attachDetail}
              </span>
            </span>
            <span
              className="relative"
              style={{
                width: 52,
                height: 31,
                borderRadius: 999,
                background: "var(--app-violet)",
                flex: "none",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  width: 25,
                  height: 25,
                  borderRadius: 999,
                  background: "#fff",
                }}
              />
            </span>
          </div>
        </div>

        <div className="flex items-start" style={{ gap: 10, padding: "0 4px" }}>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--app-ink-faint)"
            strokeWidth="1.9"
            strokeLinecap="round"
            style={{ flex: "none", marginTop: 2 }}
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 7.6h.01" />
          </svg>
          <span
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--app-ink-mute)",
              textWrap: "pretty",
            }}
          >
            {mock.warning}
          </span>
        </div>
      </div>

      <div
        className="flex flex-none flex-col"
        style={{
          padding: "16px 22px 30px",
          gap: 10,
          background:
            "linear-gradient(180deg, rgba(249,250,251,0), var(--app-canvas) 32%)",
        }}
      >
        <span
          className="flex items-center justify-center"
          style={{
            height: 60,
            borderRadius: 999,
            background: "var(--app-brand-action)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 17,
            boxShadow: "0 14px 26px -14px rgba(90,70,200,.85)",
          }}
        >
          {mock.action}
        </span>
        <span
          className="flex items-center justify-center"
          style={{
            height: 50,
            borderRadius: 999,
            color: "var(--app-ink-soft)",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {mock.secondary}
        </span>
      </div>
      <HomeIndicator />
    </AppScreen>
  );
}

/* ── Compte rendu ─────────────────────────────────────────────────
   Une seule proposition active, citation d'origine attachée, et un bouton
   final éteint qui dit ce qui manque. */

const OVERLINE: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: ".09em",
  textTransform: "uppercase",
  color: "var(--app-ink-mute)",
};

export function AppReportScreen() {
  const mock = APP_MOCK_REPORT;

  return (
    <AppScreen>
      <StatusBar />

      <div
        className="flex flex-none flex-col"
        style={{ padding: "6px 22px 14px", gap: 12 }}
      >
        <div className="flex items-center" style={{ gap: 14 }}>
          <span
            className="flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "var(--app-surface)",
              border: "1px solid var(--app-line)",
            }}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--app-ink-strong)"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </span>
          <span className="flex flex-col" style={{ gap: 1 }}>
            <span
              className={display}
              style={{
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "-.01em",
                color: "var(--app-ink)",
              }}
            >
              {mock.title}
            </span>
            <span style={{ fontSize: 13, color: "var(--app-ink-mute)" }}>
              {mock.subtitle}
            </span>
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: 7 }}>
          <div className="flex items-baseline justify-between">
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--app-ink-soft)" }}>
              {mock.progressLabel}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--app-violet)" }}>
              {mock.progressValue}
            </span>
          </div>
          <span
            className="block overflow-hidden"
            style={{ height: 7, borderRadius: 999, background: "var(--app-track)" }}
          >
            <span
              className="block h-full"
              style={{
                width: `${mock.progressRatio}%`,
                borderRadius: 999,
                background: "linear-gradient(90deg, #7B62E0, #3FBF87)",
              }}
            />
          </span>
        </div>
      </div>

      <div
        className="flex flex-1 flex-col overflow-hidden"
        style={{ padding: "0 22px", gap: 12 }}
      >
        <div className="flex items-center justify-between">
          <span style={OVERLINE}>{mock.observationsLabel}</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--app-amber)",
              background: "var(--app-amber-soft)",
              border: "1px solid var(--app-amber-line)",
              borderRadius: 999,
              padding: "4px 10px",
            }}
          >
            {mock.observationsStatus}
          </span>
        </div>

        <div
          className="flex flex-col"
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-violet-line)",
            borderRadius: 24,
            padding: 18,
            gap: 14,
            boxShadow: "0 10px 26px -18px rgba(106,82,214,.75)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.55,
              fontWeight: 500,
              color: "var(--app-ink-body)",
              textWrap: "pretty",
            }}
          >
            {mock.proposal}
          </p>

          <div
            className="flex flex-col"
            style={{
              background: "var(--app-violet-quote)",
              borderRadius: 16,
              padding: "13px 15px",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--app-violet)",
              }}
            >
              {mock.quoteLabel}
            </span>
            <span
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                fontStyle: "italic",
                color: "var(--app-ink-soft)",
              }}
            >
              {mock.quote}
            </span>
          </div>

          <div className="flex" style={{ gap: 10 }}>
            <span
              className="flex flex-1 items-center justify-center"
              style={{
                height: 52,
                borderRadius: 16,
                background: "var(--app-green)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                gap: 8,
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
              {mock.accept}
            </span>
            <span
              className="flex flex-1 items-center justify-center"
              style={{
                height: 52,
                borderRadius: 16,
                border: "1px solid var(--app-line-strong)",
                background: "var(--app-surface)",
                color: "var(--app-ink-soft)",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {mock.dismiss}
            </span>
          </div>
        </div>

        {/* Ce qui est validé se replie en ligne calme à pastille verte. */}
        <div
          className="flex items-start"
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-line)",
            borderRadius: 24,
            padding: "16px 18px",
            gap: 12,
            opacity: 0.92,
          }}
        >
          <span
            className="flex items-center justify-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              background: "var(--app-green-soft)",
              border: "1px solid var(--app-green-line)",
              flex: "none",
              marginTop: 2,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--app-green)"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
          </span>
          <span className="flex flex-col" style={{ gap: 4 }}>
            <span
              style={{
                fontSize: 15,
                lineHeight: 1.5,
                color: "var(--app-ink-soft)",
                textWrap: "pretty",
              }}
            >
              {mock.settled}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--app-green)" }}>
              {mock.settledStatus}
            </span>
          </span>
        </div>

        <span style={{ ...OVERLINE, marginTop: 6 }}>{mock.recommendationsLabel}</span>
        <div
          className="flex flex-col"
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-line)",
            borderRadius: 24,
            padding: "16px 18px",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 16,
              lineHeight: 1.55,
              fontWeight: 500,
              color: "var(--app-ink-body)",
            }}
          >
            {mock.recommendation}
          </span>
          <span style={{ fontSize: 13, color: "var(--app-ink-faint)" }}>
            {mock.recommendationRest}
          </span>
        </div>
      </div>

      {/* Le bouton final reste éteint et dit ce qui manque. */}
      <div
        className="flex-none"
        style={{
          padding: "16px 22px 30px",
          background:
            "linear-gradient(180deg, rgba(249,250,251,0), var(--app-canvas) 32%)",
        }}
      >
        <span
          className="flex w-full items-center justify-center"
          style={{
            height: 58,
            borderRadius: 999,
            background: "var(--app-track)",
            color: "var(--app-ink-faint)",
            fontWeight: 700,
            fontSize: 17,
          }}
        >
          {mock.action}
        </span>
      </div>
      <HomeIndicator />
    </AppScreen>
  );
}
