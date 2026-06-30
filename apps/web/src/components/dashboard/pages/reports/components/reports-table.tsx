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
import { Button } from "@biume/ui/components/button";
import { Badge } from "@biume/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@biume/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@biume/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@biume/ui/components/alert-dialog";
import { type AdvancedReport } from "@biume/db/schema/index";
import { useNavigate } from "@tanstack/react-router";
import { deleteReport } from "@/lib/api/actions/reports.action";
import { toast } from "sonner";
import { sendNewReportClientEmailWithPDF } from "@/lib/api/actions/email.action";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportPDF } from "@/components/reports-module/components/ReportPDF";

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
    brouillon: { variant: "outline" as const, label: "Brouillon" },
    finalisé: { variant: "default" as const, label: "Finalisé" },
    envoyé: { variant: "secondary" as const, label: "Envoyé" },
  };

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Fonction helper pour le badge de type d'animal
const getPatientTypeBadge = (type: string) => {
  const variants = {
    Chien: { variant: "default" as const, emoji: "🐕" },
    Chat: { variant: "secondary" as const, emoji: "🐈" },
    Cheval: { variant: "outline" as const, emoji: "🐴" },
    Oiseau: { variant: "outline" as const, emoji: "🦜" },
  };

  const config = variants[type as keyof typeof variants] || {
    variant: "outline" as const,
    emoji: "🐾",
  };
  return (
    <Badge variant={config.variant}>
      <span className="mr-1">{config.emoji}</span>
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
    navigate({ to: `/dashboard/reports/${reportId}` });
  };

  const handleEditReport = (reportId: string) => {
    navigate({ to: `/dashboard/reports/${reportId}/edit` });
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Propriétaire</TableHead>
            <TableHead>Raison consultation</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow
              key={report.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleViewReport(report.id)}
            >
              <TableCell>
                <div className="font-medium">{report.title}</div>
                <div className="text-muted-foreground text-sm truncate max-w-50">
                  {report.notes || "Aucune note"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <PawPrint className="text-muted-foreground size-3" />
                    <span className="font-medium">
                      {report.patient?.name || "N/A"}
                    </span>
                  </div>
                  {getPatientTypeBadge(
                    report.patient?.animal?.name || "Inconnu",
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <User className="text-muted-foreground size-3" />
                  <span>{report.patient?.owner?.name || "N/A"}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {report.consultationReason || "Non spécifié"}
              </TableCell>
              <TableCell>{getStatusBadge(getReportStatus(report))}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="text-muted-foreground size-3" />
                    <span>
                      {report.createdAt ? formatDate(report.createdAt) : "N/A"}
                    </span>
                  </div>
                  {report.updatedAt && (
                    <div className="text-muted-foreground text-xs">
                      Modifié: {formatDate(report.updatedAt)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
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
