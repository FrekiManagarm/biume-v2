import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

/** 256 bits : le lien est la seule barrière avant le code. */
export const shareTokenBytes = 32;
export const otpDigits = 6;
export const otpTtlMs = 10 * 60 * 1000;
export const otpMaxAttempts = 5;
export const ownerSessionTtlMs = 30 * 24 * 60 * 60 * 1000;

export function generateShareToken(): string {
  return randomBytes(shareTokenBytes).toString("base64url");
}

/**
 * `randomInt` couvre toute la plage, zéros de tête compris. Tirer six chiffres
 * un par un ou tronquer un nombre biaiserait la distribution.
 */
export function generateOtp(): string {
  return String(randomInt(0, 10 ** otpDigits)).padStart(otpDigits, "0");
}

export function hashOtp(code: string, salt: string): string {
  return createHmac("sha256", salt).update(code).digest("hex");
}

/**
 * Comparaison à temps constant : une comparaison naïve laisserait mesurer le
 * nombre de caractères corrects.
 */
export function verifyOtp(input: {
  code: string;
  salt: string;
  hash: string;
}): boolean {
  const expected = Buffer.from(input.hash, "hex");
  const actual = Buffer.from(hashOtp(input.code, input.salt), "hex");

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export type ChallengeState = {
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
};

/**
 * L'expiration est testée avant l'épuisement des tentatives, délibérément : le
 * propriétaire reçoit le même refus dans les deux cas, ce qui ne lui apprend
 * rien sur l'état interne du défi.
 */
export function classifyChallenge(
  challenge: ChallengeState,
  now: Date,
): "valid" | "expired" | "too_many_attempts" | "consumed" {
  if (challenge.consumedAt !== null) return "consumed";
  if (challenge.expiresAt.getTime() <= now.getTime()) return "expired";
  if (challenge.attempts >= otpMaxAttempts) return "too_many_attempts";
  return "valid";
}
