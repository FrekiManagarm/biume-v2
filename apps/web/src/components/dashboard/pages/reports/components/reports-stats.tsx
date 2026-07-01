import { FileText, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ReportsStatsProps {
  total: number;
  brouillons: number;
  finalises: number;
  rapportsCeMois: number;
}

export function ReportsStats({
  total,
  brouillons,
  finalises,
  rapportsCeMois
}: ReportsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total des comptes rendus</p>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-muted-foreground text-xs">
                +{rapportsCeMois} ce mois
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="text-primary size-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">En brouillon</p>
              <p className="text-2xl font-bold">{brouillons}</p>
              <p className="text-muted-foreground text-xs">
                {total > 0 ? Math.round((brouillons / total) * 100) : 0}% du total
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Clock className="text-orange-600 size-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Finalisés</p>
              <p className="text-2xl font-bold">{finalises}</p>
              <p className="text-muted-foreground text-xs">
                {total > 0 ? Math.round((finalises / total) * 100) : 0}% du total
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="text-green-600 size-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
