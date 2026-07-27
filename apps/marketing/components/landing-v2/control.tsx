import { Reveal } from "./motion";

/**
 * Séquence sombre — l'unique rupture de fond de la page. Elle isole la
 * promesse la plus sensible : Biume prépare, le praticien décide.
 *
 * La démonstration est construite en code plutôt qu'illustrée par une
 * capture. PRODUCT.md est explicite : sans témoignage ni chiffre validé,
 * la crédibilité ne repose que sur des démonstrations fidèles.
 */

const CONTROL_POINTS = [
  {
    title: "Vous relisez chaque passage",
    body: "Rien n'est validé par défaut. Le document s'ouvre en relecture, section par section.",
  },
  {
    title: "Vous reformulez ce qui doit l'être",
    body: "La proposition reste un texte modifiable. Vous corrigez un mot ou réécrivez tout, sans repartir de zéro.",
  },
  {
    title: "Vous décidez de l'envoi",
    body: "Le compte rendu part au propriétaire quand vous le déclenchez. Jamais avant, jamais automatiquement.",
  },
] as const;

export function Control() {
  return (
    <section
      id="controle"
      aria-labelledby="lv2-controle-title"
      className="scroll-mt-20 bg-[color:var(--lv2-anthracite)] text-[color:var(--lv2-on-dark)]"
    >
      <div className="mx-auto max-w-[1240px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
          <div>
            <Reveal as="h2">
              <span
                id="lv2-controle-title"
                className="lv2-headline block max-w-[16ch] text-[color:var(--lv2-on-dark)]"
              >
                Biume prépare. Vous gardez la main.
              </span>
            </Reveal>

            <Reveal as="p">
              <span className="lv2-body mt-5 block text-[color:var(--lv2-on-dark-2)]">
                Un compte rendu engage votre nom auprès du propriétaire. Il ne
                peut pas partir sans que vous l&apos;ayez lu.
              </span>
            </Reveal>

            <Reveal>
              <dl className="mt-10 divide-y divide-[color:var(--lv2-line-dark)] border-y border-[color:var(--lv2-line-dark)]">
                {CONTROL_POINTS.map((point) => (
                  <div key={point.title} className="py-5">
                    <dt className="text-[1rem] font-semibold text-[color:var(--lv2-on-dark)]">
                      {point.title}
                    </dt>
                    <dd className="mt-1.5 max-w-[52ch] text-[0.95rem] leading-[1.6] text-[color:var(--lv2-on-dark-2)]">
                      {point.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal>
            <ReviewSurface />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Document en relecture, posé sur la scène sombre. L'ombre est justifiée :
 * l'objet flotte réellement au-dessus du fond.
 */
function ReviewSurface() {
  return (
    <figure className="m-0">
      <div className="lv2-raised overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-[color:var(--lv2-line)] px-5 py-4 md:px-6">
          <div>
            <p className="lv2-title text-[color:var(--lv2-ink)]">
              Compte rendu — relecture
            </p>
            <p className="mt-0.5 text-[0.82rem] text-[color:var(--lv2-ink-2)]">
              3 sections · 1 en cours de modification
            </p>
          </div>
          <p className="lv2-fn shrink-0 rounded-full bg-[color:var(--lv2-muted)] px-2.5 py-1 text-[color:var(--lv2-ink-2)]">
            BROUILLON
          </p>
        </div>

        <div className="divide-y divide-[color:var(--lv2-line)]">
          <ReviewRow
            label="Zone observée"
            value="Thorax gauche"
            state="validated"
          />

          {/* Passage en cours de reformulation : le violet marque la
              sélection active, c'est-à-dire l'endroit où le praticien décide. */}
          <div className="relative px-5 py-5 md:px-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--lv2-ink-2)]">
                Évolution
              </p>
              <p className="text-[0.78rem] font-medium text-[color:var(--lv2-violet)]">
                Modification en cours
              </p>
            </div>
            <p className="mt-2 text-[1rem] leading-[1.6] text-[color:var(--lv2-ink)]">
              <span className="rounded-[4px] bg-[color:var(--lv2-violet-soft)] px-1 py-0.5 ring-1 ring-[color:var(--lv2-violet)]">
                Mobilité améliorée après le travail manuel
              </span>
            </p>

            <div
              aria-hidden="true"
              className="mt-3 inline-flex items-center gap-1 rounded-full border border-[color:var(--lv2-line)] bg-[color:var(--lv2-surface)] p-1"
            >
              {["Reformuler", "Modifier", "Valider"].map((action) => (
                <span
                  key={action}
                  className={`rounded-full px-3 py-1.5 text-[0.8rem] font-medium ${
                    action === "Valider"
                      ? "bg-[color:var(--lv2-violet)] text-white"
                      : "text-[color:var(--lv2-ink-2)]"
                  }`}
                >
                  {action}
                </span>
              ))}
            </div>
          </div>

          <ReviewRow
            label="Conseil"
            value="Prévoir une activité calme pendant 48 heures"
            state="pending"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--lv2-line)] bg-[color:var(--lv2-muted)] px-5 py-4 md:px-6">
          <p className="text-[0.85rem] text-[color:var(--lv2-ink-2)]">
            L&apos;envoi reste inactif tant que tout n&apos;est pas validé.
          </p>
          <span
            aria-hidden="true"
            className="rounded-full bg-[color:var(--lv2-line)] px-4 py-2 text-[0.85rem] font-medium text-[color:var(--lv2-ink-2)]"
          >
            Envoyer au propriétaire
          </span>
        </div>
      </div>

      <figcaption className="mt-4 text-[0.82rem] text-[color:var(--lv2-on-dark-2)]">
        Reconstitution de l&apos;écran de relecture, à partir de la même séance
        d&apos;exemple.
      </figcaption>
    </figure>
  );
}

function ReviewRow({
  label,
  value,
  state,
}: {
  label: string;
  value: string;
  state: "validated" | "pending";
}) {
  return (
    <div className="px-5 py-5 md:px-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--lv2-ink-2)]">
          {label}
        </p>
        {state === "validated" ? (
          <span className="lv2-validated">
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 8.5 3.2 3.2L13 5" />
            </svg>
            Validé
          </span>
        ) : (
          <span className="text-[0.78rem] font-medium text-[color:var(--lv2-ink-2)]">
            À relire
          </span>
        )}
      </div>
      <p className="mt-2 text-[1rem] leading-[1.6] text-[color:var(--lv2-ink)]">
        {value}
      </p>
    </div>
  );
}
