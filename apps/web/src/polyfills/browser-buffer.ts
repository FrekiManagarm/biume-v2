// src/polyfills/browser-buffer.ts
class BrowserBuffer extends Uint8Array {
  static from(
    input: string | ArrayBuffer | ArrayLike<number>,
    encoding?: string,
  ): BrowserBuffer {
    if (typeof input === 'string') {
      const encoder = new TextEncoder()
      const arr = encoder.encode(input) // ignore encoding; pdf libs usually use utf8
      const buf = new BrowserBuffer(arr.length)
      buf.set(arr)
      return buf
    }

    if (input instanceof ArrayBuffer) {
      const arr = new Uint8Array(input)
      const buf = new BrowserBuffer(arr.length)
      buf.set(arr)
      return buf
    }

    if (Array.isArray(input) || ArrayBuffer.isView(input)) {
      const arr = input as ArrayLike<number>
      const buf = new BrowserBuffer(arr.length)
      let i = 0
      for (const v of arr) buf[i++] = v
      return buf
    }

    throw new Error('BrowserBuffer.from: unsupported input type')
  }

  static isBuffer(value: unknown): boolean {
    return value instanceof BrowserBuffer
  }
}

export const Buffer = BrowserBuffer
export default Buffer
