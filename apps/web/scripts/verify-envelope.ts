/**
 * Vérifie que l'enveloppe produite par l'implémentation Dart est déchiffrable
 * par celle du serveur.
 *
 * Un aller-retour dans un seul langage passerait aussi bien avec le tag GCM
 * placé avant le chiffré — et le serveur ne saurait alors jamais relire une
 * dictée.
 *
 * Usage : bun run apps/web/scripts/verify-envelope.ts
 */
import { gcm } from "@noble/ciphers/aes.js";
import { readFileSync } from "node:fs";

const hex = readFileSync(
  new URL("../../mobile/test/fixtures/envelope-vector.hex", import.meta.url),
  "utf8",
).trim();
const envelope = new Uint8Array(
  hex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
);

const key = new Uint8Array(Array.from({ length: 32 }, (_, i) => i));
const captureId = "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70";
const expected = new Uint8Array(Array.from({ length: 256 }, (_, i) => i % 251));

const marker = new TextDecoder().decode(envelope.slice(0, 6));
if (marker !== "BIUME1") throw new Error(`marqueur inattendu: ${marker}`);

const nonce = envelope.slice(6, 18);
const ciphertext = envelope.slice(18);

const clear = gcm(key, nonce, new TextEncoder().encode(captureId)).decrypt(
  ciphertext,
);

if (clear.length !== expected.length) {
  throw new Error(`longueur: ${clear.length} au lieu de ${expected.length}`);
}
for (let i = 0; i < clear.length; i += 1) {
  if (clear[i] !== expected[i]) throw new Error(`octet ${i} diffère`);
}

console.log("COMPATIBLE: le serveur TypeScript déchiffre l'enveloppe Dart");
console.log("  marqueur:", marker);
console.log("  nonce:", Buffer.from(nonce).toString("hex"));
console.log("  clair:", clear.length, "octets, identiques");
