import {
  anchorMatchesTranscript,
  type Proposal,
} from "@biume/contracts/proposal";
import {
  createInitialReportSectionStates,
  reportSectionIds,
  type ReportSectionStates,
} from "@biume/contracts/report";

import type { ExtractionCandidate } from "./extraction.schema";

export function buildExtractionPrompt(transcript: string): string {
  return [
    "Tu structures la dictée d'un ostéopathe animalier en propositions de compte rendu.",
    "",
    "Règles absolues :",
    "- Tu n'inventes rien. Une information absente de la dictée ne produit aucune proposition.",
    "- Tu ne poses aucun diagnostic et ne transformes jamais une hypothèse en certitude.",
    "- Tu reformules sans ajouter : le vocabulaire reste celui de l'observation.",
    "- Chaque proposition cite mot pour mot le passage de la dictée dont elle est issue.",
    "- Si la dictée ne dit rien d'une section, tu ne produis aucune proposition pour elle.",
    "",
    "Dictée :",
    transcript,
  ].join("\n");
}

/**
 * Seconde ligne de défense, après l'instruction d'amorçage. Une proposition
 * dont la citation ne se retrouve pas dans la transcription est une invention,
 * et une invention n'atteint jamais le praticien.
 *
 * Une invention isolée ne fait pas échouer l'extraction entière : le reste des
 * propositions reste utile, et signaler l'écart vaut mieux que perdre le tout.
 */
export function rejectUngroundedProposals(
  candidates: readonly ExtractionCandidate[],
  transcript: string,
): { kept: ExtractionCandidate[]; rejected: ExtractionCandidate[] } {
  const kept: ExtractionCandidate[] = [];
  const rejected: ExtractionCandidate[] = [];

  for (const candidate of candidates) {
    if (anchorMatchesTranscript(candidate.anchor, transcript)) {
      kept.push(candidate);
    } else {
      rejected.push(candidate);
    }
  }

  return { kept, rejected };
}

const decidedStates = new Set<string>(["confirmed", "not_applicable"]);

function candidateKey(candidate: {
  section: string;
  kind: string;
  text: string;
}) {
  return `${candidate.section}|${candidate.kind}|${candidate.text.trim().toLowerCase()}`;
}

/**
 * Une régénération ne touche que ce que le praticien n'a pas encore décidé.
 * Voir disparaître sous ses yeux une section qu'il vient de valider serait la
 * violation la plus directe du principe « Biume prépare, le praticien décide ».
 */
export function mergePreservingDecisions(
  existing: readonly Proposal[],
  fresh: readonly ExtractionCandidate[],
): { toInsert: ExtractionCandidate[]; toDelete: string[] } {
  const decided = existing.filter((proposal) =>
    decidedStates.has(proposal.state),
  );
  const decidedKeys = new Set(decided.map(candidateKey));

  return {
    toInsert: fresh.filter(
      (candidate) => !decidedKeys.has(candidateKey(candidate)),
    ),
    toDelete: existing
      .filter((proposal) => !decidedStates.has(proposal.state))
      .map((proposal) => proposal.id),
  };
}

/**
 * L'état d'une section est déduit de ses propositions, jamais posé à la main :
 * deux sources de vérité finiraient par se contredire.
 */
export function deriveSectionStates(
  proposals: readonly Proposal[],
): ReportSectionStates {
  const states = createInitialReportSectionStates();

  for (const section of reportSectionIds) {
    const inSection = proposals.filter(
      (proposal) => proposal.section === section,
    );
    if (inSection.length === 0) continue;

    if (inSection.some((proposal) => !decidedStates.has(proposal.state))) {
      states[section] = "proposed";
      continue;
    }

    states[section] = inSection.every(
      (proposal) => proposal.state === "not_applicable",
    )
      ? "not_applicable"
      : "confirmed";
  }

  return states;
}
