import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/seo";

// Ces quatre chemins n'existent pas dans ce site vitrine (ils vivent sur
// app.biume.com) : le disallow est un garde-fou pour le jour où le déploiement
// ou le domaine changerait, pas la trace d'une route locale. Verrouillé par
// __tests__/seo.test.tsx. /after-dark reste crawlable mais se retire de
// l'index via son propre `robots: { index: false }`, pas via ce disallow.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/signin", "/signup", "/api"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
