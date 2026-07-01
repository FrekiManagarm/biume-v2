import {
  generateReactHelpers,
  generateUploadDropzone,
} from "@uploadthing/react";

type OurFileRouter = Record<string, never>;

export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const { uploadFiles, useUploadThing } =
  generateReactHelpers<OurFileRouter>();
