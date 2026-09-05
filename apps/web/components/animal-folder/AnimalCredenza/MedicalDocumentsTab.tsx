
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Pet } from "@/lib/schemas";

interface MedicalDocumentsTabProps {
  animal: Pet;
  client?: boolean;
}

export const MedicalDocumentsTab = ({ animal }: MedicalDocumentsTabProps) => {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Non défini";
    const dateObject = date instanceof Date ? date : new Date(date);
    return dateObject.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusLabel = (
    status: "draft" | "finalized" | "sent" | null | undefined,
  ) => {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "finalized":
        return "Finalisé";
      case "sent":
        return "Envoyé";
      default:
        return "Inconnu";
    }
  };

  const getStatusVariant = (
    status: "draft" | "finalized" | "sent" | null | undefined,
  ): "default" | "secondary" | "outline" => {
    switch (status) {
      case "draft":
        return "outline";
      case "finalized":
        return "secondary";
      case "sent":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête simplifié */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Dossier médical & Documents
          </h2>
          <p className="text-sm text-muted-foreground">
            Historique complet des rapports et consultations
          </p>
        </div>
      </div>

      {/* Section Rapports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">
              Rapports de consultation
            </h3>
            <p className="text-sm text-muted-foreground">
              {animal.advancedReport?.length || 0} rapport
              {(animal.advancedReport?.length || 0) > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {animal.advancedReport && animal.advancedReport.length > 0 ? (
          <div className="space-y-3">
            {animal.advancedReport.map((report) => (
              <Card
                key={report.id}
                className="hover:shadow-sm transition-shadow"
              >
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Activity className="h-4 w-4 text-orange-600" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-foreground truncate">
                          {report.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{formatDate(report.createdAt)}</span>
                          {report.consultationReason && (
                            <span className="text-xs text-muted-foreground truncate">
                              • {report.consultationReason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(report.status)}>
                        {getStatusLabel(report.status)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
                    </div>
                  </div>
                  {report.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h5 className="font-medium mb-2">Aucun rapport</h5>
              <p className="text-sm text-muted-foreground mb-4">
                Aucun rapport n&apos;a encore été créé pour {animal.name}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informations médicales importantes */}
      <Card>
        <CardContent>
          <h3 className="font-medium text-foreground mb-3">
            Allergies et informations importantes
          </h3>
          {!animal.allergies?.length &&
            !animal.deseases?.length &&
            !animal.intolerences?.length ? (
            <p className="text-sm text-muted-foreground">
              Aucune allergie connue ou information critique n&apos;a été
              enregistrée pour {animal.name}.
            </p>
          ) : (
            <div className="space-y-3">
              {animal.allergies && animal.allergies.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-amber-600 mb-2">
                    Allergies
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {animal.allergies.map((allergy, index) => (
                      <Badge key={index} variant="outline">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {animal.deseases && animal.deseases.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-red-600 mb-2">
                    Maladies
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {animal.deseases.map((disease, index) => (
                      <Badge key={index} variant="outline">
                        {disease}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {animal.intolerences && animal.intolerences.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-orange-600 mb-2">
                    Intolérances
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {animal.intolerences.map((intolerance, index) => (
                      <Badge key={index} variant="outline">
                        {intolerance}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations complémentaires */}
      {animal.nacType && (
        <Card>
          <CardContent>
            <h3 className="font-medium text-foreground mb-3">
              Informations complémentaires
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type NAC</span>
                <span className="font-medium">{animal.nacType}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
