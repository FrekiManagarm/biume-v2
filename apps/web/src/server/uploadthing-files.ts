export type UploadThingDeleteFiles = (
  keys: string[],
) => Promise<{ success: boolean; deletedCount: number }>;

const uploadThingHosts = new Set(["uploadthing.com", "utfs.io", "ufs.sh"]);

export function getUploadThingFileKey(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    const hostname = url.hostname.toLowerCase();
    const isUploadThingHost =
      uploadThingHosts.has(hostname) || hostname.endsWith(".ufs.sh");

    if (!isUploadThingHost) return null;

    const segments = url.pathname.split("/").filter(Boolean);
    const encodedKey =
      segments.length === 2 && segments[0] === "f"
        ? segments[1]
        : segments.length === 3 && segments[0] === "a"
          ? segments[2]
          : null;

    if (!encodedKey) return null;

    const key = decodeURIComponent(encodedKey);
    return key.length > 0 && !key.includes("/") ? key : null;
  } catch {
    return null;
  }
}

export async function deleteUploadThingFiles(
  fileUrls: readonly string[],
  deleteFiles: UploadThingDeleteFiles = deleteFilesWithUploadThing,
) {
  const keys = Array.from(
    new Set(
      fileUrls
        .map(getUploadThingFileKey)
        .filter((key): key is string => key !== null),
    ),
  );

  if (keys.length === 0) return { success: true, deletedCount: 0 };

  const result = await deleteFiles(keys);
  if (!result.success) {
    throw new Error("La suppression des fichiers UploadThing a échoué.");
  }

  return result;
}

export async function deleteRecordWithUploadThingFiles<T>({
  deleteFiles,
  deleteRecord,
  fileUrls,
}: {
  deleteFiles?: UploadThingDeleteFiles;
  deleteRecord: () => Promise<T>;
  fileUrls: readonly string[];
}) {
  await deleteUploadThingFiles(fileUrls, deleteFiles);
  return deleteRecord();
}

async function deleteFilesWithUploadThing(keys: string[]) {
  const [{ env }, { UTApi }] = await Promise.all([
    import("@biume/env/server"),
    import("uploadthing/server"),
  ]);
  const uploadThing = new UTApi({ token: env.UPLOADTHING_TOKEN });

  return uploadThing.deleteFiles(keys);
}
