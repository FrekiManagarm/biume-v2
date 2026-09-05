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
  // `ReportPDF.tsx` lit ses illustrations sur disque via `process.cwd()`
  // (voir ce fichier) avec un chemin construit à l'exécution — le traçage de
  // fichiers de Vercel ne peut pas le déduire par analyse statique. On force
  // donc l'inclusion du dossier d'images dans la fonction qui rend le PDF.
  outputFileTracingIncludes: {
    "/api/reports/[id]/pdf": ["./public/assets/images/**"],
  },
};

export default nextConfig;
