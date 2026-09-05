import {
  Document,
  G,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { Buffer as BrowserBuffer } from "buffer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { join } from "node:path";

import {
  buildReportPdfViewModel,
  type ReportPdfIssue,
  type ReportPdfReport,
} from "./ReportPDF.helpers";
import {
  getOwnerSeverityLevel,
  getOwnerSeverityTone,
  getOwnerSideLabel,
  ownerPalette as C,
  registerOwnerFonts,
} from "./ReportPDF.owner.helpers";

const FONT = registerOwnerFonts();

function ensurePdfBufferRuntime() {
  globalThis.Buffer ??= BrowserBuffer;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.paper,
    color: C.ink,
    fontFamily: FONT,
    fontSize: 11,
    lineHeight: 1.55,
    paddingBottom: 62,
    paddingHorizontal: 46,
    paddingTop: 38,
  },

  /* en-têtes */
  topBar: {
    alignItems: "center",
    borderBottomColor: C.lineStrong,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  brandBlock: { alignItems: "center", flexDirection: "row" },
  brandMark: {
    backgroundColor: C.action,
    borderRadius: 6,
    height: 20,
    marginRight: 8,
    width: 20,
  },
  brandInitial: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.75,
    textAlign: "center",
  },
  brandName: { color: C.ink, fontSize: 10, fontWeight: 600 },
  topMeta: { color: C.muted, fontSize: 9 },
  topMetaStrong: { color: C.body, fontSize: 9, fontWeight: 600 },
  logo: { height: 20, objectFit: "contain", width: 56 },

  /* accroche page 1 */
  hero: { paddingTop: 34 },
  eyebrow: {
    color: C.action,
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  title: {
    color: C.ink,
    fontSize: 27,
    fontWeight: 600,
    letterSpacing: -0.4,
    lineHeight: 1.1,
    marginBottom: 8,
  },
  subtitle: { color: C.body, fontSize: 12 },

  reasonCard: {
    borderColor: C.lineStrong,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 26,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  cardKicker: {
    color: C.muted,
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  reasonText: { color: C.ink, fontSize: 12, lineHeight: 1.6 },

  /* sections */
  sectionHead: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: {
    color: C.ink,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: -0.2,
  },
  sectionCount: { color: C.muted, fontSize: 9 },
  sectionLead: { color: C.muted, fontSize: 10, marginBottom: 12 },

  /* conseils */
  adviceRow: {
    borderTopColor: C.line,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingVertical: 11,
  },
  adviceNum: {
    color: C.action,
    fontSize: 10,
    fontWeight: 700,
    paddingTop: 1,
    width: 26,
  },
  adviceText: { color: C.ink, flex: 1, fontSize: 11.5, lineHeight: 1.6 },

  /* points observés */
  pointRow: {
    alignItems: "flex-start",
    borderTopColor: C.line,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingVertical: 9,
  },
  pointBody: { flex: 1, paddingRight: 16 },
  pointRegion: {
    color: C.ink,
    fontSize: 11.5,
    fontWeight: 600,
    marginBottom: 3,
  },
  pointNotes: { color: C.body, fontSize: 10.5, lineHeight: 1.6 },
  pointMeta: { alignItems: "flex-start", width: 118 },
  severityPill: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 9,
    fontWeight: 600,
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  gauge: { flexDirection: "row", marginBottom: 6 },
  gaugeBar: { borderRadius: 2, height: 4, marginRight: 2, width: 11 },
  pointSide: { color: C.muted, fontSize: 9.5 },

  /* cartographie */
  mapGrid: { flexDirection: "row", marginTop: 18 },
  mapCell: { width: "50%" },
  mapCellLeft: { paddingRight: 7 },
  mapCellRight: { paddingLeft: 7 },
  mapFrame: {
    alignSelf: "center",
    backgroundColor: C.surface,
    borderColor: C.lineStrong,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    padding: 8,
  },
  mapStage: { flex: 1, position: "relative" },
  mapImage: { height: "100%", objectFit: "contain", width: "100%" },
  mapLabel: {
    color: C.muted,
    fontSize: 9,
    marginTop: 6,
    textAlign: "center",
  },

  /* notes */
  notesCard: {
    backgroundColor: C.surface,
    borderColor: C.line,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  notesText: { color: C.ink, fontSize: 11, lineHeight: 1.6 },

  /* pied de page */
  footer: {
    alignItems: "flex-end",
    borderTopColor: C.line,
    borderTopWidth: 1,
    bottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 46,
    paddingTop: 12,
    position: "absolute",
    right: 46,
  },
  // sans `flex`, le bloc de gauche prend toute la ligne et ne laisse aucune
  // largeur au numéro de page.
  footerText: {
    color: C.muted,
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.5,
    paddingRight: 16,
  },
  footerPageSlot: { width: 48 },
  // `lineHeight` explicite : voir `Footer` — hérité de la `Page`, il fait
  // disparaître le numéro de page.
  footerPage: {
    color: C.body,
    fontSize: 8.5,
    fontWeight: 600,
    lineHeight: 1.5,
    textAlign: "right",
  },

  empty: {
    borderColor: C.lineStrong,
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emptyText: { color: C.muted, fontSize: 10.5, lineHeight: 1.55 },
});

type OwnerReportPDFProps = {
  report: ReportPdfReport;
  /** "advanced_report" ajoute la cartographie anatomique */
  type: "advanced_report" | "report";
};

function formatLongDate(date: Date | string | null) {
  if (!date) return "date inconnue";
  return format(new Date(date), "d MMMM yyyy", { locale: fr });
}

/**
 * Le calque anatomique est tracé dans un `viewBox` 0 0 500 380 centré sur
 * l'illustration (`AnatomicalVisualization.tsx`). Il ne tombe juste que si
 * l'image et le calque occupent la même boîte : on donne donc au cadre le
 * rapport d'aspect du fichier plutôt qu'une hauteur fixe, sinon `objectFit:
 * contain` rétrécit l'image dans son coin pendant que le SVG, lui, s'étale.
 */
const MAP_STAGE_HEIGHT = 140;
/** padding (8) + bordure (1), des deux côtés */
const MAP_FRAME_INSET = 18;

/** dimensions des fichiers de `public/assets/images` */
const MAP_ASPECT_RATIOS: Record<"cat" | "dog" | "horse", number> = {
  cat: 4096 / 2731,
  dog: 1,
  horse: 6000 / 4000,
};

function getAnimalImage(kind: "cat" | "dog" | "horse", side: "left" | "right") {
  const assetPath =
    kind === "horse"
      ? `/assets/images/horse-${side}-side.png`
      : `/assets/images/${kind}-${side}-side.jpg`;

  if (typeof window !== "undefined") return assetPath;

  // `import.meta.url` désignerait le chunk `.next/server/` de ce composant une
  // fois bundlé par Next, pas le fichier source : le chemin résolu ne
  // pointerait nulle part. `process.cwd()` reste stable côté serveur, dev
  // comme production, et pointe vers la racine de l'app Next où vit `public/`.
  return join(process.cwd(), "public", assetPath);
}

function SectionHead({
  count,
  lead,
  title,
}: {
  count?: string;
  lead?: string;
  title: string;
}) {
  return (
    <View>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count ? <Text style={styles.sectionCount}>{count}</Text> : null}
      </View>
      {lead ? <Text style={styles.sectionLead}>{lead}</Text> : null}
    </View>
  );
}

/**
 * Deux précautions pour le numéro de page, l'une et l'autre nécessaires avec
 * @react-pdf/renderer 4.5 dès que la `Page` porte un `lineHeight` :
 * le contenu dynamique passe par le `render` d'une `View` (celui d'un `Text`
 * ne mesure rien), et le `Text` qu'elle produit déclare son propre
 * `lineHeight` au lieu d'hériter celui de la page. Sans ça le numéro
 * disparaît du document, sans erreur ni trace.
 */
/**
 * `totalPages` est bien passé au `render` d'une `View`, mais son type ne
 * décrit que celui d'un `Text` (@react-pdf/renderer 4.5). Il manque aussi à
 * la première passe de mise en page, avant que le nombre de pages soit connu.
 */
type FooterRenderProps = { pageNumber: number; totalPages?: number };

function Footer({ left }: { left: string }) {
  return (
    <View fixed style={styles.footer}>
      <Text style={styles.footerText}>{left}</Text>
      <View
        fixed
        render={(props) => {
          const { pageNumber, totalPages } = props as FooterRenderProps;
          return (
            <Text style={styles.footerPage}>
              {totalPages ? `${pageNumber} / ${totalPages}` : `${pageNumber}`}
            </Text>
          );
        }}
        style={styles.footerPageSlot}
      />
    </View>
  );
}

function AdviceRow({ index, text }: { index: number; text: string }) {
  return (
    <View style={styles.adviceRow} wrap={false}>
      <Text style={styles.adviceNum}>{String(index + 1).padStart(2, "0")}</Text>
      <Text style={styles.adviceText}>{text}</Text>
    </View>
  );
}

function PointRow({
  issue,
  showGauge,
}: {
  issue: ReportPdfIssue;
  showGauge: boolean;
}) {
  const tone = getOwnerSeverityTone(issue.severity);
  const level = getOwnerSeverityLevel(issue.severity);
  const side = getOwnerSideLabel(issue.laterality);
  const region =
    issue.anatomicalPart?.name || issue.anatomicalPartId || "Zone non précisée";

  return (
    <View style={styles.pointRow} wrap={false}>
      <View style={styles.pointBody}>
        <Text style={styles.pointRegion}>{region}</Text>
        <Text style={styles.pointNotes}>{issue.notes}</Text>
      </View>
      <View style={styles.pointMeta}>
        <Text
          style={[
            styles.severityPill,
            {
              backgroundColor: tone.surface,
              borderColor: tone.border,
              color: tone.ink,
            },
          ]}
        >
          {tone.label}
        </Text>
        {showGauge ? (
          <View style={styles.gauge}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.gaugeBar,
                  { backgroundColor: i < level ? tone.solid : C.line },
                ]}
              />
            ))}
          </View>
        ) : null}
        {side ? <Text style={styles.pointSide}>{side}</Text> : null}
      </View>
    </View>
  );
}

function MapOverlay({
  issues,
  side,
}: {
  issues: ReportPdfIssue[];
  side: "left" | "right";
}) {
  if (issues.length === 0) return null;

  return (
    <Svg
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ left: 0, position: "absolute", top: 0 }}
      viewBox="0 0 500 380"
      width="100%"
    >
      {issues.map((issue, index) => {
        const part = issue.anatomicalPart;
        const path = side === "left" ? part?.pathLeft : part?.pathRight;
        const transform =
          side === "left" ? part?.transformLeft : part?.transformRight;
        if (!path) return null;

        const tone = getOwnerSeverityTone(issue.severity);
        return (
          <G key={issue.id || `${side}-${index}`}>
            <Path
              d={path}
              fill={tone.solid}
              fillOpacity={0.28}
              stroke={tone.solid}
              strokeOpacity={0.9}
              strokeWidth="2"
              transform={transform || undefined}
            />
          </G>
        );
      })}
    </Svg>
  );
}

function MapCell({
  aspectRatio,
  image,
  issues,
  label,
  side,
}: {
  aspectRatio: number;
  image: string;
  issues: ReportPdfIssue[];
  label: string;
  side: "left" | "right";
}) {
  return (
    <View
      style={[
        styles.mapCell,
        side === "left" ? styles.mapCellLeft : styles.mapCellRight,
      ]}
    >
      <View
        style={[
          styles.mapFrame,
          {
            height: MAP_STAGE_HEIGHT + MAP_FRAME_INSET,
            width: MAP_STAGE_HEIGHT * aspectRatio + MAP_FRAME_INSET,
          },
        ]}
      >
        <View style={styles.mapStage}>
          <Image src={image} style={styles.mapImage} />
          <MapOverlay issues={issues} side={side} />
        </View>
      </View>
      <Text style={styles.mapLabel}>{label}</Text>
    </View>
  );
}

/**
 * Compte rendu destiné au propriétaire : deux pages A4, dans l'ordre où il se
 * pose les questions — pourquoi la séance, quoi faire maintenant, puis ce qui
 * a été observé et où. Les compteurs cliniques et les libellés de praticien
 * (« Priorité 4 », « Dysfonction ») n'apparaissent pas : ils ne lui apprennent
 * rien qu'il puisse utiliser.
 */
export function OwnerReportPDF(props: OwnerReportPDFProps) {
  ensurePdfBufferRuntime();

  const model = buildReportPdfViewModel(props.report);
  const { issues, recommendations } = model;

  const sessionDate = formatLongDate(props.report.createdAt);
  const ownerFirstLine = props.report.patient?.owner?.name?.trim();
  const orgContact = props.report.organization?.email?.trim();
  const showMap = props.type === "advanced_report";
  // jauge visuelle en plus du mot : utile dès qu'il y a plusieurs points à comparer
  const showGauge = issues.length > 2;

  const footerOne = [
    [model.organizationName, orgContact].filter(Boolean).join(" · "),
    `Généré le ${formatLongDate(new Date())} avec Biume`,
  ].join("\n");
  const footerTwo = [
    `Dossier ${props.report.id}`,
    "Une question ? Répondez au courriel de partage.",
  ].join("\n");

  return (
    <Document>
      {/* ── Page 1 : à qui, pourquoi, et quoi faire ─────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed>
          <View style={styles.brandBlock}>
            <View style={styles.brandMark}>
              <Text style={styles.brandInitial}>
                {model.organizationName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.brandName}>{model.organizationName}</Text>
          </View>
          {props.report.organization?.logo ? (
            <Image src={props.report.organization.logo} style={styles.logo} />
          ) : (
            <Text style={styles.topMeta}>
              Compte rendu de séance · {sessionDate}
            </Text>
          )}
        </View>

        <View style={styles.hero}>
          {ownerFirstLine ? (
            <Text style={styles.eyebrow}>Pour {ownerFirstLine}</Text>
          ) : null}
          <Text style={styles.title}>Compte rendu de {model.patientName}</Text>
          <Text style={styles.subtitle}>
            {[model.patientDescriptor, `Séance du ${sessionDate}`]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>

        <View style={styles.reasonCard} wrap={false}>
          <Text style={styles.cardKicker}>Motif de la séance</Text>
          <Text style={styles.reasonText}>{model.consultationReason}</Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <SectionHead
            count={`${recommendations.length} consigne${recommendations.length > 1 ? "s" : ""}`}
            lead="Ce qu'il y a à faire dans les jours qui viennent."
            title="Conseils après la séance"
          />
          {recommendations.length > 0 ? (
            recommendations.map((item, index) => (
              <AdviceRow
                index={index}
                key={item.id || index}
                text={
                  item.recommendation?.trim() ||
                  item.description?.trim() ||
                  "Consigne à compléter."
                }
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Aucune consigne n&apos;a été ajoutée à ce compte rendu.
                Contactez le cabinet si vous attendiez des recommandations de
                suivi.
              </Text>
            </View>
          )}
        </View>

        <Footer left={footerOne} />
      </Page>

      {/* ── Page 2 : ce qui a été observé, et où ────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed>
          <Text style={styles.topMetaStrong}>
            Compte rendu de {model.patientName}
          </Text>
          <Text style={styles.topMeta}>{model.organizationName}</Text>
        </View>

        <View style={{ paddingTop: 18 }}>
          <SectionHead
            count={`${issues.length} élément${issues.length > 1 ? "s" : ""} issu${issues.length > 1 ? "s" : ""} de la séance`}
            lead="Ce que le praticien a relevé, zone par zone."
            title="Points observés"
          />
          {issues.length > 0 ? (
            issues.map((issue, index) => (
              <PointRow
                issue={issue}
                key={issue.id || index}
                showGauge={showGauge}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Aucun point particulier n&apos;a été relevé pendant cette
                séance.
              </Text>
            </View>
          )}
        </View>

        {showMap && issues.length > 0 ? (
          <View wrap={false}>
            <View style={{ marginTop: 18 }}>
              <SectionHead
                lead="Les zones colorées reprennent la sévérité indiquée ci-dessus."
                title="Où se situent ces points"
              />
            </View>
            <View style={[styles.mapGrid, { marginTop: 0 }]}>
              <MapCell
                aspectRatio={MAP_ASPECT_RATIOS[model.animalKind]}
                image={getAnimalImage(model.animalKind, "left")}
                issues={issues}
                label="Côté gauche"
                side="left"
              />
              <MapCell
                aspectRatio={MAP_ASPECT_RATIOS[model.animalKind]}
                image={getAnimalImage(model.animalKind, "right")}
                issues={issues}
                label="Côté droit"
                side="right"
              />
            </View>
          </View>
        ) : null}

        {model.practitionerNotes ? (
          <View style={styles.notesCard} wrap={false}>
            <Text style={styles.cardKicker}>Informations complémentaires</Text>
            <Text style={styles.notesText}>{model.practitionerNotes}</Text>
          </View>
        ) : null}

        <Footer left={footerTwo} />
      </Page>
    </Document>
  );
}

export default OwnerReportPDF;
