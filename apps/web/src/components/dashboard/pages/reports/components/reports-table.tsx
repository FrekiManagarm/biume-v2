import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  PawPrint,
  Download,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdvancedReport } from "@/lib/schemas/advancedReport/advancedReport";
import { useNavigate } from "@tanstack/react-router";
import { deleteReport } from "@/lib/api/actions/reports.action";
import { toast } from "sonner";
import { sendNewReportClientEmailWithPDF } from "@/lib/api/actions/email.action";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportPDF } from "#/components/dashboard/pages/reports-module/components/ReportPDF";
import { cn } from "#/lib/utils";

type ReportStatus = "brouillon" | "finalisé" | "envoyé";

interface ReportsTableProps {
  reports: AdvancedReport[];
}

// Fonction helper pour obtenir le statut d'un rapport
const getReportStatus = (report: AdvancedReport): ReportStatus => {
  switch (report.status) {
    case "draft":
      return "brouillon";
    case "finalized":
      return "finalisé";
    case "sent":
      return "envoyé";
    default:
      return "brouillon";
  }
};

// Fonction helper pour le badge de statut
const getStatusBadge = (status: ReportStatus) => {
  const variants = {
    brouillon: {
      label: "Brouillon",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    },
    finalisé: {
      label: "Finalisé",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    envoyé: {
      label: "Envoyé",
      className: "border-sky-200 bg-sky-50 text-sky-800",
    },
  };

  const config = variants[status];
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-lg border px-2.5 text-xs font-semibold",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
};

// Fonction helper pour le badge de type d'animal
const getPatientTypeBadge = (type: string) => {
  return (
    <Badge
      variant="outline"
      className="w-fit border-slate-200 bg-slate-50 text-slate-600"
    >
      <PawPrint className="mr-1 size-3" />
      {type}
    </Badge>
  );
};

// Fonction de formatage de date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export function ReportsTable({ reports }: ReportsTableProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<AdvancedReport | null>(
    null,
  );

  // Mutation pour la suppression du rapport
  const deleteReportMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Rapport supprimé avec succès");
        setIsDeleteDialogOpen(false);
        setReportToDelete(null);
      } else {
        toast.error(result.error || "Erreur lors de la suppression du rapport");
      }
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du rapport");
    },
  });

  const handleViewReport = (reportId: string) => {
    navigate({ to: "/dashboard/reports/$id", params: { id: reportId } });
  };

  const handleEditReport = (reportId: string) => {
    navigate({ to: "/dashboard/reports/$id/edit", params: { id: reportId } });
  };

  const handleDeleteReport = (report: AdvancedReport) => {
    setReportToDelete(report);
    setIsDeleteDialogOpen(true);
  };

  // Téléchargement PDF désormais géré via React-PDF (PDFDownloadLink) dans le menu

  const emailMutation = useMutation({
    mutationFn: sendNewReportClientEmailWithPDF,
    onSuccess: () => toast.success("Email envoyé au client"),
    onError: () => toast.error("Échec de l'envoi de l'email"),
  });

  const handleSendReportByEmail = async (report: AdvancedReport) => {
    const to = report.patient?.owner?.email;
    if (!to) {
      toast.error("Aucune adresse email client disponible");
      return;
    }

    const clientName = report.patient?.owner?.name || "Client";
    const petName = report.patient?.name || "votre animal";
    const reportDate = report.createdAt
      ? new Date(report.createdAt).toLocaleDateString("fr-FR")
      : new Date().toLocaleDateString("fr-FR");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const reportUrl = `${baseUrl}/dashboard/reports/${report.id}`;

    await emailMutation.mutateAsync({
      to,
      clientName,
      petName,
      reportDate,
      reportUrl,
      report: {
        id: report.id,
        title: report.title,
        createdAt: report.createdAt || new Date(),
        patient: report.patient,
        organization: report.organization,
        anatomicalIssues: report.anatomicalIssues,
        recommendations: report.recommendations,
      },
    });
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      await deleteReportMutation.mutateAsync({ reportId: reportToDelete.id });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du rapport");
    }
  };

  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="hover:bg-slate-50">
            <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
              Titre
            </TableHead>
            <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
              Patient
            </TableHead>
            <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
              Propriétaire
            </TableHead>
            <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
              Raison consultation
            </TableHead>
            <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
              Statut
            </TableHead>
            <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
              Créé le
            </TableHead>
            <TableHead className="h-11 text-right text-xs font-semibold uppercase text-slate-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow
              key={report.id}
              className="cursor-pointer border-slate-100 transition duration-200 hover:bg-slate-50/80"
              onClick={() => handleViewReport(report.id)}
            >
              <TableCell className="py-4">
                <div className="font-semibold text-slate-950">
                  {report.title}
                </div>
                <div className="mt-1 max-w-[240px] truncate text-sm text-slate-500">
                  {report.notes || "Aucune note"}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                      <PawPrint className="size-3.5" />
                    </span>
                    <span className="font-medium text-slate-950">
                      {report.patient?.name || "N/A"}
                    </span>
                  </div>
                  {getPatientTypeBadge(
                    report.patient?.animal?.name || "Inconnu",
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <User className="size-3.5 text-slate-400" />
                  <span>{report.patient?.owner?.name || "N/A"}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-[220px] truncate py-4 text-sm text-slate-500">
                {report.consultationReason || "Non spécifié"}
              </TableCell>
              <TableCell className="py-4">
                {getStatusBadge(getReportStatus(report))}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="size-3.5 text-slate-400" />
                    <span className="font-medium">
                      {report.createdAt ? formatDate(report.createdAt) : "N/A"}
                    </span>
                  </div>
                  {report.updatedAt && (
                    <div className="text-xs text-slate-500">
                      Modifié: {formatDate(report.updatedAt)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Ouvrir le menu</span>
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReport(report.id);
                      }}
                    >
                      <Eye className="size-4" />
                      Voir le rapport
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditReport(report.id);
                      }}
                    >
                      <Edit className="size-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={
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
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="size-4" />
                              {loading ? "Génération..." : "Télécharger le PDF"}
                            </div>
                          )}
                        </PDFDownloadLink>
                      }
                    />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendReportByEmail(report);
                      }}
                    >
                      <Send className="size-4" />
                      Envoyer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReport(report);
                      }}
                    >
                      <Trash2 className="size-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le rapport{" "}
              <strong className="text-foreground">
                {reportToDelete?.title}
              </strong>{" "}
              ? Cette action est irréversible et supprimera définitivement
              toutes les données associées (observations, problèmes anatomiques,
              recommandations).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteReportMutation.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteReportMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReportMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
