// src/polyfills/buffer-module.ts
// A module version of the shim, used when a lib does `import { Buffer } from "buffer"`
export const Buffer = {
  from: (input: string, encoding?: string) =>
    new TextEncoder().encode(input),
  isBuffer: () => false,
}
export default Buffer
