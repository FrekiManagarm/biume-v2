import { auth } from "@biume/auth";
import { env } from "@biume/env/server";
import {
  createRouteHandler,
  createUploadthing,
  type FileRouter,
  UploadThingError,
} from "uploadthing/server";

const f = createUploadthing();

async function requireUser(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    throw new UploadThingError("Unauthorized");
  }

  return { userId: session.user.id };
}

export const uploadRouter = {
  organizationLogoUploader: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "2MB",
    },
  })
    .middleware(async ({ req }) => requireUser(req))
    .onUploadComplete(async ({ file, metadata }) => ({
      uploadedBy: metadata.userId,
      url: file.ufsUrl,
    })),
  medicalDocumentsUploader: f({
    image: {
      maxFileCount: 10,
      maxFileSize: "16MB",
    },
    pdf: {
      maxFileCount: 10,
      maxFileSize: "16MB",
    },
    video: {
      maxFileCount: 3,
      maxFileSize: "128MB",
    },
  })
    .middleware(async ({ req }) => requireUser(req))
    .onUploadComplete(async ({ file, metadata }) => ({
      uploadedBy: metadata.userId,
      url: file.ufsUrl,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

export const uploadThingHandler = createRouteHandler({
  router: uploadRouter,
  config: {
    token: env.UPLOADTHING_TOKEN,
  },
});
