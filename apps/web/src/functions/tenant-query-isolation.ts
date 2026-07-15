import { advancedReport, pets } from "@biume/db/schema/index";
import { eq } from "drizzle-orm";

export function getClientRelationsForOrganization(organizationId: string) {
  return {
    pets: {
      where: eq(pets.organizationId, organizationId),
      with: {
        animal: true as const,
        advancedReport: {
          where: eq(advancedReport.createdBy, organizationId),
        },
      },
    },
  };
}
