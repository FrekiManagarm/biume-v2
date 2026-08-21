import { evaluateAlertRules } from "@biume/contracts/followup";
import { db } from "@biume/db";
import {
  clients,
  followUp,
  followUpAlert,
  ownerAccessChallenge,
  ownerSession,
  reportShareLink,
  reportSharedVersion,
} from "@biume/db/schema/index";
import { and, desc, eq, gt, isNull } from "drizzle-orm";

import { createOwnerApiHandler, type OwnerApiPorts } from "./owner-api";
import {
  classifyChallenge,
  generateOtp,
  generateShareToken,
  hashOtp,
  otpTtlMs,
  ownerSessionTtlMs,
  verifyOtp,
} from "./owner-access.service";

export { generateShareToken };

function createProductionOwnerApiPorts(): OwnerApiPorts {
  return {
    async findShareLink(token) {
      const [row] = await db
        .select({
          token: reportShareLink.token,
          ownerEmail: clients.email,
          revokedAt: reportShareLink.revokedAt,
        })
        .from(reportShareLink)
        .innerJoin(clients, eq(clients.id, reportShareLink.ownerId))
        .where(eq(reportShareLink.token, token))
        .limit(1);

      return row ?? null;
    },

    async issueChallenge({ token, deviceId, email }) {
      const code = generateOtp();
      const salt = generateShareToken();
      const now = new Date();

      await db.insert(ownerAccessChallenge).values({
        id: crypto.randomUUID(),
        token,
        deviceId,
        codeHash: hashOtp(code, salt),
        codeSalt: salt,
        expiresAt: new Date(now.getTime() + otpTtlMs),
      });

      const { sendOwnerAccessCode } = await import("./owner-access.mailer");
      await sendOwnerAccessCode({ email, code });
    },

    async verifyChallenge({ token, deviceId, code }) {
      const now = new Date();

      const [challenge] = await db
        .select()
        .from(ownerAccessChallenge)
        .where(
          and(
            eq(ownerAccessChallenge.token, token),
            eq(ownerAccessChallenge.deviceId, deviceId),
          ),
        )
        .orderBy(desc(ownerAccessChallenge.createdAt))
        .limit(1);

      if (!challenge) return null;
      if (classifyChallenge(challenge, now) !== "valid") return null;

      // La tentative est comptée avant la comparaison : un code faux consomme
      // le crédit même si la requête est interrompue ensuite.
      await db
        .update(ownerAccessChallenge)
        .set({ attempts: challenge.attempts + 1 })
        .where(eq(ownerAccessChallenge.id, challenge.id));

      if (
        !verifyOtp({
          code,
          salt: challenge.codeSalt,
          hash: challenge.codeHash,
        })
      ) {
        return null;
      }

      await db
        .update(ownerAccessChallenge)
        .set({ consumedAt: now })
        .where(eq(ownerAccessChallenge.id, challenge.id));

      const sessionSecret = generateShareToken();
      await db.insert(ownerSession).values({
        id: crypto.randomUUID(),
        token,
        sessionSecret,
        deviceId,
        expiresAt: new Date(now.getTime() + ownerSessionTtlMs),
      });

      return { sessionSecret };
    },

    async resolveSession(sessionSecret) {
      const [row] = await db
        .select({ token: ownerSession.token })
        .from(ownerSession)
        .where(
          and(
            eq(ownerSession.sessionSecret, sessionSecret),
            isNull(ownerSession.revokedAt),
            gt(ownerSession.expiresAt, new Date()),
          ),
        )
        .limit(1);

      return row ?? null;
    },

    async loadSharedReport(token) {
      // La version figée, jamais le rapport vivant : ce que le propriétaire a
      // lu ne change pas quand le praticien retouche son document.
      const [row] = await db
        .select({ snapshot: reportSharedVersion.snapshot })
        .from(reportShareLink)
        .innerJoin(
          reportSharedVersion,
          eq(reportSharedVersion.id, reportShareLink.sharedVersionId),
        )
        .where(
          and(
            eq(reportShareLink.token, token),
            isNull(reportShareLink.revokedAt),
          ),
        )
        .limit(1);

      return row?.snapshot ?? null;
    },

    async saveAnswer(token, answer) {
      const now = new Date();

      const [updated] = await db
        .update(followUp)
        .set({
          answer,
          answeredAt: now,
          status: "answered",
          updatedAt: now,
        })
        .where(
          and(
            eq(followUp.shareToken, token),
            // `answered` est terminal : une réponse déjà reçue ne se remplace
            // pas, et la clause le garantit côté base.
            eq(followUp.status, "sent"),
          ),
        )
        .returning({ id: followUp.id });

      if (!updated) return;

      const reasons = evaluateAlertRules(answer);
      if (reasons.length === 0) return;

      await db.insert(followUpAlert).values(
        reasons.map((reason) => ({
          id: crypto.randomUUID(),
          followUpId: updated.id,
          reason,
        })),
      );
    },
  };
}

export async function handleOwnerApiRequest(
  request: Request,
): Promise<Response> {
  return createOwnerApiHandler(createProductionOwnerApiPorts())(request);
}
