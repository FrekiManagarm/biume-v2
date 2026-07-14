import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@biume/env/server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

const vulgarisationRequestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  reportId: z.string().optional(),
  sourceKind: z
    .enum([
      "consultationReason",
      "observation",
      "anatomicalIssue",
      "recommendation",
      "notes",
    ])
    .optional(),
  sourceContext: z.string().max(2_000).optional(),
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

Regles de securite :
- N'invente aucun fait, detail medical ou diagnostic absent du texte fourni
- Ne transforme jamais une hypothese ou une observation en diagnostic certain

Reponds uniquement avec le texte vulgarise pret a etre reutilise dans un compte-rendu client.`;

function buildInstructions({
  reportId,
  sourceKind,
  sourceContext,
}: {
  reportId?: string;
  sourceKind?: z.infer<typeof vulgarisationRequestSchema>["sourceKind"];
  sourceContext?: string;
}) {
  const context: string[] = [];

  if (reportId) context.push(`Rapport : ${reportId}`);
  if (sourceKind) context.push(`Type de source : ${sourceKind}`);
  if (sourceContext) context.push(`Contexte de la source : ${sourceContext}`);

  if (context.length === 0) return baseInstructions;

  return `${baseInstructions}

Contexte disponible :
${context.map((line) => `- ${line}`).join("\n")}

Utilise ce contexte uniquement pour clarifier la formulation. N'invente aucun fait ni diagnostic et ne modifie pas le sens du texte professionnel fourni.`;
}

export async function handleVulgarisationRequest(request: Request) {
  const body = vulgarisationRequestSchema.parse(await request.json());

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    instructions: buildInstructions(body),
    messages: await convertToModelMessages(body.messages),
  });

  return result.toUIMessageStreamResponse();
}
