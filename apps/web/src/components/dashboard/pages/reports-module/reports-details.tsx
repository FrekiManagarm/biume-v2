
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { AdvancedReport } from "@/lib/schemas/advancedReport/advancedReport";
import { cn } from "@/lib/style";
import {
  ArrowLeft,
  Calendar,
  Download,
  Edit,
  FileText,
  Printer,
  Stethoscope,
  Activity,
  AlertCircle,
  CheckCircle2,
  StickyNote,
  LayoutDashboard,
  ChevronRight,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PatientCard } from "./components/PatientCard";
import { AnatomicalVisualization } from "./components/AnatomicalVisualization";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportPDF } from "./components/ReportPDF";
import { AnimalCredenza } from "@/components/animal-folder";

// --- Types & Helpers ---

interface ReportDetailsProps {
  report: AdvancedReport;
}

type TabId = "overview" | "clinical" | "recommendations" | "notes";

const getSeverityLabel = (severity: number) => {
  switch (severity) {
    case 1:
      return "Légère";
    case 2:
      return "Modérée";
    case 3:
      return "Importante";
    case 4:
      return "Sévère";
    case 5:
      return "Critique";
    default:
      return "Inconnue";
  }
};

const getSeverityColor = (severity: number) => {
  switch (severity) {
    case 1:
      return "bg-green-400";
    case 2:
      return "bg-yellow-400";
    case 3:
      return "bg-orange-400";
    case 4:
      return "bg-red-400";
    case 5:
      return "bg-purple-400";
    default:
      return "bg-gray-400";
  }
};

const getLateralityLabel = (laterality: string) => {
  switch (laterality) {
    case "left":
      return "Gauche";
    case "right":
      return "Droite";
    case "bilateral":
      return "Bilatéral";
    default:
      return laterality;
  }
};

const getIssueTypeLabel = (type: string) => {
  switch (type) {
    case "dysfunction":
      return "Dysfonction";
    case "anatomicalSuspicion":
      return "Suspicion";
    case "observation":
      return "Observation";
    default:
      return type;
  }
};

const getObservationTypeLabel = (type: string) => {
  switch (type) {
    case "dynamic":
      return "Dynamique";
    case "static":
      return "Statique";
    default:
      return type;
  }
};

// --- Components ---

const ReportDetails = ({ report }: ReportDetailsProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isAnimalCredenzaOpen, setIsAnimalCredenzaOpen] = useState(false);

  const observations =
    report.anatomicalIssues?.filter((issue) => issue.type === "observation") ||
    [];
  const anatomicalProblems =
    report.anatomicalIssues?.filter((issue) => issue.type !== "observation") ||
    [];

  console.log(report, "report");

  const menuItems = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "clinical", label: "Clinique & Anatomie", icon: Activity },
    { id: "recommendations", label: "Recommandations", icon: CheckCircle2 },
    { id: "notes", label: "Notes", icon: StickyNote },
  ];

  const handlePrint = () => window.print();
  const handleEdit = () =>
    navigate({
      to: "/dashboard/reports/$id/edit",
      params: { id: report.id },
    });

  // Sidebar Navigation Component
  const Sidebar = () => (
    <div className="w-80 border-r bg-muted/10 flex flex-col h-full shrink-0">
      {/* Header / Back */}
      <div className="p-4 border-b bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to="/dashboard/reports">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-semibold text-sm truncate">
            Détails du rapport
          </span>
        </div>
        <h1 className="text-lg font-bold leading-tight mb-1">{report.title}</h1>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {format(new Date(report.createdAt as Date), "PPP", { locale: fr })}
        </p>
      </div>

      {/* Patient Card */}
      <div className="p-4">
        {report.patient && (
          <PatientCard
            patient={report.patient}
            onPatientClick={() => setIsAnimalCredenzaOpen(true)}
            isCollapsed={false}
          />
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabId)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === item.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {activeTab === item.id && (
              <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-background/50 backdrop-blur-sm space-y-2">
        <Button onClick={handleEdit} className="w-full" variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Modifier le rapport
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handlePrint} variant="ghost" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <PDFDownloadLink
            document={
              <ReportPDF
                report={{
                  id: report.id,
                  title: report.title,
                  createdAt: report.createdAt || new Date(),
                  patient: report.patient,
                  organization: report.organization,
                  anatomicalIssues: report.anatomicalIssues,
                  recommendations: report.recommendations,
                }}
                type="advanced_report"
              />
            }
            fileName={`rapport-${report.id}.pdf`}
          >
            {({ loading }) => (
              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );

  // Tab Contents
  const OverviewTab = () => (
    <div className="space-y-6 w-full">
      {/* Status Banner */}
      <div className="flex items-center justify-between bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">État du rapport</h3>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour le{" "}
              {report.updatedAt
                ? format(new Date(report.updatedAt), "PPP", { locale: fr })
                : "—"}
            </p>
          </div>
        </div>
        <Badge
          variant={
            report.status === "finalized"
              ? "default"
              : report.status === "sent"
                ? "secondary"
                : "outline"
          }
          className="text-sm px-4 py-1"
        >
          {report.status === "draft"
            ? "Brouillon"
            : report.status === "finalized"
              ? "Finalisé"
              : "Envoyé"}
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{observations.length}</span>
              <span className="text-sm text-muted-foreground">notées</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min((observations.length / 10) * 100, 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dysfonctions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {anatomicalProblems.length}
              </span>
              <span className="text-sm text-muted-foreground">identifiées</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{
                  width: `${Math.min((anatomicalProblems.length / 10) * 100, 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recommandations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {report.recommendations?.length || 0}
              </span>
              <span className="text-sm text-muted-foreground">formulées</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${Math.min(((report.recommendations?.length || 0) / 5) * 100, 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reason */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Motif de consultation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-6 rounded-xl border border-dashed">
            <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {report.consultationReason ||
                "Aucun motif renseigné pour cette consultation."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ClinicalTab = () => (
    <div className="space-y-8 w-full h-full flex flex-col">
      <div className="h-full w-full">
        {report.anatomicalIssues && report.anatomicalIssues.length > 0 ? (
          <AnatomicalVisualization
            anatomicalIssues={report.anatomicalIssues}
            animalData={{
              name: report.patient?.animal?.name,
              code: report.patient?.animal?.code,
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-20" />
            <p>Aucune donnée anatomique à visualiser</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 pb-10">
        {/* Observations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Observations
            </h3>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {observations.length}
            </Badge>
          </div>

          {observations.length > 0 ? (
            <div className="space-y-3">
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full mt-1.5 shrink-0",
                        getSeverityColor(obs.severity),
                      )}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <span className="font-medium">
                          {obs.anatomicalPart?.name || "Zone non spécifiée"}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {getLateralityLabel(obs.laterality)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                          {getObservationTypeLabel(
                            obs.observationType || "none",
                          )}
                        </span>
                        <span>Sévérité: {getSeverityLabel(obs.severity)}</span>
                      </div>
                      {obs.notes && (
                        <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/30 rounded-lg">
                          {obs.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground">
              Aucune observation.
            </div>
          )}
        </div>

        {/* Dysfunctions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Dysfonctions
            </h3>
            <Badge variant="secondary" className="bg-orange-50 text-orange-700">
              {anatomicalProblems.length}
            </Badge>
          </div>

          {anatomicalProblems.length > 0 ? (
            <div className="space-y-3">
              {anatomicalProblems.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full mt-1.5 shrink-0",
                        getSeverityColor(issue.severity),
                      )}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <span className="font-medium">
                          {issue.anatomicalPart?.name || "Zone non spécifiée"}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {getLateralityLabel(issue.laterality)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                        <span
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded",
                            issue.type === "dysfunction"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800",
                          )}
                        >
                          {getIssueTypeLabel(issue.type)}
                        </span>
                        <span>
                          Sévérité: {getSeverityLabel(issue.severity)}
                        </span>
                      </div>
                      {issue.notes && (
                        <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/30 rounded-lg">
                          {issue.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground">
              Aucune dysfonction.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RecommendationsTab = () => (
    <div className="w-full space-y-6">
      {/* Header simplifié */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Recommandations</h2>
            <p className="text-sm text-muted-foreground">
              {report.recommendations?.length || 0}{" "}
              {report.recommendations?.length === 1
                ? "recommandation"
                : "recommandations"}
            </p>
          </div>
        </div>
      </div>

      {report.recommendations && report.recommendations.length > 0 ? (
        <div className="space-y-3">
          {report.recommendations.map((rec, index) => (
            <Card
              key={rec.id}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5 flex gap-4">
                <div className="shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">
                    {rec.recommendation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
          <h3 className="text-base font-semibold mb-1">
            Aucune recommandation
          </h3>
          <p className="text-sm">
            Aucune recommandation n'a été ajoutée à ce rapport pour le moment.
          </p>
        </div>
      )}
    </div>
  );

  const NotesTab = () => (
    <div className="w-full space-y-6">
      {/* Header simplifié */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <StickyNote className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Notes complémentaires</h2>
          <p className="text-sm text-muted-foreground">
            Informations supplémentaires et observations
          </p>
        </div>
      </div>

      {report.notes ? (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {report.notes}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl text-muted-foreground">
          <StickyNote className="h-12 w-12 mb-4 opacity-20" />
          <h3 className="text-base font-semibold mb-1">
            Aucune note complémentaire
          </h3>
          <p className="text-sm">
            Aucune note n'a été ajoutée à ce rapport pour le moment.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="flex gap-4 w-full h-[calc(100vh-8rem)] overflow-hidden">
        <Sidebar />

        <main className="flex flex-col h-full w-full overflow-hidden bg-muted/5">
          {/* Mobile Header or Print Header could go here if needed */}

          <ScrollArea className="h-full">
            <div className="h-full w-full">
              {activeTab === "overview" && <OverviewTab />}
              {activeTab === "clinical" && <ClinicalTab />}
              {activeTab === "recommendations" && <RecommendationsTab />}
              {activeTab === "notes" && <NotesTab />}
            </div>
          </ScrollArea>
        </main>
      </div>

      {report.patient?.id && (
        <AnimalCredenza
          isOpen={isAnimalCredenzaOpen}
          onOpenChange={setIsAnimalCredenzaOpen}
          petId={report.patient.id}
        />
      )}
    </>
  );
};

export default ReportDetails;
