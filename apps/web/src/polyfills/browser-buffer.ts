// src/polyfills/browser-buffer.ts

/**
 * Les instances restent de vrais `Uint8Array` — c'est ce dont les librairies
 * PDF ont besoin — mais `from` et `isBuffer` vivent sur l'objet exporté plutôt
 * qu'en statiques de la classe.
 *
 * Un `static from` sur une classe qui étend `Uint8Array` contredit la signature
 * héritée, que TypeScript vérifie : `Uint8Array.from` accepte une fonction de
 * projection en second paramètre là où l'on attend un nom d'encodage.
 */
class BrowserBuffer extends Uint8Array {}

function fromInput(
  input: string | ArrayBuffer | ArrayLike<number>,
): BrowserBuffer {
  if (typeof input === "string") {
    // L'encodage est ignoré : les librairies PDF utilisent utf8.
    const arr = new TextEncoder().encode(input);
    const buf = new BrowserBuffer(arr.length);
    buf.set(arr);
    return buf;
  }

  if (input instanceof ArrayBuffer) {
    const arr = new Uint8Array(input);
    const buf = new BrowserBuffer(arr.length);
    buf.set(arr);
    return buf;
  }

  if (Array.isArray(input) || ArrayBuffer.isView(input)) {
    const arr = input as ArrayLike<number>;
    const buf = new BrowserBuffer(arr.length);
    // Boucle indexée : `ArrayLike` n'est pas itérable, seul `Array` l'est.
    for (let i = 0; i < arr.length; i += 1) buf[i] = arr[i];
    return buf;
  }

  throw new Error("BrowserBuffer.from: unsupported input type");
}

export const Buffer = {
  from: (
    input: string | ArrayBuffer | ArrayLike<number>,
    _encoding?: string,
  ): BrowserBuffer => fromInput(input),
  isBuffer: (value: unknown): boolean => value instanceof BrowserBuffer,
};

export default Buffer;
