import { describe, expect, it } from "vitest";

import {
  classifyChallenge,
  generateOtp,
  generateShareToken,
  hashOtp,
  otpMaxAttempts,
  otpTtlMs,
  verifyOtp,
} from "./owner-access.service";

const now = new Date("2026-08-21T10:00:00.000Z");

describe("jeton de partage", () => {
  /**
   * Le lien est la seule barrière avant l'OTP. Un jeton court ou dérivé d'un
   * identifiant de rapport serait énumérable, et chaque lien mène à des données
   * de santé.
   */
  it("porte assez d'entropie pour ne pas être énumérable", () => {
    expect(generateShareToken().length).toBeGreaterThanOrEqual(43);
  });

  it("ne se répète jamais", () => {
    const tokens = new Set(Array.from({ length: 500 }, generateShareToken));

    expect(tokens.size).toBe(500);
  });

  it("reste utilisable dans une URL", () => {
    expect(generateShareToken()).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("code à usage unique", () => {
  it("fait six chiffres", () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it("couvre toute la plage, y compris les codes à zéros de tête", () => {
    const codes = Array.from({ length: 2000 }, generateOtp);

    expect(codes.every((code) => code.length === 6)).toBe(true);
    expect(new Set(codes).size).toBeGreaterThan(1500);
  });

  it("ne se vérifie que contre son propre sel", () => {
    const hash = hashOtp("123456", "sel-a");

    expect(verifyOtp({ code: "123456", salt: "sel-a", hash })).toBe(true);
    expect(verifyOtp({ code: "123456", salt: "sel-b", hash })).toBe(false);
    expect(verifyOtp({ code: "654321", salt: "sel-a", hash })).toBe(false);
  });

  /**
   * Le code n'est jamais stocké en clair : une fuite de base ne doit pas donner
   * accès aux comptes rendus.
   */
  it("ne laisse pas le code apparaître dans son empreinte", () => {
    expect(hashOtp("123456", "sel")).not.toContain("123456");
  });
});

describe("classification d'un défi", () => {
  const challenge = {
    expiresAt: new Date(now.getTime() + otpTtlMs),
    attempts: 0,
    consumedAt: null,
  };

  it("accepte un défi frais", () => {
    expect(classifyChallenge(challenge, now)).toBe("valid");
  });

  it("refuse un défi expiré", () => {
    expect(
      classifyChallenge(
        { ...challenge, expiresAt: new Date(now.getTime() - 1) },
        now,
      ),
    ).toBe("expired");
  });

  it("refuse après trop de tentatives", () => {
    expect(
      classifyChallenge({ ...challenge, attempts: otpMaxAttempts }, now),
    ).toBe("too_many_attempts");
  });

  it("refuse un défi déjà consommé", () => {
    expect(classifyChallenge({ ...challenge, consumedAt: now }, now)).toBe(
      "consumed",
    );
  });

  /**
   * L'ordre compte : un défi à la fois expiré et épuisé répond la même chose au
   * propriétaire dans les deux cas, sans lui apprendre combien de tentatives il
   * restait.
   */
  it("ne révèle pas l'état interne par l'ordre des refus", () => {
    expect(
      classifyChallenge(
        {
          ...challenge,
          expiresAt: new Date(now.getTime() - 1),
          attempts: otpMaxAttempts,
        },
        now,
      ),
    ).toBe("expired");
  });
});
