import {
  generateReactHelpers,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "#/server/uploadthing";

const uploadThingOptions = {
  url: "/api/uploadthing",
};

export const UploadDropzone =
  generateUploadDropzone<OurFileRouter>(uploadThingOptions);
export const { uploadFiles, useUploadThing } =
  generateReactHelpers<OurFileRouter>(uploadThingOptions);
