import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@biume/auth";
import { db } from "@biume/db";
import { advancedReport } from "@biume/db/schema/index";
import { env } from "@biume/env/server";
import { streamText } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { buildPersistedOwnerSources } from "#/components/dashboard/pages/reports-module/owner-content.persistence";

const MAX_REQUEST_CHARS = 16_000;
const MAX_OUTPUT_TOKENS = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 20;
const MAX_CANONICAL_SOURCE_CHARS = 8_000;

const sourceKindSchema = z.enum([
  "consultationReason",
  "observation",
  "anatomicalIssue",
  "recommendation",
  "notes",
]);

const vulgarisationRequestSchema = z.object({
  reportId: z.string().trim().min(1).max(128),
  sourceKind: sourceKindSchema,
  sourceId: z.string().trim().min(1).max(128),
});

const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
const requestWindows = new Map<string, { startedAt: number; count: number }>();

const baseInstructions = `Tu es un assistant specialise dans la vulgarisation medicale veterinaire.

Ton role :
- Transformer le texte professionnel fourni en langage comprehensible par le proprietaire de l'animal
- Garder la precision medicale tout en restant accessible
- Adopter un ton rassurant, empathique et professionnel
- Utiliser des phrases courtes et un vocabulaire du quotidien

Regles de securite :
- N'invente aucun fait, detail medical, diagnostic, traitement ou recommandation absent de la source
- Ne transforme jamais une hypothese ou une observation en diagnostic certain
- N'ajoute aucune information provenant de connaissances generales

Reponds uniquement avec le texte vulgarise, en francais, pret a etre relu par le professionnel.`;

function buildInstructions(sourceContext: string) {
  return `${baseInstructions}

Contexte canonique charge depuis le rapport :
${sourceContext}

Ce contexte sert uniquement a conserver le sens et les attributs de la source. N'ajoute rien qui n'apparait pas dans le texte professionnel ou ce contexte.`;
}

function exceedsRateLimit(key: string) {
  const now = Date.now();
  if (requestWindows.size > 5_000) {
    for (const [candidateKey, window] of requestWindows) {
      if (now - window.startedAt >= RATE_LIMIT_WINDOW_MS) {
        requestWindows.delete(candidateKey);
      }
    }
  }
  const current = requestWindows.get(key);
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_REQUESTS;
}

export function resetVulgarisationRateLimitForTests() {
  requestWindows.clear();
}

export async function handleVulgarisationRequest(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return new Response("Active organization required", { status: 403 });
  }

  const rateLimitKey = `${organizationId}:${session.user.id}`;
  if (exceedsRateLimit(rateLimitKey)) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_REQUEST_CHARS) {
    return new Response("Request body too large", { status: 413 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  const parsedBody = vulgarisationRequestSchema.safeParse(parsedJson);
  if (!parsedBody.success) {
    return Response.json(
      { error: "Invalid vulgarisation request" },
      { status: 400 },
    );
  }

  const body = parsedBody.data;
  const report = await db.query.advancedReport.findFirst({
    where: and(
      eq(advancedReport.id, body.reportId),
      eq(advancedReport.createdBy, organizationId),
    ),
    with: {
      anatomicalIssues: { with: { anatomicalPart: true } },
      recommendations: true,
    },
  });
  if (!report) return new Response("Report source not found", { status: 404 });

  const source = buildPersistedOwnerSources(report).find(
    (candidate) =>
      candidate.sourceKind === body.sourceKind &&
      candidate.sourceId === body.sourceId,
  );
  if (!source) return new Response("Report source not found", { status: 404 });
  if (source.professionalText.length > MAX_CANONICAL_SOURCE_CHARS) {
    return new Response("Report source is too large", { status: 422 });
  }

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    instructions: buildInstructions(source.context),
    messages: [{ role: "user", content: source.professionalText }],
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    onError: ({ error }) => {
      console.error("[Vulgarisation] Stream error", error);
    },
  });

  return result.toUIMessageStreamResponse();
}
