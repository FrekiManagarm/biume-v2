import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  // `pg` charge des binaires natifs et `@react-pdf/renderer` embarque fontkit :
  // les laisser hors du bundle serveur évite des échecs de build opaques dès
  // que l'API mobile touche la base (tâche 4) et que le PDF passe côté serveur
  // (lot D).
  serverExternalPackages: ["pg", "@react-pdf/renderer"],
};

export default nextConfig;
