import { Reveal } from "./motion";

/**
 * Chapitre 03 — le contrôle du praticien.
 *
 * La démonstration est construite en code plutôt qu'illustrée par une
 * capture : PRODUCT.md est explicite, sans témoignage ni chiffre
 * validé la crédibilité ne repose que sur des démonstrations fidèles.
 *
 * Rythme différent des chapitres voisins : la surface produit occupe
 * toute la largeur, et les trois garanties sont posées dessous en
 * bande réglée — pas en cartes.
 */

const POINTS = [
  {
    title: "Vous relisez chaque passage",
    body: "Rien n'est validé par défaut. Le document s'ouvre en relecture, section par section.",
  },
  {
    title: "Vous reformulez ce qui doit l'être",
    body: "La proposition reste un texte modifiable. Vous corrigez un mot ou réécrivez tout.",
  },
  {
    title: "Vous décidez de l'envoi",
    body: "Le compte rendu part quand vous le déclenchez. Jamais avant, jamais automatiquement.",
  },
] as const;

export function Control() {
  return (
    <section
      id="controle"
      aria-labelledby="lv3-controle-title"
      className="scroll-mt-24 bg-[color:var(--lv3-canvas)]"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-8 md:py-32">
        <div className="max-w-[34rem]">
          <Reveal as="h2">
            <span
              id="lv3-controle-title"
              className="lv3-chapter-title block text-[color:var(--lv3-ink)]"
            >
              Biume prépare. Vous gardez la main.
            </span>
          </Reveal>
          <Reveal as="p">
            <span className="lv3-lead mt-5 block text-[color:var(--lv3-ink-2)]">
              Un compte rendu engage votre nom auprès du propriétaire. Il ne
              peut pas partir sans que vous l&apos;ayez lu.
            </span>
          </Reveal>
        </div>

        <Reveal>
          <ReviewSurface />
        </Reveal>

        <Reveal>
          <dl className="mt-12 grid divide-y divide-[color:var(--lv3-line)] border-t border-[color:var(--lv3-line)] md:grid-cols-3 md:divide-x md:divide-y-0">
            {POINTS.map((point) => (
              <div key={point.title} className="py-6 md:px-7 md:first:pl-0 md:last:pr-0">
                <dt className="text-[1rem] font-semibold text-[color:var(--lv3-ink)]">
                  {point.title}
                </dt>
                <dd className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--lv3-ink-2)]">
                  {point.body}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function ReviewSurface() {
  return (
    <figure className="m-0 mt-12">
      <div className="lv3-surface overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-[color:var(--lv3-line)] px-5 py-4 md:px-7">
          <div>
            <p className="text-[1rem] font-semibold text-[color:var(--lv3-ink)]">
              Compte rendu — relecture
            </p>
            <p className="mt-0.5 text-[0.82rem] text-[color:var(--lv3-ink-2)]">
              3 sections · 1 en cours de modification
            </p>
          </div>
          <p className="lv3-fn shrink-0 rounded-full bg-[color:var(--lv3-muted)] px-2.5 py-1.5 text-[color:var(--lv3-ink-2)]">
            BROUILLON
          </p>
        </div>

        <div className="divide-y divide-[color:var(--lv3-line)] md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
          <Row label="Zone observée" value="Thorax gauche" state="validated" />

          {/* Passage en cours : le violet saturé marque la sélection
              active, c'est-à-dire l'endroit où le praticien décide. */}
          <div className="px-5 py-5 md:px-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-[color:var(--lv3-ink-2)]">
                Évolution
              </p>
              <p className="text-[0.75rem] font-medium text-[color:var(--lv3-violet)]">
                En cours
              </p>
            </div>
            <p className="mt-2.5 text-[0.98rem] leading-[1.55] text-[color:var(--lv3-ink)]">
              <span className="rounded-[4px] bg-[color:var(--lv3-violet-soft)] px-1 py-0.5 ring-1 ring-[color:var(--lv3-violet)]">
                Mobilité améliorée après le travail manuel
              </span>
            </p>
            <div
              aria-hidden="true"
              className="mt-3 inline-flex items-center gap-1 rounded-full border border-[color:var(--lv3-line)] bg-[color:var(--lv3-surface)] p-1"
            >
              {["Reformuler", "Valider"].map((action) => (
                <span
                  key={action}
                  className={`rounded-full px-3 py-1.5 text-[0.78rem] font-medium ${
                    action === "Valider"
                      ? "bg-[color:var(--lv3-violet)] text-white"
                      : "text-[color:var(--lv3-ink-2)]"
                  }`}
                >
                  {action}
                </span>
              ))}
            </div>
          </div>

          <Row
            label="Conseil"
            value="Prévoir une activité calme pendant 48 heures"
            state="pending"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--lv3-line)] bg-[color:var(--lv3-muted)] px-5 py-4 md:px-7">
          <p className="text-[0.85rem] text-[color:var(--lv3-ink-2)]">
            L&apos;envoi reste inactif tant que tout n&apos;est pas validé.
          </p>
          <span
            aria-hidden="true"
            className="rounded-full bg-[color:var(--lv3-line)] px-4 py-2 text-[0.85rem] font-medium text-[color:var(--lv3-ink-2)]"
          >
            Envoyer au propriétaire
          </span>
        </div>
      </div>

      <figcaption className="mt-4 text-[0.82rem] text-[color:var(--lv3-ink-2)]">
        Reconstitution de l&apos;écran de relecture, à partir de la même séance
        d&apos;exemple.
      </figcaption>
    </figure>
  );
}

function Row({
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
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.09em] text-[color:var(--lv3-ink-2)]">
          {label}
        </p>
        {state === "validated" ? (
          <span className="lv3-validated">
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
          <span className="text-[0.75rem] font-medium text-[color:var(--lv3-ink-2)]">
            À relire
          </span>
        )}
      </div>
      <p className="mt-2.5 text-[0.98rem] leading-[1.55] text-[color:var(--lv3-ink)]">
        {value}
      </p>
    </div>
  );
}
