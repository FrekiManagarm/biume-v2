import type { Metadata, Viewport } from "next";

import "../styles.css";

export const metadata: Metadata = {
  title: "Biume",
  description:
    "Biume centralise le suivi des propriétaires, rendez-vous et rapports vétérinaires.",
  // L'application ne doit jamais apparaître dans les résultats de recherche :
  // toute l'acquisition passe par biume.com.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
