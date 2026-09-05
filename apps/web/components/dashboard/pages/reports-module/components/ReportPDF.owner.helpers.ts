import { Font } from "@react-pdf/renderer";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Palette du compte rendu propriétaire — alignée sur
 * `packages/ui/src/styles/product.css` : le document que reçoit le
 * propriétaire doit ressembler à l'application qui l'a produit.
 */
export const ownerPalette = {
  paper: "#FFFFFF",
  ink: "#020617",
  body: "#475569",
  muted: "#64748B",
  line: "#E2E8F0",
  lineStrong: "#CBD5E1",
  surface: "#F9FAFB",
  action: "#6A52D6",
} as const;

export type OwnerSeverityTone = {
  label: string;
  surface: string;
  ink: string;
  border: string;
  /** couleur pleine, utilisée pour la jauge et le tracé anatomique */
  solid: string;
};

/**
 * Sévérité en mots (vocabulaire de `ReportPreview.tsx`), index = severity 0..5.
 * « Priorité 4 » est un repère de praticien : le propriétaire lit « Sévère ».
 */
const ownerSeverityTones: OwnerSeverityTone[] = [
  {
    label: "Non renseignée",
    surface: "#F8FAFC",
    ink: "#475569",
    border: "#CBD5E1",
    solid: "#CBD5E1",
  },
  {
    label: "Légère",
    surface: "#ECFDF5",
    ink: "#047857",
    border: "#A7F3D0",
    solid: "#047857",
  },
  {
    label: "Modérée",
    surface: "#ECFDF5",
    ink: "#047857",
    border: "#A7F3D0",
    solid: "#047857",
  },
  {
    label: "Importante",
    surface: "#FFFBEB",
    ink: "#B45309",
    border: "#FDE68A",
    solid: "#B45309",
  },
  {
    label: "Sévère",
    surface: "#FEF2F2",
    ink: "#B91C1C",
    border: "#FECACA",
    solid: "#B91C1C",
  },
  {
    label: "Très marquée",
    surface: "#FEF2F2",
    ink: "#B91C1C",
    border: "#FECACA",
    solid: "#B91C1C",
  },
];

export function getOwnerSeverityTone(
  severity?: number | null,
): OwnerSeverityTone {
  return (
    ownerSeverityTones[getOwnerSeverityLevel(severity)] ?? ownerSeverityTones[0]
  );
}

export function getOwnerSeverityLevel(severity?: number | null): number {
  return Math.max(0, Math.min(5, Math.round(severity ?? 0)));
}

/** « côté gauche » / « côté droit » / « des deux côtés », pas « Lateralite: Bilateral » */
export function getOwnerSideLabel(laterality?: string | null): string {
  if (laterality === "left") return "côté gauche";
  if (laterality === "right") return "côté droit";
  if (laterality === "bilateral") return "des deux côtés";
  return "";
}

export const OWNER_FONT_FAMILY = "HankenGrotesk";

const OWNER_FONT_FACES = [
  { file: "HankenGrotesk-Regular.ttf", fontWeight: 400 },
  { file: "HankenGrotesk-Medium.ttf", fontWeight: 500 },
  { file: "HankenGrotesk-SemiBold.ttf", fontWeight: 600 },
  { file: "HankenGrotesk-Bold.ttf", fontWeight: 700 },
] as const;

let fontsRegistered = false;
let fontsAvailable = false;

/**
 * Hanken Grotesk depuis `public/fonts` — la famille de l'application, en
 * `.ttf` statique parce que fontkit ne lit ni le `woff2` ni l'axe de graisse
 * d'un fichier variable.
 *
 * Un fichier manquant ne remonte qu'au rendu, sous la forme d'une erreur de
 * lecture opaque : on vérifie donc le disque avant d'enregistrer quoi que ce
 * soit, et on retombe sur Helvetica. Le document sort moins beau, mais il sort.
 */
export function registerOwnerFonts(): string {
  if (fontsRegistered) return fontsAvailable ? OWNER_FONT_FAMILY : "Helvetica";
  fontsRegistered = true;

  const fonts = OWNER_FONT_FACES.map((face) => ({
    src: fontSource(face.file),
    fontWeight: face.fontWeight,
  }));

  if (fonts.some((font) => font.src === null)) return "Helvetica";

  try {
    Font.register({
      family: OWNER_FONT_FAMILY,
      fonts: fonts as { src: string; fontWeight: number }[],
    });
    // pas de césure sur un document destiné au propriétaire
    Font.registerHyphenationCallback((word) => [word]);
    fontsAvailable = true;
  } catch {
    fontsAvailable = false;
  }

  return fontsAvailable ? OWNER_FONT_FAMILY : "Helvetica";
}

/**
 * Même résolution que les illustrations anatomiques de `ReportPDF.owner.tsx` :
 * `import.meta.url` désignerait le chunk `.next/server/` du module bundlé,
 * jamais le fichier source.
 */
function fontSource(file: string): string | null {
  if (typeof window !== "undefined") return `/fonts/${file}`;

  const path = join(process.cwd(), "public", "fonts", file);
  return existsSync(path) ? path : null;
}
