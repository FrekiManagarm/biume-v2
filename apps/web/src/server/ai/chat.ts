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

const chatRequestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
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

  const body = chatRequestSchema.parse(await request.json());
  const context = buildAuthenticatedContext(
    body.context,
    session.session.activeOrganizationId,
  );

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    instructions: buildInstructions(context),
    messages: await convertToModelMessages(body.messages),
  });

  return result.toUIMessageStreamResponse();
}
