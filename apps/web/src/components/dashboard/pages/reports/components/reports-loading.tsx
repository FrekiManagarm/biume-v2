import { ReportsHeader } from "./reports-header";
import { Card, CardContent } from "@/components/ui/card";

export function ReportsLoading() {
  return (
    <div className="space-y-4">
      <ReportsHeader disabled />
      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des rapports...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
