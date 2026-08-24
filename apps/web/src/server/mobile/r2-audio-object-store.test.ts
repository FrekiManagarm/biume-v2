import { captureUploadUrlTtlSeconds } from "@biume/contracts/capture";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createR2AudioObjectStore } from "./r2-audio-object-store";

const getSignedUrl = vi.fn(async () => "https://signed.example.com/put");

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: unknown[]) =>
    (getSignedUrl as unknown as (...a: unknown[]) => Promise<string>)(...args),
}));

const send = vi.fn();
const now = new Date("2026-07-19T10:00:00.000Z");

function createStore() {
  return createR2AudioObjectStore({
    client: { send } as never,
    bucket: "biume-audio",
    now: () => now,
  });
}

const expectedObject = {
  key: "captures/9f86d081884c7d65/capture-1/audio.m4a",
  contentType: "audio/mp4" as const,
  byteSize: 1_048_576,
  sha256: "a".repeat(64),
};

beforeEach(() => {
  send.mockReset();
  getSignedUrl.mockClear();
});

describe("signed upload", () => {
  it("signs exactly one PUT bound to the expected object", async () => {
    const store = createStore();

    const signed = await store.createPutUrl({
      ...expectedObject,
      expiresInSeconds: captureUploadUrlTtlSeconds,
    });

    const [, command, options] = getSignedUrl.mock.calls[0] as unknown as [
      unknown,
      PutObjectCommand,
      { expiresIn: number },
    ];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toEqual({
      Bucket: "biume-audio",
      Key: expectedObject.key,
      ContentType: "audio/mp4",
      ContentLength: 1_048_576,
      Metadata: { sha256: expectedObject.sha256 },
    });
    expect(options.expiresIn).toBe(600);
    expect(signed.url).toBe("https://signed.example.com/put");
  });

  it("never grants an ACL or a public read", async () => {
    const store = createStore();

    await store.createPutUrl({
      ...expectedObject,
      expiresInSeconds: captureUploadUrlTtlSeconds,
    });

    const [, command] = getSignedUrl.mock.calls[0] as unknown as [unknown, PutObjectCommand];
    expect(command.input).not.toHaveProperty("ACL");
    expect(Object.keys(command.input)).not.toContain("GrantRead");
  });

  it("expires the authorization on the server clock", async () => {
    const store = createStore();

    const signed = await store.createPutUrl({
      ...expectedObject,
      expiresInSeconds: captureUploadUrlTtlSeconds,
    });

    expect(signed.expiresAt).toEqual(
      new Date(now.getTime() + captureUploadUrlTtlSeconds * 1000),
    );
  });

  it("binds the content type the upload must declare", async () => {
    const store = createStore();

    const signed = await store.createPutUrl({
      ...expectedObject,
      expiresInSeconds: captureUploadUrlTtlSeconds,
    });

    expect(signed.headers).toEqual({
      "content-type": "audio/mp4",
      "content-length": "1048576",
      "x-amz-meta-sha256": expectedObject.sha256,
    });
  });
});

describe("object inspection", () => {
  it("normalizes a stored object", async () => {
    send.mockResolvedValueOnce({
      ETag: '"etag-1"',
      ContentType: "audio/mp4",
      ContentLength: 1_048_576,
      Metadata: { sha256: expectedObject.sha256 },
    });
    const store = createStore();

    const stored = await store.head(expectedObject.key);

    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(HeadObjectCommand);
    expect(stored).toEqual({
      etag: '"etag-1"',
      contentType: "audio/mp4",
      byteSize: 1_048_576,
      metadata: { sha256: expectedObject.sha256 },
    });
  });

  it("reports a missing object as null rather than throwing", async () => {
    send.mockRejectedValueOnce(
      Object.assign(new Error("NotFound"), { name: "NotFound" }),
    );
    const store = createStore();

    await expect(store.head(expectedObject.key)).resolves.toBeNull();
  });

  it("propagates an unexpected storage failure", async () => {
    send.mockRejectedValueOnce(
      Object.assign(new Error("AccessDenied"), { name: "AccessDenied" }),
    );
    const store = createStore();

    await expect(store.head(expectedObject.key)).rejects.toThrow(
      "AccessDenied",
    );
  });
});

describe("object deletion", () => {
  it("deletes the object by key", async () => {
    send.mockResolvedValueOnce({});
    const store = createStore();

    await store.delete(expectedObject.key);

    const command = send.mock.calls[0]?.[0] as DeleteObjectCommand;
    expect(command).toBeInstanceOf(DeleteObjectCommand);
    expect(command.input).toEqual({
      Bucket: "biume-audio",
      Key: expectedObject.key,
    });
  });

  it("stays idempotent when the object is already gone", async () => {
    send.mockRejectedValueOnce(
      Object.assign(new Error("NoSuchKey"), { name: "NoSuchKey" }),
    );
    const store = createStore();

    await expect(store.delete(expectedObject.key)).resolves.toBeUndefined();
  });
});

describe("lecture des octets", () => {
  /**
   * La rétention de vingt-quatre heures peut avoir purgé l'objet avant que la
   * transcription ne s'exécute. Ce n'est pas une panne, et l'appelant doit
   * pouvoir le distinguer d'une erreur de stockage.
   */
  it("retourne null quand l'objet a été purgé", async () => {
    send.mockRejectedValueOnce(
      Object.assign(new Error("NoSuchKey"), { name: "NoSuchKey" }),
    );

    expect(await createStore().getBytes("captures/absent/audio.m4a")).toBeNull();
  });

  it("retourne les octets d'un objet présent", async () => {
    send.mockResolvedValueOnce({
      Body: { transformToByteArray: async () => new Uint8Array([1, 2, 3]) },
    });

    expect(await createStore().getBytes("captures/present/audio.m4a")).toEqual(
      new Uint8Array([1, 2, 3]),
    );
  });

  it("demande bien l'objet au bon seau", async () => {
    send.mockResolvedValueOnce({
      Body: { transformToByteArray: async () => new Uint8Array([1]) },
    });

    await createStore().getBytes("captures/present/audio.m4a");

    const [command] = send.mock.calls[0] as unknown as [GetObjectCommand];
    expect(command).toBeInstanceOf(GetObjectCommand);
    expect(command.input).toEqual({
      Bucket: "biume-audio",
      Key: "captures/present/audio.m4a",
    });
  });

  it("propage une panne de stockage plutôt que de la masquer", async () => {
    send.mockRejectedValueOnce(
      Object.assign(new Error("InternalError"), {
        name: "InternalError",
        $metadata: { httpStatusCode: 500 },
      }),
    );

    await expect(
      createStore().getBytes("captures/present/audio.m4a"),
    ).rejects.toThrow();
  });
});
