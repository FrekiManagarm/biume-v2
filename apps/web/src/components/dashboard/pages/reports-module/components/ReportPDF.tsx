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

import {
  buildReportPdfViewModel,
  getIssueTypeLabel,
  getLateralityLabel,
  getSeverityTone,
  reportPalette,
  type ReportMetric,
  type ReportPdfIssue,
  type ReportPdfRecommendation,
  type ReportPdfReport,
  type ReportMetricTone,
} from "./ReportPDF.helpers";

const metricToneStyles: Record<ReportMetricTone, { color: string; soft: string }> = {
  accent: { color: reportPalette.accent, soft: reportPalette.accentSoft },
  forest: { color: reportPalette.forest, soft: reportPalette.forestSoft },
  ink: { color: reportPalette.ink, soft: reportPalette.faint },
  sand: { color: reportPalette.sand, soft: reportPalette.sandSoft },
};

function ensurePdfBufferRuntime() {
  globalThis.Buffer ??= BrowserBuffer;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: reportPalette.paper,
    color: reportPalette.ink,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.45,
    paddingBottom: 56,
    paddingHorizontal: 38,
    paddingTop: 34,
  },
  pageWash: {
    paddingBottom: 2,
  },
  topBar: {
    alignItems: "center",
    borderBottomColor: reportPalette.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
    paddingBottom: 12,
  },
  brandBlock: {
    flexDirection: "row",
  },
  brandMark: {
    backgroundColor: reportPalette.ink,
    borderRadius: 6,
    height: 28,
    marginRight: 9,
    width: 28,
  },
  brandInitial: {
    color: reportPalette.surface,
    fontSize: 13,
    fontWeight: 700,
    paddingTop: 6,
    textAlign: "center",
  },
  brandName: {
    color: reportPalette.ink,
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: 0.3,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  brandMeta: {
    color: reportPalette.muted,
    fontSize: 9,
  },
  logo: {
    height: 28,
    objectFit: "contain",
    width: 64,
  },
  hero: {
    flexDirection: "row",
    marginBottom: 20,
  },
  heroCopy: {
    paddingRight: 22,
    width: "68%",
  },
  eyebrow: {
    color: reportPalette.accent,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.7,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  title: {
    color: reportPalette.ink,
    fontSize: 21,
    fontWeight: 700,
    letterSpacing: -0.25,
    lineHeight: 1.15,
    marginBottom: 8,
  },
  lead: {
    color: reportPalette.muted,
    fontSize: 10,
    lineHeight: 1.5,
    maxWidth: 330,
  },
  heroRail: {
    borderLeftColor: reportPalette.line,
    borderLeftWidth: 1,
    paddingLeft: 14,
    paddingTop: 2,
    width: "32%",
  },
  railLabel: {
    color: reportPalette.muted,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.55,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  railValue: {
    color: reportPalette.ink,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 10,
  },
  railSmall: {
    color: reportPalette.muted,
    fontSize: 8.5,
    lineHeight: 1.35,
    marginBottom: 9,
  },
  metricStrip: {
    borderBottomColor: reportPalette.line,
    borderBottomWidth: 1,
    borderTopColor: reportPalette.line,
    borderTopWidth: 1,
    flexDirection: "row",
    marginBottom: 20,
    paddingVertical: 10,
  },
  metric: {
    borderRightColor: reportPalette.faint,
    borderRightWidth: 1,
    paddingLeft: 11,
    paddingRight: 10,
    width: "25%",
  },
  metricLast: {
    borderRightWidth: 0,
  },
  metricNumberWrap: {
    marginBottom: 3,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
  },
  metricLabel: {
    color: reportPalette.muted,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  identityGrid: {
    borderBottomColor: reportPalette.line,
    borderBottomWidth: 1,
    borderTopColor: reportPalette.line,
    borderTopWidth: 1,
    flexDirection: "row",
    marginBottom: 20,
    paddingBottom: 14,
    paddingTop: 14,
  },
  identityMain: {
    paddingRight: 18,
    width: "60%",
  },
  identitySide: {
    borderLeftColor: reportPalette.line,
    borderLeftWidth: 1,
    paddingLeft: 16,
    width: "40%",
  },
  sectionKicker: {
    color: reportPalette.accent,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.6,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  patientName: {
    color: reportPalette.ink,
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  mutedText: {
    color: reportPalette.muted,
    fontSize: 10,
    lineHeight: 1.45,
  },
  reasonBox: {
    backgroundColor: reportPalette.faint,
    borderColor: reportPalette.line,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  reasonText: {
    color: reportPalette.ink,
    fontSize: 10,
    lineHeight: 1.45,
  },
  infoRow: {
    borderTopColor: reportPalette.faint,
    borderTopWidth: 1,
    paddingVertical: 6,
  },
  infoLabel: {
    color: reportPalette.muted,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.7,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  infoValue: {
    color: reportPalette.ink,
    fontSize: 9.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  sectionTitle: {
    color: reportPalette.ink,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: -0.2,
  },
  sectionCaption: {
    color: reportPalette.muted,
    fontSize: 8,
  },
  anatomyGrid: {
    flexDirection: "row",
  },
  anatomyPanel: {
    width: "50%",
  },
  anatomyPanelLeft: {
    paddingRight: 8,
  },
  anatomyPanelRight: {
    paddingLeft: 8,
  },
  anatomyFrame: {
    backgroundColor: reportPalette.faint,
    borderColor: reportPalette.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 190,
    marginBottom: 6,
    overflow: "hidden",
    padding: 7,
    position: "relative",
  },
  anatomyImage: {
    height: "100%",
    objectFit: "contain",
    width: "100%",
  },
  anatomyLabel: {
    color: reportPalette.muted,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  issueRow: {
    borderTopColor: reportPalette.line,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingVertical: 9,
  },
  issueIndex: {
    color: reportPalette.muted,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.7,
    paddingTop: 2,
    width: 30,
  },
  issueBody: {
    paddingRight: 12,
    width: "68%",
  },
  issueMetaColumn: {
    width: "23%",
  },
  issueTitleLine: {
    flexDirection: "row",
    marginBottom: 4,
  },
  issueTitle: {
    color: reportPalette.ink,
    fontSize: 10.5,
    fontWeight: 700,
    marginRight: 8,
  },
  badge: {
    borderRadius: 6,
    fontSize: 7.5,
    fontWeight: 700,
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    textTransform: "uppercase",
  },
  issueDescription: {
    color: reportPalette.muted,
    fontSize: 9,
    lineHeight: 1.45,
  },
  severityPill: {
    borderRadius: 6,
    fontSize: 7.5,
    fontWeight: 700,
    marginBottom: 5,
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    textAlign: "center",
  },
  issueTinyMeta: {
    color: reportPalette.muted,
    fontSize: 8,
    lineHeight: 1.35,
  },
  recommendationRow: {
    borderTopColor: reportPalette.line,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingVertical: 9,
  },
  recommendationMarker: {
    backgroundColor: reportPalette.accent,
    borderRadius: 3,
    height: 12,
    marginRight: 10,
    marginTop: 1,
    width: 3,
  },
  recommendationText: {
    color: reportPalette.ink,
    flex: 1,
    fontSize: 10,
    lineHeight: 1.45,
  },
  notePanel: {
    backgroundColor: reportPalette.faint,
    borderColor: reportPalette.line,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  emptyState: {
    alignItems: "center",
    borderColor: reportPalette.line,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  emptyTitle: {
    color: reportPalette.ink,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
    textAlign: "center",
  },
  emptyText: {
    color: reportPalette.muted,
    fontSize: 9.5,
    lineHeight: 1.45,
    textAlign: "center",
  },
  footerLeft: {
    bottom: 28,
    left: 38,
    position: "absolute",
    color: reportPalette.muted,
    fontSize: 8,
  },
});

type ReportPDFProps = {
  report: ReportPdfReport;
  type: "advanced_report";
};

function formatReportDate(date: Date | string | null) {
  if (!date) return "Date inconnue";
  return format(new Date(date), "dd MMMM yyyy", { locale: fr });
}

function formatGeneratedAt(date: Date | string | null) {
  if (!date) return "Date inconnue";
  return format(new Date(date), "dd MMMM yyyy 'a' HH:mm", { locale: fr });
}

function getAnimalImage(kind: "cat" | "dog" | "horse", side: "left" | "right") {
  const assetPath =
    kind === "horse"
      ? `/assets/images/horse-${side}-side.png`
      : `/assets/images/${kind}-${side}-side.jpg`;

  if (typeof window !== "undefined") return assetPath;

  return new URL(`../../../../../../public${assetPath}`, import.meta.url)
    .pathname;
}

function MetricBlock({
  isLast,
  metric,
}: {
  isLast: boolean;
  metric: ReportMetric;
}) {
  const tone = metricToneStyles[metric.tone];

  return (
    <View style={isLast ? [styles.metric, styles.metricLast] : styles.metric}>
      <View style={styles.metricNumberWrap}>
        <Text style={[styles.metricNumber, { color: tone.color }]}>
          {metric.value}
        </Text>
      </View>
      <Text style={styles.metricLabel}>{metric.label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SectionHeader({
  caption,
  title,
}: {
  caption?: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
    </View>
  );
}

function EmptyState({
  body,
  title,
}: {
  body: string;
  title: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{body}</Text>
    </View>
  );
}

function AnatomicalOverlay({
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
      style={{ left: 8, position: "absolute", top: 8 }}
      viewBox="0 0 500 380"
      width="100%"
    >
      {issues.map((issue, index) => {
        const anatomicalPart = issue.anatomicalPart;
        const path =
          side === "left" ? anatomicalPart?.pathLeft : anatomicalPart?.pathRight;
        const transform =
          side === "left"
            ? anatomicalPart?.transformLeft
            : anatomicalPart?.transformRight;
        const tone = getSeverityTone(issue.severity);

        if (!path) return null;

        return (
          <G key={issue.id || `${side}-${index}`}>
            <Path
              d={path}
              fill={tone.fill}
              fillOpacity={0.42}
              stroke={tone.stroke}
              strokeOpacity={0.78}
              strokeWidth="2"
              transform={transform || undefined}
            />
          </G>
        );
      })}
    </Svg>
  );
}

function AnatomicalPanel({
  image,
  issues,
  label,
  side,
}: {
  image: string;
  issues: ReportPdfIssue[];
  label: string;
  side: "left" | "right";
}) {
  return (
    <View
      style={[
        styles.anatomyPanel,
        side === "left" ? styles.anatomyPanelLeft : styles.anatomyPanelRight,
      ]}
    >
      <View style={styles.anatomyFrame}>
        <Image src={image} style={styles.anatomyImage} />
        <AnatomicalOverlay issues={issues} side={side} />
      </View>
      <Text style={styles.anatomyLabel}>{label}</Text>
    </View>
  );
}

function IssueRow({ issue, index }: { issue: ReportPdfIssue; index: number }) {
  const severity = getSeverityTone(issue.severity);
  const anatomicalName =
    issue.anatomicalPart?.name || issue.anatomicalPartId || "Zone anatomique";

  return (
    <View style={styles.issueRow} wrap={false}>
      <Text style={styles.issueIndex}>{String(index + 1).padStart(2, "0")}</Text>
      <View style={styles.issueBody}>
        <View style={styles.issueTitleLine}>
          <Text style={styles.issueTitle}>{anatomicalName}</Text>
          <Text
            style={[
              styles.badge,
              { backgroundColor: severity.soft, color: severity.fill },
            ]}
          >
            {getIssueTypeLabel(issue.type)}
          </Text>
        </View>
        <Text style={styles.issueDescription}>
          {issue.notes?.trim() || "Aucune note clinique precisee pour ce point."}
        </Text>
      </View>
      <View style={styles.issueMetaColumn}>
        <Text
          style={[
            styles.severityPill,
            { backgroundColor: severity.soft, color: severity.fill },
          ]}
        >
          {severity.label}
        </Text>
        <Text style={styles.issueTinyMeta}>
          Lateralite: {getLateralityLabel(issue.laterality)}
        </Text>
      </View>
    </View>
  );
}

function RecommendationRow({
  index,
  recommendation,
}: {
  index: number;
  recommendation: ReportPdfRecommendation;
}) {
  return (
    <View style={styles.recommendationRow} wrap={false}>
      <View style={styles.recommendationMarker} />
      <Text style={styles.recommendationText}>
        {index + 1}.{" "}
        {recommendation.recommendation?.trim() ||
          recommendation.description?.trim() ||
          "Recommandation a completer."}
      </Text>
    </View>
  );
}

export function ReportPDF(props: ReportPDFProps) {
  ensurePdfBufferRuntime();

  const model = buildReportPdfViewModel(props.report);
  const issues = model.issues;
  const recommendations = model.recommendations;
  const leftImage = getAnimalImage(model.animalKind, "left");
  const rightImage = getAnimalImage(model.animalKind, "right");
  const generatedAt = formatGeneratedAt(new Date());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.pageWash}>
          <View style={styles.topBar}>
            <View style={styles.brandBlock}>
              <View style={styles.brandMark}>
                <Text style={styles.brandInitial}>B</Text>
              </View>
              <View>
                <Text style={styles.brandName}>{model.organizationName}</Text>
                <Text style={styles.brandMeta}>Compte rendu proprietaire</Text>
              </View>
            </View>
            {props.report.organization?.logo ? (
              <Image src={props.report.organization.logo} style={styles.logo} />
            ) : (
              <Text style={styles.brandMeta}>Biume</Text>
            )}
          </View>

          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Rapport clinique</Text>
              <Text style={styles.title}>{model.reportTitle}</Text>
              <Text style={styles.lead}>
                Synthese claire de la seance, des points anatomiques observes et
                des recommandations a suivre apres consultation.
              </Text>
            </View>

            <View style={styles.heroRail}>
              <Text style={styles.railLabel}>Patient</Text>
              <Text style={styles.railValue}>{model.patientName}</Text>
              <Text style={styles.railLabel}>Date</Text>
              <Text style={styles.railSmall}>
                {formatReportDate(props.report.createdAt)}
              </Text>
              <Text style={styles.railLabel}>Dossier</Text>
              <Text style={styles.railSmall}>{props.report.id}</Text>
            </View>
          </View>

          <View style={styles.metricStrip}>
            {model.metrics.map((metric, index) => (
              <MetricBlock
                isLast={index === model.metrics.length - 1}
                key={metric.label}
                metric={metric}
              />
            ))}
          </View>

          <View style={styles.identityGrid} wrap={false}>
            <View style={styles.identityMain}>
              <Text style={styles.sectionKicker}>Contexte animal</Text>
              <Text style={styles.patientName}>{model.patientName}</Text>
              <Text style={styles.mutedText}>{model.patientDescriptor}</Text>
              <View style={styles.reasonBox}>
                <Text style={styles.sectionKicker}>Motif</Text>
                <Text style={styles.reasonText}>{model.consultationReason}</Text>
              </View>
            </View>

            <View style={styles.identitySide}>
              <InfoRow label="Proprietaire" value={model.ownerLine} />
              <InfoRow label="Profil" value={model.patientFacts} />
              <InfoRow label="Cabinet" value={model.organizationName} />
            </View>
          </View>

          {props.type === "advanced_report" ? (
            <View style={styles.section} wrap={false}>
              <SectionHeader
                caption="Visualisation des zones marquees"
                title="Cartographie anatomique"
              />
              <View style={styles.anatomyGrid}>
                <AnatomicalPanel
                  image={leftImage}
                  issues={issues}
                  label="Vue laterale gauche"
                  side="left"
                />
                <AnatomicalPanel
                  image={rightImage}
                  issues={issues}
                  label="Vue laterale droite"
                  side="right"
                />
              </View>
            </View>
          ) : null}

          <View style={styles.section} wrap={issues.length > 4}>
            <SectionHeader
              caption={`${issues.length} point${issues.length > 1 ? "s" : ""}`}
              title="Observations"
            />
            {issues.length > 0 ? (
              issues.map((issue, index) => (
                <IssueRow index={index} issue={issue} key={issue.id || index} />
              ))
            ) : (
              <EmptyState
                body="Le rapport ne contient pas encore de point anatomique detaille."
                title="Aucune observation anatomique"
              />
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              caption={`${recommendations.length} element${
                recommendations.length > 1 ? "s" : ""
              }`}
              title="Recommandations"
            />
            {recommendations.length > 0 ? (
              recommendations.map((recommendation, index) => (
                <RecommendationRow
                  index={index}
                  key={recommendation.id || index}
                  recommendation={recommendation}
                />
              ))
            ) : (
              <EmptyState
                body="Ajoutez les consignes de repos, de reprise d'activite ou de suivi avant l'envoi."
                title="Aucune recommandation"
              />
            )}
          </View>

          {model.practitionerNotes ? (
            <View style={styles.section}>
              <SectionHeader title="Notes de seance" />
              <View style={styles.notePanel}>
                <Text style={styles.reasonText}>{model.practitionerNotes}</Text>
              </View>
            </View>
          ) : null}

        </View>

        <Text fixed style={styles.footerLeft}>
          Genere le {generatedAt} avec Biume
        </Text>
      </Page>
    </Document>
  );
}
