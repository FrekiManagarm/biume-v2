type TrustedOriginInput = {
  corsOrigin: string;
  mobileTrustedOrigins: string;
};

/**
 * Builds the Better Auth allowlist from the web origin and the comma-separated
 * mobile deep links.
 *
 * Wildcards are rejected outright. Better Auth accepts them, but a wildcard in
 * this list would let any origin drive an authenticated session, which defeats
 * the point of declaring the native scheme explicitly.
 */
export function resolveTrustedOrigins({
  corsOrigin,
  mobileTrustedOrigins,
}: TrustedOriginInput): string[] {
  const mobileOrigins = mobileTrustedOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  for (const origin of mobileOrigins) {
    if (origin.includes("*")) {
      throw new Error(
        `Origine mobile invalide : "${origin}". Les wildcards sont interdits, déclarez chaque origine explicitement.`,
      );
    }
  }

  return [...new Set([corsOrigin.trim(), ...mobileOrigins])];
}
