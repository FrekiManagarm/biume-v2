import { useMemo, useState } from "react";
import { ClientOnly, Link, useNavigate } from "@tanstack/react-router";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Download,
  Edit,
  FileText,
  HeartPulse,
  LayoutDashboard,
  PawPrint,
  Printer,
  Send,
  Stethoscope,
  StickyNote,
} from "lucide-react";

import type { NormalizedAdvancedReport } from "#/functions/reports.function";
import { cn } from "@/lib/style";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PatientCard } from "./components/PatientCard";
import { AnatomicalVisualization } from "./components/AnatomicalVisualization";
import { ReportPDF } from "./components/ReportPDF";
import { AnimalCredenza } from "@/components/animal-folder";

interface ReportDetailsProps {
  report: NormalizedAdvancedReport;
}

type TabId = "overview" | "clinical" | "recommendations" | "notes";
type StatusTone = "draft" | "finalized" | "sent";

const statusConfig: Record<
  StatusTone,
  {
    label: string;
    detail: string;
    className: string;
    icon: typeof FileText;
  }
> = {
  draft: {
    label: "Brouillon",
    detail: "À relire avant transmission",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: ClipboardList,
  },
  finalized: {
    label: "Finalisé",
    detail: "Prêt pour le client",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  sent: {
    label: "Envoyé",
    detail: "Transmission effectuée",
    className: "border-sky-200 bg-sky-50 text-sky-800",
    icon: Send,
  },
};

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
      return "bg-emerald-500";
    case 2:
      return "bg-lime-500";
    case 3:
      return "bg-amber-500";
    case 4:
      return "bg-rose-500";
    case 5:
      return "bg-red-700";
    default:
      return "bg-slate-400";
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
    case "diagnosticExclusion":
      return "Exclusion diagnostique";
    case "none":
      return "Observation";
    default:
      return type;
  }
};

const formatReportDate = (date: Date | string | null | undefined) => {
  if (!date) return "Non renseigné";
  return format(new Date(date), "PPP", { locale: fr });
};

const ReportDetails = ({ report }: ReportDetailsProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isAnimalCredenzaOpen, setIsAnimalCredenzaOpen] = useState(false);

  const observations = useMemo(
    () =>
      report.anatomicalIssues?.filter(
        (issue) => issue.type === "observation",
      ) || [],
    [report.anatomicalIssues],
  );

  const anatomicalProblems = useMemo(
    () =>
      report.anatomicalIssues?.filter(
        (issue) => issue.type !== "observation",
      ) || [],
    [report.anatomicalIssues],
  );

  const recommendations = report.recommendations || [];
  const currentStatus =
    statusConfig[(report.status || "draft") as StatusTone] ||
    statusConfig.draft;
  const StatusIcon = currentStatus.icon;
  const lastUpdateLabel = report.updatedAt
    ? formatReportDate(report.updatedAt)
    : "Aucune mise à jour";

  const menuItems = [
    {
      id: "overview",
      label: "Synthèse",
      count: null,
      icon: LayoutDashboard,
    },
    {
      id: "clinical",
      label: "Clinique",
      count: report.anatomicalIssues?.length || 0,
      icon: Activity,
    },
    {
      id: "recommendations",
      label: "Recommandations",
      count: recommendations.length,
      icon: CheckCircle2,
    },
    {
      id: "notes",
      label: "Notes",
      count: report.notes ? 1 : 0,
      icon: StickyNote,
    },
  ] satisfies Array<{
    id: TabId;
    label: string;
    count: number | null;
    icon: typeof FileText;
  }>;

  const metrics = [
    {
      label: "Observations",
      value: observations.length,
      detail: "éléments relevés",
      icon: Calendar,
      tone: "emerald",
    },
    {
      label: "Points cliniques",
      value: anatomicalProblems.length,
      detail: "zones à suivre",
      icon: HeartPulse,
      tone: "amber",
    },
    {
      label: "Recommandations",
      value: recommendations.length,
      detail: "actions proposées",
      icon: CheckCircle2,
      tone: "slate",
    },
  ] satisfies Array<{
    label: string;
    value: number;
    detail: string;
    icon: typeof FileText;
    tone: "emerald" | "amber" | "slate";
  }>;

  const handlePrint = () => window.print();
  const handleEdit = () =>
    navigate({
      to: "/dashboard/reports/$id/edit",
      params: { id: report.id },
    });

  return (
    <>
      <div className="grid w-full gap-5 pb-8 text-slate-950">
        <header className="grid gap-4 border-b border-slate-200 pb-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="min-w-0">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-2 mb-2 h-8 text-slate-600 active:scale-[0.98]"
            >
              <Link to="/dashboard/reports">
                <ArrowLeft className="size-4" />
                Rapports
              </Link>
            </Button>

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-7 items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold",
                  currentStatus.className,
                )}
              >
                <StatusIcon className="size-3.5" />
                {currentStatus.label}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Créé le {formatReportDate(report.createdAt)}
              </span>
            </div>

            <h1 className="max-w-4xl truncate text-xl font-semibold leading-tight tracking-tight text-slate-950 md:text-2xl">
              {report.title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-500">
              {report.patient?.name
                ? `Compte rendu clinique pour ${report.patient.name}.`
                : "Compte rendu clinique."}{" "}
              {currentStatus.detail}. Dernière activité : {lastUpdateLabel}.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:w-84">
            <Button
              onClick={handleEdit}
              className="h-10 rounded-lg bg-slate-950 text-white hover:bg-slate-800 active:scale-[0.98]"
            >
              <Edit className="size-4" />
              Modifier
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-10 rounded-lg border-slate-200 bg-white active:scale-[0.98]"
            >
              <Printer className="size-4" />
              Imprimer
            </Button>
            <ClientOnly
              fallback={
                <Button
                  variant="outline"
                  disabled
                  className="h-10 w-full rounded-lg border-slate-200 bg-white"
                >
                  <Download className="size-4" />
                  Préparation
                </Button>
              }
            >
              <PDFDownloadLink
                document={
                  <ReportPDF
                    report={{
                      id: report.id,
                      title: report.title,
                      createdAt: report.createdAt || new Date(),
                      consultationReason: report.consultationReason,
                      notes: report.notes,
                      patient: report.patient,
                      organization: report.organization,
                      anatomicalIssues: report.anatomicalIssues,
                      recommendations: report.recommendations,
                      ownerContents: report.ownerContents,
                    }}
                    type="advanced_report"
                  />
                }
                fileName={`rapport-${report.id}.pdf`}
              >
                {({ loading }) => (
                  <Button
                    variant="outline"
                    disabled={loading}
                    className="h-10 w-full rounded-lg border-slate-200 bg-white active:scale-[0.98]"
                  >
                    <Download className="size-4" />
                    {loading ? "Préparation" : "PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </ClientOnly>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="grid min-w-0 gap-5">
            <ReportNavigation
              activeTab={activeTab}
              menuItems={menuItems}
              onChange={setActiveTab}
            />

            {activeTab === "overview" && (
              <OverviewTab
                metrics={metrics}
                report={report}
                status={currentStatus}
              />
            )}
            {activeTab === "clinical" && (
              <ClinicalTab
                report={report}
                observations={observations}
                anatomicalProblems={anatomicalProblems}
              />
            )}
            {activeTab === "recommendations" && (
              <RecommendationsTab recommendations={recommendations} />
            )}
            {activeTab === "notes" && <NotesTab notes={report.notes || ""} />}
          </div>

          <aside className="grid gap-4 xl:sticky xl:top-4">
            {report.patient ? (
              <PatientCard
                patient={report.patient}
                onPatientClick={() => setIsAnimalCredenzaOpen(true)}
                isCollapsed={false}
              />
            ) : (
              <EmptyState
                icon={PawPrint}
                title="Aucun patient lié"
                description="Ce rapport n'est pas encore rattaché à un dossier animal."
              />
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Résumé du dossier
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Lecture rapide
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
                  <FileText className="size-4" />
                </div>
              </div>

              <dl className="divide-y divide-slate-100">
                <SummaryRow label="Statut" value={currentStatus.label} />
                <SummaryRow
                  label="Observations"
                  value={String(observations.length)}
                />
                <SummaryRow
                  label="Points cliniques"
                  value={String(anatomicalProblems.length)}
                />
                <SummaryRow
                  label="Recommandations"
                  value={String(recommendations.length)}
                />
                <SummaryRow label="Mise à jour" value={lastUpdateLabel} />
              </dl>
            </div>
          </aside>
        </section>
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

function ReportNavigation({
  activeTab,
  menuItems,
  onChange,
}: {
  activeTab: TabId;
  menuItems: Array<{
    id: TabId;
    label: string;
    count: number | null;
    icon: typeof FileText;
  }>;
  onChange: (tab: TabId) => void;
}) {
  return (
    <nav className="sticky top-3 z-20 -mx-1 overflow-x-auto rounded-[1.25rem] border border-slate-200 bg-white/90 p-1 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.65)] backdrop-blur no-print">
      <div className="grid min-w-max grid-cols-4 gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "bg-slate-950 text-white shadow-[0_18px_35px_-24px_rgba(15,23,42,0.8)]"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
              {item.count !== null ? (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[11px]",
                    isActive ? "bg-white/15 text-white" : "bg-slate-100",
                  )}
                >
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function OverviewTab({
  metrics,
  report,
  status,
}: {
  metrics: Array<{
    label: string;
    value: number;
    detail: string;
    icon: typeof FileText;
    tone: "emerald" | "amber" | "slate";
  }>;
  report: NormalizedAdvancedReport;
  status: (typeof statusConfig)[StatusTone];
}) {
  const StatusIcon = status.icon;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {metric.label}
                  </p>
                  <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-950">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {metric.detail}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                    metric.tone === "emerald" &&
                      "border-emerald-200 bg-emerald-50 text-emerald-800",
                    metric.tone === "amber" &&
                      "border-amber-200 bg-amber-50 text-amber-800",
                    metric.tone === "slate" &&
                      "border-slate-200 bg-slate-50 text-slate-700",
                  )}
                >
                  <Icon className="size-5" />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)] sm:p-6">
          <SectionHeading
            icon={Stethoscope}
            title="Motif de consultation"
            description="Contexte initial de la séance."
          />
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {report.consultationReason ||
                "Aucun motif renseigné pour cette consultation."}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
              <StatusIcon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                État du rapport
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {status.detail}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <InfoLine
              label="Création"
              value={formatReportDate(report.createdAt)}
            />
            <InfoLine
              label="Dernière mise à jour"
              value={
                report.updatedAt
                  ? formatReportDate(report.updatedAt)
                  : "Non modifié"
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ClinicalTab({
  report,
  observations,
  anatomicalProblems,
}: {
  report: NormalizedAdvancedReport;
  observations: NormalizedAdvancedReport["anatomicalIssues"];
  anatomicalProblems: NormalizedAdvancedReport["anatomicalIssues"];
}) {
  const hasAnatomy = (report.anatomicalIssues?.length || 0) > 0;

  return (
    <div className="grid gap-5">
      {hasAnatomy ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
          <AnatomicalVisualization
            anatomicalIssues={report.anatomicalIssues}
            animalData={{
              name: report.patient?.animal?.name,
              code: report.patient?.animal?.code,
            }}
          />
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="Aucune donnée anatomique"
          description="Le rapport ne contient pas encore de point clinique localisé."
        />
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <IssueList
          title="Observations"
          description="Constats issus de l'examen."
          icon={Calendar}
          issues={observations}
          emptyTitle="Aucune observation"
          emptyDescription="Aucune observation n'a été ajoutée à ce rapport."
        />
        <IssueList
          title="Points cliniques"
          description="Dysfonctions et suspicions à suivre."
          icon={AlertCircle}
          issues={anatomicalProblems}
          emptyTitle="Aucun point clinique"
          emptyDescription="Aucune dysfonction ou suspicion n'a été ajoutée."
        />
      </div>
    </div>
  );
}

function IssueList({
  title,
  description,
  icon,
  issues,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  icon: typeof FileText;
  issues: NormalizedAdvancedReport["anatomicalIssues"];
  emptyTitle: string;
  emptyDescription: string;
}) {
  const Icon = icon;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)] sm:p-6">
      <SectionHeading icon={Icon} title={title} description={description} />

      {issues.length > 0 ? (
        <div className="mt-5 divide-y divide-slate-100">
          {issues.map((issue) => (
            <article key={issue.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 size-2.5 shrink-0 rounded-full",
                    getSeverityColor(issue.severity),
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-950">
                      {issue.anatomicalPart?.name || "Zone non spécifiée"}
                    </h3>
                    <Badge
                      variant="outline"
                      className="rounded-md border-slate-200 bg-white text-[11px] text-slate-600"
                    >
                      {getLateralityLabel(issue.laterality)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                    <span className="rounded-md bg-slate-100 px-2 py-1">
                      {issue.type === "observation"
                        ? getObservationTypeLabel(
                            issue.observationType || "none",
                          )
                        : getIssueTypeLabel(issue.type)}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1">
                      Sévérité {getSeverityLabel(issue.severity)}
                    </span>
                  </div>
                  {issue.notes ? (
                    <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                      {issue.notes}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon={Icon}
            title={emptyTitle}
            description={emptyDescription}
            compact
          />
        </div>
      )}
    </section>
  );
}

function RecommendationsTab({
  recommendations,
}: {
  recommendations: NormalizedAdvancedReport["recommendations"];
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)] sm:p-6">
      <SectionHeading
        icon={CheckCircle2}
        title="Recommandations"
        description={`${recommendations.length} action${recommendations.length > 1 ? "s" : ""} proposée${recommendations.length > 1 ? "s" : ""}.`}
      />

      {recommendations.length > 0 ? (
        <ol className="mt-5 divide-y divide-slate-100">
          {recommendations.map((recommendation, index) => (
            <li
              key={recommendation.id}
              className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[2.5rem_1fr]"
            >
              <span className="flex size-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 font-mono text-sm font-semibold text-emerald-800">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-slate-700">
                {recommendation.recommendation}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon={CheckCircle2}
            title="Aucune recommandation"
            description="Aucune recommandation n'a été ajoutée à ce rapport pour le moment."
          />
        </div>
      )}
    </section>
  );
}

function NotesTab({ notes }: { notes: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)] sm:p-6">
      <SectionHeading
        icon={StickyNote}
        title="Notes complémentaires"
        description="Informations utiles pour relire ou compléter le dossier."
      />

      {notes ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {notes}
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon={StickyNote}
            title="Aucune note complémentaire"
            description="Aucune note n'a été ajoutée à ce rapport pour le moment."
          />
        </div>
      )}
    </section>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  const Icon = icon;

  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
        <Icon className="size-4" />
      </div>
      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-right text-xs font-semibold text-slate-950">
        {value}
      </span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  compact = false,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  compact?: boolean;
}) {
  const Icon = icon;

  return (
    <div
      className={cn(
        "grid place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center",
        compact ? "min-h-40 p-5" : "min-h-56 p-8",
      )}
    >
      <div className="max-w-sm">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
          <Icon className="size-5" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default ReportDetails;
