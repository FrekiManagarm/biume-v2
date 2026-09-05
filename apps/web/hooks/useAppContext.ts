import { usePathname, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useActiveOrganization } from "#/lib/auth-client";
import {
  getActionsHistory,
  type AppContext,
} from "#/lib/ai/context-builder";

export function useAppContext(): AppContext {
  const pathname = usePathname();
  const params = useParams();
  const { data: organization } = useActiveOrganization();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [recentActions, setRecentActions] = useState<string[]>([]);

  useEffect(() => {
    setSelectedPatientId(window.localStorage.getItem("currentPetId"));
    setRecentActions(getActionsHistory());

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "currentPetId") {
        setSelectedPatientId(event.newValue);
      }

      if (event.key === "biume-ai-actions-history") {
        setRecentActions(getActionsHistory());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const selectedClientId = useMemo(() => {
    const clientId = (params as { clientId?: unknown }).clientId;
    return typeof clientId === "string" ? clientId : null;
  }, [params]);

  return useMemo(
    () => ({
      organizationId: organization?.id,
      currentPage: pathname,
      selectedPatient: selectedPatientId
        ? { id: selectedPatientId }
        : undefined,
      selectedClient: selectedClientId ? { id: selectedClientId } : undefined,
      recentActions,
    }),
    [organization?.id, pathname, recentActions, selectedClientId, selectedPatientId],
  );
}
