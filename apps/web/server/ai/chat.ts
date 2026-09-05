import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@biume/auth";
import { env } from "@biume/env/server";
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { buildContextPrompt, type AppContext } from "#/lib/ai/context-builder";
import {
  buildAssistantDataSnapshot,
  createAssistantTools,
} from "#/server/ai/assistant-tools";

const MAX_REQUEST_CHARS = 120_000;
const MAX_MESSAGES = 24;
const MAX_MESSAGE_PARTS = 32;
const MAX_TEXT_PART_CHARS = 6_000;
const MAX_TOTAL_TEXT_CHARS = 30_000;
const MAX_OUTPUT_TOKENS = 1_500;

type AssistantUIMessage = Omit<UIMessage, "role"> & {
  role: "user" | "assistant";
};

const contextEntitySchema = z
  .object({
    id: z.string().trim().min(1).max(128),
    name: z.string().trim().max(160).optional(),
  })
  .optional();

const appContextSchema = z
  .object({
    currentPage: z.string().trim().min(1).max(180).default("/dashboard"),
    selectedPatient: contextEntitySchema,
    selectedClient: contextEntitySchema,
    recentActions: z
      .array(z.string().trim().min(1).max(180))
      .max(5)
      .default([]),
  })
  .optional();

const uiMessageSchema = z
  .object({
    id: z.string().trim().min(1).max(128),
    role: z.enum(["user", "assistant"]),
    parts: z
      .array(
        z
          .object({
            type: z.string().trim().min(1).max(160),
            text: z.string().max(MAX_TEXT_PART_CHARS).optional(),
          })
          .passthrough(),
      )
      .max(MAX_MESSAGE_PARTS),
  })
  .passthrough()
  .transform((message) => message as AssistantUIMessage);

const chatRequestSchema = z.object({
  messages: z
    .array(uiMessageSchema)
    .min(1)
    .max(MAX_MESSAGES)
    .superRefine((messages, ctx) => {
      let totalTextLength = 0;

      for (const message of messages) {
        for (const part of message.parts as Array<{ text?: unknown }>) {
          if (typeof part.text === "string") {
            totalTextLength += part.text.length;
          }
        }
      }

      if (totalTextLength > MAX_TOTAL_TEXT_CHARS) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: MAX_TOTAL_TEXT_CHARS,
          origin: "array",
          inclusive: true,
          message: "Message history is too long",
          path: [],
        });
      }
    }),
  context: appContextSchema,
});

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const baseInstructions = `Tu es l'assistant IA de Biume, une application de gestion pour professionnels de la sante animale.

Ton role :
- Aider le professionnel a piloter son activite dans Biume : clients, patients, dossiers, rendez-vous, suivi et preparation
- Consulter les dossiers clients/patients quand l'utilisateur le demande ou quand le contexte l'exige
- Creer un dossier client, un dossier patient ou un rendez-vous quand la demande est explicite et que les informations obligatoires sont disponibles
- Preparer un rendez-vous avec une synthese du patient, du proprietaire, des derniers comptes rendus, des points a verifier et du rendez-vous a venir
- Reformuler, resumer et structurer les informations medicales ou administratives
- Repondre en francais, avec un ton clair, professionnel et concis

Important :
- Tu peux utiliser les outils disponibles pour lire ou creer des donnees dans l'organisation active.
- N'invente jamais de donnees patient, client, agenda ou rapport qui ne viennent pas du message, du contexte ou d'un outil.
- Pour une creation, n'appelle un outil de creation que si l'utilisateur a donne une intention claire. Si une information obligatoire manque, pose une question courte au lieu de deviner.
- Avant de creer un patient, verifie le client/proprietaire et le type d'animal si necessaire.
- Avant de preparer un rendez-vous, recupere le rendez-vous et/ou le dossier patient avec les outils.
- Apres une action reussie, confirme ce qui a ete fait et donne les identifiants utiles.
- Pour les sujets medicaux, reste descriptif et prudent : tu aides a organiser les informations, tu ne poses pas de diagnostic veterinaire.`;

async function buildInstructions(context?: AppContext) {
  const contextPrompt = context ? buildContextPrompt(context) : "";
  const dataSnapshot =
    context?.organizationId && context
      ? await buildAssistantDataSnapshot(context, context.organizationId).catch(
          (error) => {
            console.error("[Assistant] Failed to build data snapshot", error);
            return "";
          },
        )
      : "";

  if (!contextPrompt && !dataSnapshot) {
    return baseInstructions;
  }

  return [
    baseInstructions,
    contextPrompt
      ? `Contexte actuel de l'utilisateur :\n${contextPrompt}`
      : null,
    dataSnapshot ? `Donnees utiles deja chargees :\n${dataSnapshot}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildAuthenticatedContext(
  context: z.infer<typeof appContextSchema>,
  organizationId: string,
): AppContext {
  return {
    currentPage: context?.currentPage ?? "/dashboard",
    organizationId,
    selectedPatient: context?.selectedPatient,
    selectedClient: context?.selectedClient,
    recentActions: context?.recentActions ?? [],
  };
}

export async function handleChatRequest(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!session.session.activeOrganizationId) {
    return new Response("Active organization required", { status: 403 });
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

  const parsedBody = chatRequestSchema.safeParse(parsedJson);
  if (!parsedBody.success) {
    return Response.json({ error: "Invalid chat request" }, { status: 400 });
  }

  const body = parsedBody.data;
  const context = buildAuthenticatedContext(
    body.context,
    session.session.activeOrganizationId,
  );
  const tools = createAssistantTools(session.session.activeOrganizationId);

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    instructions: await buildInstructions(context),
    messages: await convertToModelMessages(body.messages, {
      tools,
      ignoreIncompleteToolCalls: true,
    }),
    tools,
    stopWhen: isStepCount(6),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    onError: ({ error }) => {
      console.error("[Assistant] Stream error", error);
    },
  });

  return result.toUIMessageStreamResponse();
}
