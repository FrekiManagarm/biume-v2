/**
 * Banc d'essai : transcription serveur contre transcription locale.
 *
 * Fait passer le **même** fichier audio par `gpt-4o-transcribe` (la voie
 * serveur actuelle) et par Whisper exécuté localement (la voie « sur
 * l'appareil » envisagée), avec le **même amorçage métier**, puis compare.
 *
 * Ce que le banc mesure honnêtement :
 *   - les termes du lexique que chaque moteur retrouve
 *   - le taux d'erreur par mot, si une transcription de référence est fournie
 *
 * Ce qu'il ne mesure **pas** : la durée sur un téléphone. Un Mac Apple Silicon
 * est bien plus rapide qu'un iPhone et ne prédit rien. Les durées affichées ne
 * servent qu'à comparer les deux moteurs entre eux, jamais à valider la
 * promesse des cinq minutes — celle-là se chronomètre sur un appareil réel.
 *
 * Usage :
 *   bun run apps/web/scripts/bench-transcription.ts <audio> [reference.txt]
 *
 * Exige OPENAI_API_KEY dans l'environnement ou dans apps/web/.env.
 */

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { osteopathyLexicon } from "../server/transcription/lexicon";
import { buildTranscriptionPrompt } from "../server/transcription/transcription.service";

// --- Entrées ----------------------------------------------------------------

const [audioPath, referencePath] = process.argv.slice(2);

/**
 * Nom de l'animal, à passer comme en production.
 *
 * Mesuré le 24 août 2026 : sans lui, `whisper small` transcrit « Filou » en
 * « fil ou ». Avec lui, c'est juste. Le vocabulaire clinique, lui, passe dans
 * les deux cas — c'est le lexique d'amorçage qui le porte.
 *
 *   BIUME_PATIENT_NAME=Filou BIUME_PATIENT_BREED="border collie" bun run ...
 */
const patientName = process.env.BIUME_PATIENT_NAME ?? null;

/** Race de l'animal, comme en production. */
const breed = process.env.BIUME_PATIENT_BREED ?? null;

if (!audioPath || !existsSync(audioPath)) {
  console.error(
    "Usage : bun run apps/web/scripts/bench-transcription.ts <audio> [reference.txt]",
  );
  process.exit(1);
}

/**
 * `null` quand aucune clé n'est trouvée. La voie serveur est alors sautée
 * plutôt que le banc entier abandonné : la moitié locale reste mesurable, et
 * c'est elle qui décide de la faisabilité sur l'appareil.
 */
function readApiKey(): string | null {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

  const envFile = new URL("../.env", import.meta.url);
  if (existsSync(envFile)) {
    const match = readFileSync(envFile, "utf8").match(/^OPENAI_API_KEY=(.+)$/m);
    if (match?.[1]) return match[1].trim();
  }

  return null;
}

// Le même amorçage que la production : le banc doit tester le prompt réel, pas
// une approximation.
const prompt = buildTranscriptionPrompt({ patientName, breed });

// --- Voie serveur -----------------------------------------------------------

async function transcribeWithOpenAi(
  apiKey: string,
): Promise<{ text: string; ms: number }> {
  const form = new FormData();
  form.append("file", new Blob([readFileSync(audioPath)]), "capture.m4a");
  form.append("model", "gpt-4o-transcribe");
  form.append("language", "fr");
  form.append("prompt", prompt);
  form.append("response_format", "json");

  const started = Date.now();
  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}` },
      body: form,
    },
  );
  const ms = Date.now() - started;

  if (!response.ok) {
    throw new Error(`gpt-4o-transcribe a répondu ${response.status}`);
  }

  const payload = (await response.json()) as { text?: string };
  return { text: payload.text ?? "", ms };
}

// --- Voie locale ------------------------------------------------------------

/**
 * `mlx-whisper` sur Apple Silicon, `openai-whisper` sinon. Les deux sont
 * exécutés par `uvx` : rien n'est installé durablement sur la machine.
 */
function transcribeLocally(model: string): { text: string; ms: number } {
  const outDir = mkdtempSync(join(tmpdir(), "biume-whisper-"));

  const attempts = [
    {
      tool: "mlx-whisper",
      args: [
        // Le paquet s'appelle `mlx-whisper`, mais le script installé
        // `mlx_whisper`. Sans `--from`, uvx cherche une commande qui n'existe
        // pas et le banc retombe silencieusement sur la voie lente.
        "--from",
        "mlx-whisper",
        "mlx_whisper",
        audioPath,
        "--model",
        `mlx-community/whisper-${model}-mlx`,
        "--language",
        "fr",
        // Même amorçage que la voie serveur, sinon la comparaison ne dit rien.
        "--initial-prompt",
        prompt,
        "--output-dir",
        outDir,
        "--output-format",
        "txt",
      ],
    },
    {
      tool: "openai-whisper",
      args: [
        "--from",
        "openai-whisper",
        "whisper",
        audioPath,
        "--model",
        model,
        "--language",
        "fr",
        "--initial_prompt",
        prompt,
        "--output_dir",
        outDir,
        "--output_format",
        "txt",
      ],
    },
  ];

  for (const attempt of attempts) {
    const started = Date.now();
    const run = spawnSync("uvx", attempt.args, { encoding: "utf8" });
    const ms = Date.now() - started;

    if (run.status === 0) {
      const produced = readdirSync(outDir).find((f) => f.endsWith(".txt"));
      if (produced) {
        console.log(`  (moteur local : ${attempt.tool})`);
        return { text: readFileSync(join(outDir, produced), "utf8"), ms };
      }
    }
  }

  throw new Error(
    "Aucun moteur local n'a abouti. Vérifier que `uvx` fonctionne et que la " +
      "machine peut télécharger le modèle.",
  );
}

// --- Comparaison ------------------------------------------------------------

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

/** Distance de Levenshtein sur les mots, rapportée à la longueur de référence. */
function wordErrorRate(reference: string[], hypothesis: string[]): number {
  const rows = reference.length + 1;
  const cols = hypothesis.length + 1;
  const d = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = reference[i - 1] === hypothesis[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }

  return reference.length === 0 ? 0 : d[rows - 1][cols - 1] / reference.length;
}

/**
 * Les termes du lexique **réellement prononcés** que le moteur a retrouvés.
 *
 * C'est la mesure qui décide : un moteur peut avoir un bon taux d'erreur global
 * et rater précisément le vocabulaire clinique, qui est la seule chose que ce
 * produit doit transcrire juste.
 *
 * Le dénominateur vient de la référence, jamais du lexique entier. Compter sur
 * les vingt-quatre termes ferait afficher « 5/24 » pour une transcription
 * parfaite d'une dictée qui n'en contenait que cinq — et conclure à un échec.
 */
function lexiconRecall(
  text: string,
  spoken: readonly string[],
): { found: string[]; missed: string[] } {
  const haystack = normalize(text).join(" ");
  const found: string[] = [];
  const missed: string[] = [];

  for (const term of spoken) {
    const needle = normalize(term).join(" ");
    (haystack.includes(needle) ? found : missed).push(term);
  }

  return { found, missed };
}

/** Les termes du lexique présents dans la transcription de référence. */
function spokenLexicon(referenceText: string): string[] {
  const haystack = normalize(referenceText).join(" ");
  return osteopathyLexicon.filter((term) =>
    haystack.includes(normalize(term).join(" ")),
  );
}

function report(
  label: string,
  result: { text: string; ms: number },
  reference: string[] | null,
  spoken: readonly string[],
) {
  const { found, missed } = lexiconRecall(result.text, spoken);

  console.log(`\n── ${label} ${"─".repeat(Math.max(0, 60 - label.length))}`);
  console.log(`durée         ${(result.ms / 1000).toFixed(1)} s`);
  console.log(`mots produits ${normalize(result.text).length}`);

  if (reference) {
    const wer = wordErrorRate(reference, normalize(result.text));
    console.log(`taux d'erreur ${(wer * 100).toFixed(1)} %`);
  }

  if (spoken.length === 0) {
    console.log(
      "lexique       non mesurable sans référence — fournir un second argument",
    );
  } else {
    console.log(
      `lexique       ${found.length}/${spoken.length} termes prononcés retrouvés`,
    );
    if (missed.length > 0) {
      console.log(`manqués       ${missed.join(", ")}`);
    }
  }
  console.log(`\n${result.text.trim()}\n`);
}

// --- Exécution --------------------------------------------------------------

const referenceText =
  referencePath && existsSync(referencePath)
    ? readFileSync(referencePath, "utf8")
    : null;

const reference = referenceText ? normalize(referenceText) : null;

// Le dénominateur du rappel : ce que la dictée contenait réellement.
const spoken = referenceText ? spokenLexicon(referenceText) : [];

if (!reference) {
  console.log(
    "Aucune transcription de référence fournie : le taux d'erreur ne sera pas " +
      "calculé. Fournir un second argument pour l'obtenir.\n",
  );
}

console.log("Amorçage utilisé (identique pour les deux moteurs) :");
console.log(`  ${prompt}\n`);

const apiKey = readApiKey();

let server: { text: string; ms: number } | null = null;
if (apiKey === null) {
  console.log(
    "OPENAI_API_KEY absente : la voie serveur est sautée. Seule la voie locale sera mesurée.\n",
  );
} else {
  console.log("Transcription serveur (gpt-4o-transcribe)…");
  server = await transcribeWithOpenAi(apiKey);
}

const localModel = process.env.BIUME_WHISPER_MODEL ?? "small";
console.log(`Transcription locale (whisper ${localModel})…`);
const local = transcribeLocally(localModel);

if (server) report("SERVEUR — gpt-4o-transcribe", server, reference, spoken);
report(`LOCAL — whisper ${localModel}`, local, reference, spoken);

console.log("─".repeat(64));

if (server) {
  const serverRecall = lexiconRecall(server.text, spoken).found.length;
  const localRecall = lexiconRecall(local.text, spoken).found.length;

  console.log(
    `Écart de lexique : ${Math.abs(serverRecall - localRecall)} terme(s) en ` +
      `faveur du ${serverRecall >= localRecall ? "serveur" : "local"}`,
  );
} else {
  console.log("Voie serveur non mesurée : aucune comparaison possible.");
}
console.log(
  "\nRappel : les durées ci-dessus comparent deux moteurs sur cette machine.\n" +
    "Elles ne disent rien de la durée sur un téléphone, qui doit être\n" +
    "chronométrée sur un appareil réel.",
);
