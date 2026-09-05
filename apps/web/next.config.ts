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
  // `ReportPDF.owner.tsx` lit ses illustrations et ses polices sur disque via
  // `process.cwd()` avec un chemin construit à l'exécution — le traçage de
  // fichiers de Vercel ne peut pas le déduire par analyse statique. On force
  // donc l'inclusion de ces deux dossiers dans les fonctions qui rendent le
  // PDF : la route de téléchargement, et la page d'où part l'envoi par email
  // (`sendNewReportClientEmailWithPDF`). Sans les polices, le document sort
  // en Helvetica sans que rien ne le signale.
  outputFileTracingIncludes: {
    "/api/reports/[id]/pdf": [
      "./public/assets/images/**",
      "./public/fonts/HankenGrotesk-*.ttf",
    ],
    "/dashboard/reports": [
      "./public/assets/images/**",
      "./public/fonts/HankenGrotesk-*.ttf",
    ],
  },
};

export default nextConfig;
