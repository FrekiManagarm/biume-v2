import {
  ActivityIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClipboardListIcon,
  FileTextIcon,
  KeyboardIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/style";
import type { OwnerContentStatus, ReportSectionId } from "../owner-content";
import type { ProfessionalSectionStatus } from "../reports-editor.helpers";

type ReportTab = {
  id: ReportSectionId;
  label: string;
  count: number;
  professionalStatus: ProfessionalSectionStatus;
};

const professionalStatusPresentation: Record<
  ProfessionalSectionStatus,
  { label: string; className: string }
> = {
  empty: { label: "Vide", className: "text-primary-foreground/60" },
  "in-progress": { label: "En cours", className: "text-primary-foreground/85" },
  complete: { label: "Complet", className: "text-emerald-200" },
};

const tabIcons = {
  clinical: ClipboardListIcon,
  anatomical: ActivityIcon,
  recommendations: CheckIcon,
  notes: FileTextIcon,
};

const ownerStatusPresentation: Record<
  OwnerContentStatus,
  { label: string; className: string }
> = {
  ready: {
    label: "Prêt",
    className: "bg-emerald-100 text-emerald-900 ring-emerald-300/60",
  },
  missing: {
    label: "À préparer",
    className: "bg-amber-100 text-amber-900 ring-amber-300/60",
  },
  stale: {
    label: "À actualiser",
    className: "bg-amber-100 text-amber-900 ring-amber-300/60",
  },
};

export function ReportSidebarNavigation({
  tabs,
  activeTab,
  onChangeTab,
  onGoBack,
  onShortcuts,
  ownerStatuses,
  pendingOwnerCount,
  onPrepareOwnerContent,
  isPreparationDisabled = false,
  isCollapsed = false,
  onToggleCollapse,
}: {
  tabs: ReportTab[];
  activeTab: ReportSectionId;
  onChangeTab: (tab: ReportSectionId) => void;
  onGoBack: () => void;
  onShortcuts: () => void;
  ownerStatuses: Record<ReportSectionId, OwnerContentStatus | "not-applicable">;
  pendingOwnerCount: number;
  onPrepareOwnerContent: () => void;
  isPreparationDisabled?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const completedCount = tabs.filter(
    (tab) => tab.professionalStatus === "complete",
  ).length;
  const progressPercent = Math.round((completedCount / tabs.length) * 100);
  const controlClassName =
    "h-11 w-11 shrink-0 rounded-xl text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground";

  return (
    <TooltipProvider delay={300}>
      <aside
        className={cn(
          "flex min-h-0 flex-col overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-sm transition-[width,padding] duration-200",
          isCollapsed ? "w-[72px] p-3" : "w-72 p-4",
        )}
        data-state={isCollapsed ? "collapsed" : "expanded"}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b border-primary-foreground/15 pb-4",
            isCollapsed ? "flex-col" : "justify-between",
          )}
        >
          <SidebarTooltip label="Retour">
            <Button
              variant="ghost"
              size="icon"
              onClick={onGoBack}
              aria-label="Retour"
              className={controlClassName}
            >
              <ChevronLeftIcon className="size-5" />
            </Button>
          </SidebarTooltip>

          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Compte rendu</p>
              <p className="mt-0.5 text-xs text-primary-foreground/70">
                {progressPercent}% complété
              </p>
            </div>
          ) : null}

          <div className={cn("flex gap-1", isCollapsed && "flex-col gap-2")}>
            <SidebarTooltip label="Raccourcis clavier">
              <Button
                variant="ghost"
                size="icon"
                onClick={onShortcuts}
                aria-label="Raccourcis clavier"
                className={controlClassName}
              >
                <KeyboardIcon className="size-4" />
              </Button>
            </SidebarTooltip>
            <SidebarTooltip
              label={
                isCollapsed
                  ? "Agrandir la barre latérale"
                  : "Réduire la barre latérale"
              }
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                aria-label={
                  isCollapsed
                    ? "Agrandir la barre latérale"
                    : "Réduire la barre latérale"
                }
                className={controlClassName}
              >
                {isCollapsed ? (
                  <PanelLeftOpenIcon className="size-5" />
                ) : (
                  <PanelLeftCloseIcon className="size-5" />
                )}
              </Button>
            </SidebarTooltip>
          </div>
        </div>

        <nav
          className={cn(
            "min-h-0 flex-1 space-y-2 overflow-y-auto py-4",
            isCollapsed && "flex w-full flex-col items-center",
          )}
        >
          {tabs.map((tab) => {
            const Icon = tabIcons[tab.id];
            const isActive = activeTab === tab.id;
            const ownerStatus = ownerStatuses[tab.id];
            const status =
              ownerStatus === "not-applicable"
                ? null
                : ownerStatusPresentation[ownerStatus];
            const professionalStatus =
              professionalStatusPresentation[tab.professionalStatus];
            const button = (
              <button
                key={tab.id}
                type="button"
                aria-label={isCollapsed ? tab.label : undefined}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onChangeTab(tab.id)}
                className={cn(
                  "flex items-center rounded-xl text-left transition-colors",
                  isCollapsed
                    ? "h-11 w-11 justify-center"
                    : "w-full gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-primary-foreground text-primary ring-2 ring-primary-foreground/30"
                    : "text-primary-foreground hover:bg-primary-foreground/10",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!isCollapsed ? (
                  <>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {tab.label}
                      <span
                        className="ml-2 text-xs font-normal opacity-75"
                        aria-label={`${tab.label} : ${tab.count} éléments`}
                      >
                        {tab.count}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[10px] font-medium",
                          isActive && tab.professionalStatus === "complete"
                            ? "text-emerald-700"
                            : isActive
                              ? "text-primary/75"
                              : professionalStatus.className,
                        )}
                      >
                        {professionalStatus.label}
                      </span>
                    </span>
                    {status ? (
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                    ) : null}
                  </>
                ) : null}
              </button>
            );

            return isCollapsed ? (
              <SidebarTooltip key={tab.id} label={tab.label}>
                {button}
              </SidebarTooltip>
            ) : (
              button
            );
          })}
        </nav>

        <SidebarTooltip
          label={`${pendingOwnerCount} contenus à préparer`}
          disabled={!isCollapsed}
        >
          <Button
            type="button"
            onClick={onPrepareOwnerContent}
            disabled={isPreparationDisabled}
            className={cn(
              "border border-primary-foreground/20 bg-primary-foreground text-primary hover:bg-primary-foreground/90 focus-visible:ring-primary",
              isCollapsed ? "h-11 w-11 self-center px-0" : "h-auto w-full py-3",
            )}
            aria-label={
              isCollapsed
                ? `${pendingOwnerCount} contenus à préparer`
                : undefined
            }
          >
            <SparklesIcon className="size-4" />
            {!isCollapsed ? `${pendingOwnerCount} contenus à préparer` : null}
          </Button>
        </SidebarTooltip>
      </aside>
    </TooltipProvider>
  );
}

function SidebarTooltip({
  label,
  children,
  disabled = false,
}: {
  label: string;
  children: React.ReactElement;
  disabled?: boolean;
}) {
  if (disabled) return children;
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
