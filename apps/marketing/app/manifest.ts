import type { MetadataRoute } from "next";

import { siteName } from "../lib/seo";

// Les icones existaient deja dans public/ sans qu'aucun manifest ne les declare.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — compte rendu pour ostéopathe animalier`,
    short_name: siteName,
    description:
      "Le compte rendu propriétaire et le suivi post-séance des ostéopathes animaliers.",
    start_url: "/",
    display: "browser",
    lang: "fr-FR",
    background_color: "#f7f6f2",
    theme_color: "#f7f6f2",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
