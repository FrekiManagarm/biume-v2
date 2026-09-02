import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

// Anciens slugs d'articles dont les accents avaient ete supprimes ("grce",
// "sant", "lia"). Ils ont ete indexes tels quels : la redirection permanente
// preserve leur historique vers les slugs propres.
const legacyBlogSlugRedirects = [
  {
    source:
      "/blog/gagner-1h-par-jour-grce-un-module-de-rapport-le-secret-des-pros-de-la-sant-animale-intelligent",
    destination: "/blog/gagner-une-heure-par-jour-module-rapport",
    permanent: true,
  },
  {
    source:
      "/blog/pourquoi-les-professionnels-de-la-sant-animale-doivent-adopter-lia-maintenant-et-pas-dans-5-ans",
    destination: "/blog/adopter-ia-sante-animale",
    permanent: true,
  },
] as const;

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  images: {
    qualities: [55, 65, 75],
  },
  async redirects() {
    return [...legacyBlogSlugRedirects];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
