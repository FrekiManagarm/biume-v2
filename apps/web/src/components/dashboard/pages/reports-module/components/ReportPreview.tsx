import {
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartHandshake,
  PawPrint,
  Stethoscope,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/style";
import type { Observation } from "../data/dog/typesDog";
import type { AnatomicalIssue } from "../types";

type OwnerPreviewSection =
  "clinical" | "anatomical" | "recommendations" | "notes";

interface OwnerReportPreviewProps {
  title: string;
  consultationReason?: string;
  patientName?: string;
  observations: Observation[];
  notes: string;
  recommendations?: { id: string; content: string }[];
  anatomicalIssues?: AnatomicalIssue[];
  activeSection?: OwnerPreviewSection;
  className?: string;
}

interface ReportPreviewProps extends OwnerReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
}

const severityLabels = [
  "Non renseignée",
  "Légère",
  "Modérée",
  "Importante",
  "Sévère",
  "Très marquée",
] as const;

const lateralityLabels = {
  left: "côté gauche",
  right: "côté droit",
  bilateral: "des deux côtés",
} as const;

function getIssueRegion(issue: AnatomicalIssue) {
  return issue.anatomicalPart?.name || issue.region || "Zone non précisée";
}

function getObservationFallback(observation: Observation) {
  const laterality = observation.laterality
    ? lateralityLabels[observation.laterality]
    : null;
  const details = [
    observation.region,
    laterality,
    severityLabels[observation.severity] || severityLabels[0],
  ].filter(Boolean);

  return details.join(" · ");
}

function getIssueFallback(issue: AnatomicalIssue) {
  const laterality = issue.laterality
    ? lateralityLabels[issue.laterality]
    : null;
  const details = [
    getIssueRegion(issue),
    laterality,
    severityLabels[issue.severity] || severityLabels[0],
  ].filter(Boolean);

  return details.join(" · ");
}

function PreviewSection({
  title,
  description,
  icon: Icon,
  isActive,
  children,
}: {
  title: string;
  description: string;
  icon: typeof FileText;
  isActive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "border-t border-slate-200 px-5 py-5 transition-colors duration-300",
        isActive && "bg-emerald-50/50",
      )}
    >
      <div className="mb-3 flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors duration-300",
            isActive && "border-emerald-200 text-emerald-800",
          )}
        >
          <Icon className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptySection({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-3 text-xs leading-5 text-slate-500">
      {children}
    </p>
  );
}

export function OwnerReportPreview({
  title,
  consultationReason = "",
  patientName,
  observations,
  notes,
  recommendations = [],
  anatomicalIssues = [],
  activeSection,
  className,
}: OwnerReportPreviewProps) {
  const findingCount = observations.length + anatomicalIssues.length;
  const completedSections = [
    consultationReason.trim().length > 0,
    findingCount > 0,
    recommendations.length > 0,
    notes.trim().length > 0,
  ].filter(Boolean).length;
  const hasReportContent = completedSections > 0;

  return (
    <article
      aria-label="Version propriétaire du rapport"
      className={cn(
        "overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#fffefa] text-slate-950 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]",
        className,
      )}
    >
      <header className="px-5 pb-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
            Version propriétaire
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                hasReportContent
                  ? "animate-pulse bg-emerald-600"
                  : "bg-slate-300",
              )}
            />
            {hasReportContent ? "Prêt à relire" : "En construction"}
          </span>
        </div>

        <div className="mt-6 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
            <PawPrint className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-tight tracking-tight text-slate-950">
              {patientName ? `Compte rendu de ${patientName}` : title}
            </h2>
            {patientName ? (
              <p className="mt-1 truncate text-xs font-medium text-slate-500">
                {title}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-700 transition-transform duration-500 ease-out"
            style={{
              transform: `scaleX(${completedSections / 4})`,
              transformOrigin: "left",
            }}
          />
        </div>
        <p className="mt-2 text-[11px] font-medium text-slate-500">
          {completedSections}/4 rubriques renseignées
        </p>
      </header>

      <PreviewSection
        title="Motif de la séance"
        description="Le contexte donné au propriétaire."
        icon={Stethoscope}
      >
        {consultationReason.trim() ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {consultationReason}
          </p>
        ) : (
          <EmptySection>Le motif apparaîtra ici.</EmptySection>
        )}
      </PreviewSection>

      <PreviewSection
        title="Points observés"
        description={`${findingCount} élément${findingCount > 1 ? "s" : ""} issu${findingCount > 1 ? "s" : ""} de la séance.`}
        icon={ClipboardList}
        isActive={
          activeSection === "clinical" || activeSection === "anatomical"
        }
      >
        {findingCount > 0 ? (
          <div className="divide-y divide-slate-100">
            {observations.map((observation) => (
              <div
                key={observation.id}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="mt-2 size-1.5 rounded-full bg-emerald-700" />
                <div>
                  <p className="text-xs font-semibold text-slate-950">
                    {observation.region}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {observation.notes.trim() ||
                      getObservationFallback(observation)}
                  </p>
                </div>
              </div>
            ))}
            {anatomicalIssues.map((issue) => (
              <div
                key={issue.id}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="mt-2 size-1.5 rounded-full bg-amber-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-950">
                    {getIssueRegion(issue)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {issue.notes.trim() || getIssueFallback(issue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptySection>
            Ajoutez une observation : le document se construira sous vos yeux.
          </EmptySection>
        )}
      </PreviewSection>

      <PreviewSection
        title="Conseils après la séance"
        description="Les indications que le propriétaire pourra retrouver."
        icon={HeartHandshake}
        isActive={activeSection === "recommendations"}
      >
        {recommendations.length > 0 ? (
          <ol className="grid gap-2.5">
            {recommendations.map((recommendation, index) => (
              <li
                key={recommendation.id}
                className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 text-sm leading-6 text-slate-700"
              >
                <span className="font-mono text-xs font-semibold text-emerald-800">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{recommendation.content}</span>
              </li>
            ))}
          </ol>
        ) : (
          <EmptySection>Les recommandations apparaîtront ici.</EmptySection>
        )}
      </PreviewSection>

      <PreviewSection
        title="Informations complémentaires"
        description="La dernière précision avant le partage."
        icon={FileText}
        isActive={activeSection === "notes"}
      >
        {notes.trim() ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {notes}
          </p>
        ) : (
          <EmptySection>Aucune information complémentaire.</EmptySection>
        )}
      </PreviewSection>

      <footer className="flex items-center gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4 text-xs font-medium text-slate-600">
        <CheckCircle2 className="size-4 text-emerald-700" />
        Vous gardez la validation finale avant tout partage.
      </footer>
    </article>
  );
}

export function ReportPreview({
  isOpen,
  onClose,
  title,
  consultationReason,
  patientName,
  observations,
  notes,
  recommendations,
  anatomicalIssues,
  activeSection,
}: ReportPreviewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-0 bg-slate-100 p-3 shadow-2xl sm:max-w-2xl sm:p-5">
        <DialogHeader className="px-1 pb-1 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950">
            <FileText className="size-4 text-emerald-800" />
            Aperçu propriétaire
          </DialogTitle>
        </DialogHeader>

        <OwnerReportPreview
          title={title}
          consultationReason={consultationReason}
          patientName={patientName}
          observations={observations}
          notes={notes}
          recommendations={recommendations}
          anatomicalIssues={anatomicalIssues}
          activeSection={activeSection}
          className="rounded-[1.5rem] shadow-none"
        />
      </DialogContent>
    </Dialog>
  );
}
