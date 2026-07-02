import type {
  AdvancedReportRecommendations,
  AnatomicalIssue,
  Organization,
  Pet,
} from "@/lib/schemas";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
  G,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "column",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 3,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  reportInfo: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  anatomicalSection: {
    marginBottom: 30,
  },
  anatomicalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  anatomicalViews: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  anatomicalView: {
    width: "48%",
    alignItems: "center",
  },
  anatomicalImage: {
    width: "100%",
    height: 300,
    marginBottom: 10,
    border: "1px solid #E5E7EB",
    borderRadius: 8,
  },
  anatomicalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
  issuesList: {
    marginTop: 25,
  },
  issueItem: {
    flexDirection: "row",
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  issueIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    marginTop: 2,
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 1.4,
    marginBottom: 4,
  },
  issueMeta: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  issueBadge: {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 10,
  },
  issueBadgeSecondary: {
    backgroundColor: "#6B7280",
    color: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 10,
  },
  recommendationsSection: {
    marginTop: 30,
  },
  recommendationItem: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  recommendationIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    marginTop: 2,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 3,
  },
  recommendationText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerLeft: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  footerRight: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  pageNumber: {
    position: "absolute",
    bottom: 15,
    right: 30,
    fontSize: 10,
    color: "#9CA3AF",
  },
  summaryBox: {
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryStat: {
    alignItems: "center",
  },
  summaryStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  summaryStatLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },
  patientInfoSection: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    border: "1px solid #E2E8F0",
  },
  patientInfoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 10,
    textAlign: "center",
  },
  patientInfoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  patientInfoColumn: {
    width: "48%",
  },
  patientInfoItem: {
    marginBottom: 4,
  },
  patientInfoLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 1,
  },
  patientInfoValue: {
    fontSize: 11,
    color: "#1E293B",
  },
  appointmentInfoBox: {
    backgroundColor: "#EFF6FF",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    border: "1px solid #BFDBFE",
  },
  appointmentInfoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 3,
  },
  appointmentInfoText: {
    fontSize: 10,
    color: "#1E40AF",
    marginBottom: 1,
  },
});

type ReportPDFProps = {
  report: {
    id: string;
    title: string;
    createdAt: Date | string;
    patient?: Pet;
    organization?: Organization;
    anatomicalIssues?: AnatomicalIssue[];
    recommendations?: AdvancedReportRecommendations[];
  };
  type: "advanced_report";
};

export function ReportPDF(props: ReportPDFProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Date inconnue";
    return format(new Date(date), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0
        ? `${hours}h${mins.toString().padStart(2, "0")}`
        : `${hours}h`;
    }
    return `${mins}min`;
  };

  // Fonction pour déterminer l'image anatomique selon la race de l'animal
  const getAnimalImage = (side: "left" | "right") => {
    const patient = props.report.patient;
    const animalType =
      patient?.animal?.code?.toLowerCase() ||
      patient?.type?.toLowerCase() ||
      "dog";

    switch (animalType) {
      case "cat":
        return side === "left"
          ? "/assets/images/cat-left-side.jpg"
          : "/assets/images/cat-right-side.jpg";
      case "horse":
        return side === "left"
          ? "/assets/images/horse-left-side.png"
          : "/assets/images/horse-right-side.png";
      case "bird":
      case "cow":
      case "nac":
      case "dog":
      default:
        return side === "left"
          ? "/assets/images/dog-left-side.jpg"
          : "/assets/images/dog-right-side.jpg";
    }
  };

  // Fonction pour obtenir la couleur de remplissage selon la sévérité
  const getSeverityFillColor = (severity: number) => {
    switch (severity) {
      case 1:
        return "#22C55E"; // Vert
      case 2:
        return "#EAB308"; // Jaune
      case 3:
        return "#F97316"; // Orange
      case 4:
        return "#EF4444"; // Rouge
      case 5:
        return "#A855F7"; // Violet
      default:
        return "#EAB308"; // Jaune par défaut
    }
  };

  // Fonction pour rendre le SVG anatomique dans le PDF
  const renderAnatomicalSVG = (dysfunctions: any[], side: "left" | "right") => {
    if (!dysfunctions || dysfunctions.length === 0) return null;

    return (
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 500 380"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {dysfunctions.map((dysfunction) => {
          const anatomicalPart = dysfunction.anatomicalPart;
          if (!anatomicalPart) return null;

          const path =
            side === "left"
              ? anatomicalPart.pathLeft
              : anatomicalPart.pathRight;
          const transform =
            side === "left"
              ? anatomicalPart.transformLeft
              : anatomicalPart.transformRight;

          if (!path) return null;

          return (
            <G key={dysfunction.id}>
              <Path
                d={path}
                transform={transform || ""}
                fill={getSeverityFillColor(dysfunction.severity)}
                fillOpacity={0.5}
                stroke={getSeverityFillColor(dysfunction.severity)}
                strokeWidth="2"
                strokeOpacity={0.8}
              />
            </G>
          );
        })}
      </Svg>
    );
  };

  const getReportTypeLabel = () => {
    return "Rapport Avancé";
  };

  const renderAnatomicalIssues = () => {
    if (
      !props.report.anatomicalIssues ||
      props.report.anatomicalIssues.length === 0
    ) {
      return (
        <View style={styles.issuesList}>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Aucune observation anatomique enregistrée
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.issuesList}>
        {props.report.anatomicalIssues.map((issue: any, index: number) => (
          <View key={issue.id || index} style={styles.issueItem}>
            <View style={styles.issueContent}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={styles.issueTitle}>
                  {issue.anatomicalPart?.name ||
                    issue.anatomicalPartId ||
                    "Partie anatomique"}
                </Text>
                <Text
                  style={
                    issue.type === "dysfunction"
                      ? styles.issueBadge
                      : styles.issueBadgeSecondary
                  }
                >
                  {issue.type === "dysfunction" ? "Dysfonction" : "Suspicion"}
                </Text>
              </View>
              <Text style={styles.issueDescription}>
                {issue.notes || "Aucune description disponible"}
              </Text>
              {issue.laterality && (
                <Text style={styles.issueMeta}>
                  Latéralité : {issue.laterality}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRecommendations = () => {
    if (
      !props.report.recommendations ||
      props.report.recommendations.length === 0
    ) {
      return (
        <View style={styles.recommendationsSection}>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Aucune recommandation disponible
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.recommendationsSection}>
        {props.report.recommendations.map((rec: any, index: number) => (
          <View key={rec.id || index} style={styles.recommendationItem}>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>
                Recommandation #{index + 1}
              </Text>
              <Text style={styles.recommendationText}>
                {rec.recommendation || rec.description || "Recommandation"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSummaryStats = () => {
    if (props.type !== "advanced_report") return null;

    const observations = props.report.anatomicalIssues?.filter(
      (i: any) => i.type === "observation",
    ).length || 0;
    const dysfunctions =
      props.report.anatomicalIssues?.filter(
        (i: any) => i.type === "dysfunction",
      ).length || 0;
    const suspicions =
      props.report.anatomicalIssues?.filter(
        (i: any) => i.type === "anatomicalSuspicion",
      ).length || 0;
    const recommendations = props.report.recommendations?.length || 0;

    return (
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Résumé du rapport</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatNumber}>{observations}</Text>
            <Text style={styles.summaryStatLabel}>Observations</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatNumber}>{dysfunctions}</Text>
            <Text style={styles.summaryStatLabel}>Dysfonctions</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatNumber}>{suspicions}</Text>
            <Text style={styles.summaryStatLabel}>Suspicions</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatNumber}>{recommendations}</Text>
            <Text style={styles.summaryStatLabel}>Recommandations</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPatientInfo = () => {
    const client = props.report.patient?.owner;
    const patient = props.report.patient;

    return (
      <View style={styles.patientInfoSection}>
        <Text style={styles.patientInfoTitle}>
          Informations du patient et du client
        </Text>

        <View style={styles.patientInfoGrid}>
          {/* Colonne gauche - Informations du client */}
          <View style={styles.patientInfoColumn}>
            <Text style={styles.patientInfoLabel}>PROPRIÉTAIRE</Text>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoValue}>
                {client?.name || "Non spécifié"}
              </Text>
            </View>
            {client?.email && (
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoValue}>{client.email}</Text>
              </View>
            )}
            {client?.phone && (
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoValue}>{client.phone}</Text>
              </View>
            )}
          </View>

          {/* Colonne droite - Informations du patient */}
          <View style={styles.patientInfoColumn}>
            <Text style={styles.patientInfoLabel}>PATIENT</Text>

            {/* Afficher le patient du rapport */}
            {patient ? (
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoValue}>
                  {patient.name || "Animal non spécifié"}
                </Text>
                {(patient.animal.code) && (
                  <Text style={styles.patientInfoValue}>
                    {patient.animal.code}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoValue}>Animal non spécifié</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>
              {props.report.title || "Rapport Médical"}
            </Text>
            <Text style={styles.subtitle}>{getReportTypeLabel()}</Text>
            <Text style={styles.subtitle}>
              {props.report.patient?.name || "Animal non spécifié"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {props.report.organization?.logo && (
              <Image
                style={styles.logo}
                src={props.report.organization?.logo || ""}
              />
            )}
            <Text style={styles.reportInfo}>
              {props.report.organization?.name}
            </Text>
            <Text style={styles.reportInfo}>
              {formatDate(props.report.createdAt)}
            </Text>
          </View>
        </View>

        {/* Informations du patient et du client */}
        {renderPatientInfo()}

        {/* Résumé statistiques */}
        {renderSummaryStats()}

        {/* Section schéma anatomique pour les rapports avancés */}
        {props.type === "advanced_report" && (
          <View style={styles.anatomicalSection}>
            <Text style={styles.anatomicalTitle}>Schéma Anatomique</Text>
            <View style={styles.anatomicalViews}>
              <View style={styles.anatomicalView}>
                <View style={styles.anatomicalImage}>
                  {/* Image anatomique gauche avec overlay SVG */}
                  <Image
                    src={getAnimalImage("left")}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                  {renderAnatomicalSVG(
                    props.report.anatomicalIssues || [],
                    "left",
                  )}
                </View>
                <Text style={styles.anatomicalLabel}>Vue Latérale Gauche</Text>
              </View>
              <View style={styles.anatomicalView}>
                <View style={styles.anatomicalImage}>
                  {/* Image anatomique droite avec overlay SVG */}
                  <Image
                    src={getAnimalImage("right")}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                  {renderAnatomicalSVG(
                    props.report.anatomicalIssues || [],
                    "right",
                  )}
                </View>
                <Text style={styles.anatomicalLabel}>Vue Latérale Droite</Text>
              </View>
            </View>
          </View>
        )}

        {/* Contenu spécifique selon le type de rapport */}
        <>
          {/* Section observations anatomiques */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observations Anatomiques</Text>
            {renderAnatomicalIssues()}
          </View>

          {/* Section recommandations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommandations</Text>
            {renderRecommendations()}
          </View>
        </>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={styles.footerLeft}>
            Rapport généré le {formatDate(new Date())}
          </Text>
          <Text style={styles.footerRight}>
            {props.report.organization?.name} - Biume
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
