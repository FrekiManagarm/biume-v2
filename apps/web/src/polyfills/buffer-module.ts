// src/polyfills/buffer-module.ts
// A module version of the shim, used when a lib does `import { Buffer } from "buffer"`
export const Buffer = {
  // L'encodage est accepté pour respecter la signature attendue par les
  // librairies, puis ignoré : elles utilisent utf8.
  from: (input: string, _encoding?: string) =>
    new TextEncoder().encode(input),
  isBuffer: () => false,
}
export default Buffer
