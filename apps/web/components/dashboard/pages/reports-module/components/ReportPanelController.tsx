import type { ComponentProps } from "react";

import { OwnerPreparationSheet } from "./OwnerPreparationSheet";
import { OwnerReportPreviewSheet } from "./ReportPreview";

export type ReportPanelState =
  | { type: "closed" }
  | { type: "owner-preview" }
  | { type: "owner-preparation"; sourceKey?: string };

type ReportPanelControllerProps = {
  state: ReportPanelState;
  onClose: () => void;
  preview: Omit<
    ComponentProps<typeof OwnerReportPreviewSheet>,
    "open" | "onOpenChange"
  >;
  preparation: Omit<
    ComponentProps<typeof OwnerPreparationSheet>,
    "open" | "onOpenChange" | "initialSourceKey"
  >;
};

export function ReportPanelController({
  state,
  onClose,
  preview,
  preparation,
}: ReportPanelControllerProps) {
  if (state.type === "closed") return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  if (state.type === "owner-preview") {
    return (
      <OwnerReportPreviewSheet
        open
        onOpenChange={handleOpenChange}
        {...preview}
      />
    );
  }

  return (
    <OwnerPreparationSheet
      open
      initialSourceKey={state.sourceKey}
      onOpenChange={handleOpenChange}
      {...preparation}
    />
  );
}
