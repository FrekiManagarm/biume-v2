import {
  BENTO_EYEBROW,
  BENTO_FOLLOW_UP,
  BENTO_LEAD,
  BENTO_NOTES_TO_DOC,
  BENTO_OWNER,
  BENTO_TITLE,
  BENTO_VALIDATION,
} from "./content";
import { Reveal } from "./motion";

/**
 * Les bandeaux de validation portent leur couleur par leur fond : le statut se
 * lit à distance, sans avoir à décoder une puce. Vert pour ce qui est confirmé,
 * violet pour ce qui attend encore une décision du praticien.
 */
const VALIDATION_TONE: Record<string, string> = {
  green: "bg-[color:var(--lv5-green-soft)] text-[color:var(--lv5-green-ink)]",
  violet:
    "bg-[color:var(--lv5-violet-soft)] text-[color:var(--lv5-violet-ink)]",
};

/*
  Tuile large : deux colonnes qui se replient d'elles-mêmes sous 480px.

  Le `span 2` est conditionné à ~660px, largeur à partir de laquelle l'`auto-fit`
  ci-dessous donne réellement deux colonnes. Sans cette garde, la grille
  mono-colonne du mobile se voyait forcer une seconde colonne *implicite*
  (dimensionnée `auto`) : les tuiles étroites s'y retrouvaient tassées sur
  quelques dizaines de pixels, et la page débordait de ~50px vers la droite —
  ce qui étirait aussi l'en-tête fixe et poussait le bouton menu hors écran.
*/
const WIDE_TILE =
  "min-[660px]:[grid-column:span_2] min-w-0 flex flex-wrap items-center gap-6 rounded-[22px] p-[clamp(22px,2.6vw,32px)]";

const NARROW_TILE =
  "min-w-0 rounded-[22px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(22px,2.6vw,30px)]";

const WIDE_TITLE =
  "m-0 mb-2.5 text-[1.36rem] font-semibold tracking-[-.02em]";

const NARROW_TITLE =
  "m-0 mb-2.5 text-[1.2rem] font-semibold tracking-[-.015em] text-[color:var(--lv5-ink)]";

export function LandingV5Bento() {
  return (
    <section
      id="solution"
      aria-labelledby="bento-title"
      className="py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[1180px]">
        <p className="m-0 flex justify-center">
          <span className="inline-flex items-center rounded-full border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] px-3.5 py-[5px] text-[0.76rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-violet)]">
            {BENTO_EYEBROW}
          </span>
        </p>

        <h2
          id="bento-title"
          className="mx-auto mt-[18px] max-w-[24ch] text-center text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-.04em] text-[color:var(--lv5-ink)]"
        >
          {BENTO_TITLE}
        </h2>

        <p className="mx-auto mt-[18px] max-w-[52ch] text-center text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
          {BENTO_LEAD}
        </p>

        {/*
          `auto-fit` avec un minimum de 280px : à 1180px la grille tombe d'elle
          même sur trois colonnes, ce qui donne large+étroit puis étroit+large
          sans que la mise en page ait à connaître le nombre de colonnes.
        */}
        <div className="mt-[clamp(32px,4vw,52px)] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[clamp(16px,2.2vw,24px)] text-left">
          <Reveal
            delay={0}
            className={`${WIDE_TILE} border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)]`}
          >
            <div className="min-w-[220px] flex-[1_1_240px]">
              <h3 className={`${WIDE_TITLE} text-[color:var(--lv5-ink)]`}>
                {BENTO_NOTES_TO_DOC.title}
              </h3>
              <p className="m-0 text-[1rem] leading-[1.6] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
                {BENTO_NOTES_TO_DOC.body}
              </p>
            </div>

            <div className="flex min-w-[220px] flex-[1_1_240px] flex-col gap-2.5">
              <p className="m-0 rounded-[12px] bg-[color:var(--lv5-anthracite)] p-3.5 font-[family-name:var(--lv5-font-mono)] text-[0.8rem] leading-[1.7] text-[rgba(253,253,251,.84)]">
                {BENTO_NOTES_TO_DOC.raw}
              </p>
              <span
                aria-hidden="true"
                className="self-center text-[1.1rem] leading-none text-[color:var(--lv5-violet)]"
              >
                ↓
              </span>
              <p className="m-0 rounded-[12px] border border-[color:var(--lv5-line)] p-3.5 text-[0.92rem] leading-[1.55] text-[color:var(--lv5-ink)]">
                {BENTO_NOTES_TO_DOC.out}
              </p>
            </div>
          </Reveal>

          <Reveal delay={90} className={NARROW_TILE}>
            <h3 className={NARROW_TITLE}>{BENTO_VALIDATION.title}</h3>
            <p className="m-0 mb-4 text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
              {BENTO_VALIDATION.body}
            </p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {BENTO_VALIDATION.rows.map((row) => (
                <li
                  key={row.label}
                  className={`flex items-center justify-between rounded-[10px] px-[13px] py-[11px] text-[0.86rem] font-semibold ${
                    VALIDATION_TONE[row.tone] ?? VALIDATION_TONE.green
                  }`}
                >
                  {row.label}
                  <span className="font-medium">{row.status}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={150} className={NARROW_TILE}>
            <h3 className={NARROW_TITLE}>{BENTO_OWNER.title}</h3>
            <p className="m-0 mb-4 text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
              {BENTO_OWNER.body}
            </p>
            <div className="rounded-[12px] bg-[color:var(--lv5-blue-soft)] p-3.5">
              <p className="m-0 text-[0.74rem] font-semibold text-[color:var(--lv5-blue-ink)]">
                {BENTO_OWNER.cardLabel}
              </p>
              <p className="mt-1.5 m-0 text-[0.9rem] leading-[1.45] text-[color:var(--lv5-ink)]">
                {BENTO_OWNER.cardMessage}
              </p>
            </div>
          </Reveal>

          <Reveal
            delay={210}
            className={`${WIDE_TILE} bg-[color:var(--lv5-anthracite)] text-[color:var(--lv5-surface)]`}
          >
            <div className="min-w-[220px] flex-[1_1_240px]">
              <h3 className={WIDE_TITLE}>{BENTO_FOLLOW_UP.title}</h3>
              <p className="m-0 text-[1rem] leading-[1.6] text-[rgba(253,253,251,.68)] [text-wrap:pretty]">
                {BENTO_FOLLOW_UP.body}
              </p>
            </div>

            <ul className="m-0 flex min-w-[200px] flex-[1_1_220px] list-none flex-col gap-[9px] p-0">
              {BENTO_FOLLOW_UP.rows.map((row) => (
                <li
                  key={row.when}
                  className="flex items-center gap-3 rounded-[12px] bg-[rgba(253,253,251,.07)] px-3.5 py-3"
                >
                  <span className="font-[family-name:var(--lv5-font-mono)] text-[0.8rem] text-[color:var(--lv5-violet-light)]">
                    {row.when}
                  </span>
                  <span className="text-[0.9rem]">{row.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
