import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ReportsHeader } from "./reports-header";

interface ReportsErrorProps {
  error: string;
  onRetry: () => void;
}

export function ReportsError({ error, onRetry }: ReportsErrorProps) {
  return (
    <div className="space-y-4">
      <ReportsHeader disabled />
      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>Erreur de chargement</EmptyTitle>
              <EmptyDescription>
                {error}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onRetry}>
                Réessayer
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    </div>
  );
}
