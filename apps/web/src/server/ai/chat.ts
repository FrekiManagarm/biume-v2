import { createOpenAI } from "@ai-sdk/openai";
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

const chatRequestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  context: z.custom<AppContext>().optional(),
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

export async function handleChatRequest(request: Request) {
  const body = chatRequestSchema.parse(await request.json());

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    instructions: buildInstructions(body.context),
    messages: await convertToModelMessages(body.messages),
  });

  return result.toUIMessageStreamResponse();
}
