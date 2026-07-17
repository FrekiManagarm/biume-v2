"use client";

import { useState, type JSX } from "react";

const passages = [
  {
    id: "mobility",
    source:
      "Restriction thoracique gauche. Mobilité améliorée après travail.",
    owner:
      "La mobilité du thorax s’est améliorée pendant le travail manuel.",
    alternate:
      "La mobilité du thorax s’est améliorée après le travail manuel.",
  },
  {
    id: "advice",
    source: "Conseiller du calme pendant 48 h.",
    owner: "Prévoyez une activité calme pendant les prochaines 48 heures.",
    alternate: "Maintenez un rythme calme durant les 48 prochaines heures.",
  },
] as const;

type Passage = (typeof passages)[number];

function PassageControl({ passage }: { passage: Passage }): JSX.Element {
  const [usesAlternate, setUsesAlternate] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const ownerText = usesAlternate ? passage.alternate : passage.owner;

  function reformulate() {
    setUsesAlternate((current) => !current);
    setConfirmed(false);
  }

  return (
    <article
      data-control-passage={passage.id}
      data-control-status={confirmed ? "confirmed" : "ready"}
      className="px-5 py-6 sm:px-7 sm:py-7"
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-7">
        <div>
          <p className="text-xs font-semibold text-[color:var(--atelier-muted)]">
            Texte professionnel
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--atelier-muted)]">
            {passage.source}
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-[color:var(--atelier-ink)]">
              Version propriétaire
            </p>
            <span
              aria-live="polite"
              className="rounded-full bg-[color:var(--atelier-violet-soft)] px-2.5 py-1 text-xs font-semibold text-[color:var(--atelier-violet)]"
            >
              {confirmed ? "Passage validé" : "Prêt à valider"}
            </span>
          </div>
          <p aria-live="polite" className="mt-3 text-sm leading-6">
            {ownerText}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={reformulate}
          className="atelier-action inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--atelier-line)] bg-[color:var(--atelier-surface)] px-4 text-sm font-semibold text-[color:var(--atelier-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]"
        >
          Reformuler
        </button>
        <button
          type="button"
          disabled={confirmed}
          onClick={() => setConfirmed(true)}
          className="atelier-action inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--atelier-violet)] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)] disabled:cursor-default disabled:opacity-75"
        >
          {confirmed ? "Passage validé" : "Valider ce passage"}
        </button>
      </div>
    </article>
  );
}

export function PractitionerControlDemo(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-[var(--atelier-surface-radius)] bg-[color:var(--atelier-surface)] text-[color:var(--atelier-ink)] shadow-[0_6px_8px_rgba(29,29,33,0.14)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--atelier-line)] px-5 py-4 sm:px-7">
        <p className="font-semibold">Compte rendu à relire</p>
        <span className="text-xs font-medium text-[color:var(--atelier-muted)]">
          2 passages
        </span>
      </div>

      <div className="divide-y divide-[color:var(--atelier-line)]">
        {passages.map((passage) => (
          <PassageControl key={passage.id} passage={passage} />
        ))}
      </div>
    </div>
  );
}
