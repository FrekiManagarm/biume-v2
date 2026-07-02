import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@biume/auth";
import { env } from "@biume/env/server";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { z } from "zod";

import {
  buildContextPrompt,
  type AppContext,
} from "#/lib/ai/context-builder";

const MAX_REQUEST_CHARS = 120_000;
const MAX_MESSAGES = 24;
const MAX_MESSAGE_PARTS = 32;
const MAX_TEXT_PART_CHARS = 6_000;
const MAX_TOTAL_TEXT_CHARS = 30_000;

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
    role: z.enum(["system", "user", "assistant"]),
    parts: z
      .array(
        z
          .object({
            type: z.string().trim().min(1).max(64),
          })
          .passthrough(),
      )
      .max(MAX_MESSAGE_PARTS),
  })
  .passthrough();

const chatRequestSchema = z.object({
  messages: z
    .array(uiMessageSchema)
    .min(1)
    .max(MAX_MESSAGES)
    .superRefine((messages, ctx) => {
      let totalTextLength = 0;

      for (const [messageIndex, message] of messages.entries()) {
        for (const [partIndex, part] of message.parts.entries()) {
          if (part.type !== "text") {
            continue;
          }

          const text = (part as { text?: unknown }).text;
          if (typeof text !== "string") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Text message parts must include text",
              path: [messageIndex, "parts", partIndex, "text"],
            });
            continue;
          }

          if (text.length > MAX_TEXT_PART_CHARS) {
            ctx.addIssue({
              code: z.ZodIssueCode.too_big,
              maximum: MAX_TEXT_PART_CHARS,
              type: "string",
              inclusive: true,
              message: "Text message part is too long",
              path: [messageIndex, "parts", partIndex, "text"],
            });
          }

          totalTextLength += text.length;
        }
      }

      if (totalTextLength > MAX_TOTAL_TEXT_CHARS) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: MAX_TOTAL_TEXT_CHARS,
          type: "array",
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
- Aider l'utilisateur a comprendre ou organiser ses patients, clients, rapports et rendez-vous
- Reformuler, resumer et structurer les informations medicales ou administratives
- Proposer des prochaines actions concretes dans l'interface Biume
- Repondre en francais, avec un ton clair, professionnel et concis

Important :
- Tu n'executes pas encore d'action dans l'application. Si l'utilisateur demande de creer, modifier ou supprimer quelque chose, guide-le clairement et indique les informations necessaires.
- Tu peux expliquer les commandes textuelles comme /create, /resume, /analyse, /synthese, /followup, /schedule et /todo, mais elles servent ici a orienter la conversation.
- N'invente pas de donnees patient, client, agenda ou rapport qui ne sont pas dans le message ou le contexte.`;

function buildInstructions(context?: AppContext) {
  const contextPrompt = context ? buildContextPrompt(context) : "";

  if (!contextPrompt) {
    return baseInstructions;
  }

  return `${baseInstructions}

Contexte actuel de l'utilisateur :
${contextPrompt}`;
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
    return Response.json(
      { error: "Invalid chat request" },
      { status: 400 },
    );
  }

  const body = parsedBody.data;
  const context = buildAuthenticatedContext(
    body.context,
    session.session.activeOrganizationId,
  );

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    instructions: buildInstructions(context),
    messages: await convertToModelMessages(body.messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
