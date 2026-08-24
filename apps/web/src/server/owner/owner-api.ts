import {
  followUpAnswerSchema,
  type FollowUpAnswer,
} from "@biume/contracts/followup";
import type { OwnerReportSnapshot } from "@biume/contracts/report";
import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";

const noStore = { "cache-control": "no-store" };

/**
 * La seule réponse jamais renvoyée à une demande de code, quel que soit l'état
 * réel du lien. Distinguer les cas transformerait l'API en oracle confirmant
 * qu'un compte rendu existe derrière un jeton donné.
 */
const challengeAcknowledgement = {
  message: "Si ce lien est valide, un code vient de vous être envoyé.",
};

export type OwnerShareLink = {
  token: string;
  ownerEmail: string | null;
  revokedAt: Date | null;
};

export type OwnerApiPorts = {
  findShareLink(token: string): Promise<OwnerShareLink | null>;
  issueChallenge(input: {
    token: string;
    deviceId: string;
    email: string;
  }): Promise<void>;
  verifyChallenge(input: {
    token: string;
    deviceId: string;
    code: string;
  }): Promise<{ sessionSecret: string } | null>;
  resolveSession(sessionSecret: string): Promise<{ token: string } | null>;
  loadSharedReport(token: string): Promise<OwnerReportSnapshot | null>;
  saveAnswer(token: string, answer: FollowUpAnswer): Promise<void>;
};

const challengeBodySchema = z
  .object({ deviceId: z.string().trim().min(1).max(128) })
  .strict();

const verifyBodySchema = z
  .object({
    deviceId: z.string().trim().min(1).max(128),
    code: z.string().regex(/^\d{6}$/),
  })
  .strict();

function unauthorized(c: Context) {
  // Message unique : ni le nombre de tentatives restantes, ni la raison du
  // refus ne doivent pouvoir être déduits.
  return c.json({ message: "Accès refusé." }, 401, noStore);
}

function invalid(c: Context) {
  return c.json({ message: "Requête invalide." }, 400, noStore);
}

function readBearer(c: Context): string | null {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const value = header.slice("Bearer ".length).trim();
  return value.length > 0 ? value : null;
}

export function createOwnerApiHandler(ports: OwnerApiPorts) {
  const app = new Hono().basePath("/api/owner/v1");

  app.post("/:token/challenge", async (c) => {
    const body = challengeBodySchema.safeParse(await c.req.json().catch(() => null));
    if (!body.success) return invalid(c);

    const link = await ports.findShareLink(c.req.param("token"));

    // Le code n'est émis que si le lien est réellement exploitable, mais la
    // réponse ne change jamais.
    if (link && link.revokedAt === null && link.ownerEmail) {
      await ports.issueChallenge({
        token: link.token,
        deviceId: body.data.deviceId,
        email: link.ownerEmail,
      });
    }

    return c.json(challengeAcknowledgement, 200, noStore);
  });

  app.post("/:token/verify", async (c) => {
    const body = verifyBodySchema.safeParse(await c.req.json().catch(() => null));
    if (!body.success) return invalid(c);

    const session = await ports.verifyChallenge({
      token: c.req.param("token"),
      deviceId: body.data.deviceId,
      code: body.data.code,
    });

    if (!session) return unauthorized(c);

    return c.json({ sessionSecret: session.sessionSecret }, 200, noStore);
  });

  /**
   * Une session n'ouvre qu'un seul lien. Vérifier le jeton résolu contre celui
   * de l'URL est ce qui empêche un propriétaire d'atteindre un compte rendu
   * qu'il a reçu par ailleurs, ou un autre.
   */
  async function requireSession(c: Context): Promise<string | null> {
    const secret = readBearer(c);
    if (!secret) return null;

    const session = await ports.resolveSession(secret);
    if (!session) return null;
    if (session.token !== c.req.param("token")) return null;

    return session.token;
  }

  app.get("/:token/report", async (c) => {
    const token = await requireSession(c);
    if (!token) return unauthorized(c);

    const snapshot = await ports.loadSharedReport(token);
    if (!snapshot) return unauthorized(c);

    return c.json(snapshot, 200, noStore);
  });

  app.post("/:token/answer", async (c) => {
    const token = await requireSession(c);
    if (!token) return unauthorized(c);

    const body = followUpAnswerSchema.safeParse(
      await c.req.json().catch(() => null),
    );
    if (!body.success) return invalid(c);

    await ports.saveAnswer(token, body.data);

    return c.json({ message: "Merci pour votre réponse." }, 200, noStore);
  });

  app.notFound((c) => c.json({ message: "Introuvable." }, 404, noStore));

  // Aucun détail d'exception ne sort de cette surface : elle est publique.
  app.onError((_error, c) =>
    c.json({ message: "Une erreur est survenue." }, 500, noStore),
  );

  return async (request: Request): Promise<Response> => app.fetch(request);
}
