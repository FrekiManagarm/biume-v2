import { Plus, FileText } from "lucide-react";
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
import { Link } from "@tanstack/react-router";

export function ReportsEmpty() {
  return (
    <div className="space-y-4">
      <ReportsHeader />
      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>Aucun rapport</EmptyTitle>
              <EmptyDescription>
                Vous n&apos;avez pas encore de rapports avancés. Commencez par en
                créer un.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild variant="default">
                <Link to="/dashboard/reports">
                  <Plus />
                  Créer votre premier rapport
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    </div>
  );
}
