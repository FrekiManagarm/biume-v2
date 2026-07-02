import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@biume/env/server";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { z } from "zod";

const vulgarisationRequestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  reportId: z.string().optional(),
});

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const baseInstructions = `Tu es un assistant specialise dans la vulgarisation medicale veterinaire.

Ton role :
- Transformer les termes techniques en langage comprehensible par les proprietaires d'animaux
- Garder la precision medicale tout en etant accessible
- Adopter un ton rassurant, empathique et professionnel
- Eviter le jargon medical complexe
- Utiliser des comparaisons simples quand elles aident vraiment

Exemple de transformation :
Texte technique : "Manipulation des cervicales atlanto-occipitales avec liberation cranio-sacree"
Texte vulgarise : "J'ai travaille en douceur sur la zone du cou et de la base du crane pour detendre les tensions."

Style de communication :
- Phrases courtes et claires
- Vocabulaire du quotidien
- Ton rassurant
- Francais correct et fluide

Reponds uniquement avec le texte vulgarise pret a etre reutilise dans un compte-rendu client.`;

function buildInstructions(reportId?: string) {
  if (!reportId) {
    return baseInstructions;
  }

  return `${baseInstructions}

Contexte disponible : la demande vient du rapport ${reportId}. Utilise ce contexte uniquement comme indice de situation, sans inventer de details qui ne sont pas presents dans le texte fourni.`;
}

export async function handleVulgarisationRequest(request: Request) {
  const body = vulgarisationRequestSchema.parse(await request.json());

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    instructions: buildInstructions(body.reportId),
    messages: await convertToModelMessages(body.messages),
  });

  return result.toUIMessageStreamResponse();
}
