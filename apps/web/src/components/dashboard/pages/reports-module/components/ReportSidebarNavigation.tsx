import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarClockIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  EyeIcon,
  HomeIcon,
  KeyboardIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SaveIcon,
} from "lucide-react";

import { cn } from "@/lib/style";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TabId = "clinical" | "anatomical" | "recommendations" | "notes";

export type SidebarCategory = {
  id: string;
  name: string;
  icon: ReactNode;
  tabs: Array<{
    id: TabId | string;
    label: string;
    icon: ReactNode;
  }>;
};

export function ReportSidebarNavigation({
  title,
  categories,
  activeTab,
  onChangeTab,
  onGoBack,
  onPreview,
  onShortcuts,
  onSave,
  isSaving,
  getTabProgress,
  getTabCount,
  hasUnsavedChanges,
  onTitleChange,
  isCollapsed = false,
  onToggleCollapse,
  appointment,
}: {
  title: string;
  categories: SidebarCategory[];
  activeTab: TabId | string;
  onChangeTab: (tab: TabId) => void;
  onGoBack: () => void;
  onPreview: () => void;
  onShortcuts: () => void;
  onSave: () => void;
  isSaving: boolean;
  getTabProgress: (tabId: string) => boolean;
  getTabCount: (tabId: string) => number;
  hasUnsavedChanges: boolean;
  onTitleChange?: (title: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  appointment?: {
    beginAt: Date;
    endAt: Date;
    status?: string | null;
    atHome?: boolean | null;
  };
}) {
  const parseDate = (value?: Date) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const appointmentStart = appointment ? parseDate(appointment.beginAt) : null;
  const appointmentEnd = appointment ? parseDate(appointment.endAt) : null;
  const appointmentDateLabel = appointmentStart
    ? new Intl.DateTimeFormat("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(appointmentStart)
    : undefined;
  const appointmentTimeLabel = appointmentStart
    ? `${appointmentStart.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}${
        appointmentEnd
          ? ` - ${appointmentEnd.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : ""
      }`
    : undefined;

  const statusLabel =
    appointment?.status === "CONFIRMED"
      ? "Confirmé"
      : appointment?.status === "COMPLETED"
        ? "Terminé"
        : appointment?.status === "CANCELLED"
          ? "Annulé"
          : appointment?.status === "CREATED"
            ? "En attente"
            : null;

  const progress = categories.reduce(
    (acc, category) => {
      acc.total += category.tabs.length;
      acc.completed += category.tabs.filter((tab) =>
        getTabProgress(String(tab.id)),
      ).length;
      return acc;
    },
    { completed: 0, total: 0 },
  );
  const progressPercent =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  const actionButtonClass =
    "h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98]";
  const collapsedControlClass =
    "h-11 w-11 rounded-xl text-slate-500 shadow-none hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98]";

  return (
    <TooltipProvider delay={300}>
      <aside
        className={cn(
          "flex min-h-0 flex-col rounded-[1.5rem] border border-slate-200 bg-white text-slate-950 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)] transition-all duration-200 ease-out",
          isCollapsed ? "w-[72px] p-2" : "w-full p-4",
        )}
        data-state={isCollapsed ? "collapsed" : "expanded"}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b border-slate-200 pb-4",
            isCollapsed ? "flex-col" : "justify-between",
          )}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onGoBack}
                  aria-label="Retour"
                  className={cn(
                    isCollapsed
                      ? collapsedControlClass
                      : "h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </Button>
              }
            />
            <TooltipContent side="right">
              <p>Retour</p>
            </TooltipContent>
          </Tooltip>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Édition du rapport
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {progressPercent}% complété
              </p>
            </div>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  aria-label={
                    isCollapsed
                      ? "Agrandir la barre latérale"
                      : "Réduire la barre latérale"
                  }
                  className={cn(
                    isCollapsed
                      ? collapsedControlClass
                      : "h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  {isCollapsed ? (
                    <PanelLeftOpenIcon className="h-5 w-5" />
                  ) : (
                    <PanelLeftCloseIcon className="h-5 w-5" />
                  )}
                </Button>
              }
            />
            <TooltipContent side="right">
              <p>
                {isCollapsed
                  ? "Agrandir la barre latérale"
                  : "Réduire la barre latérale"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {!isCollapsed && (
          <div className="space-y-4 border-b border-slate-200 py-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="title"
                className="text-xs font-semibold text-slate-500"
              >
                Titre
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => onTitleChange?.(event.target.value)}
                placeholder="Titre du rapport"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-[15px] font-semibold text-slate-950 shadow-none focus-visible:ring-2 focus-visible:ring-emerald-600/20"
              />
              {hasUnsavedChanges && (
                <p className="text-xs font-semibold text-amber-700">
                  Modifications non sauvegardées
                </p>
              )}
            </div>

            {appointment && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarClockIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">Rendez-vous</span>
                  </div>
                  {statusLabel && (
                    <Badge
                      variant="outline"
                      className="h-6 rounded-full border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600"
                    >
                      {statusLabel}
                    </Badge>
                  )}
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {appointmentDateLabel || "Date non définie"}
                    </p>
                    {appointmentTimeLabel && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {appointmentTimeLabel}
                      </p>
                    )}
                  </div>
                  {appointment.atHome && (
                    <Badge
                      variant="outline"
                      className="h-7 shrink-0 gap-1 rounded-full border-emerald-200 bg-emerald-50 px-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50"
                    >
                      <HomeIcon className="h-3.5 w-3.5" />À domicile
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {isCollapsed && appointment && (
          <div className="flex justify-center border-b border-slate-200 py-3">
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <CalendarClockIcon className="h-4 w-4" />
                  </div>
                }
              />
              <TooltipContent side="right">
                <p>Rendez-vous</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-4">
          {!isCollapsed && (
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">Sections</p>
              <p className="text-xs font-medium text-slate-500">
                {progress.completed}/{progress.total}
              </p>
            </div>
          )}

          <div
            className={cn(
              "space-y-5",
              isCollapsed && "flex flex-col items-center space-y-3",
            )}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                className={cn(
                  "space-y-2",
                  isCollapsed && "flex flex-col items-center",
                )}
              >
                {!isCollapsed && (
                  <div className="flex items-center gap-2 px-1 text-slate-500">
                    <span className="[&_svg]:h-4 [&_svg]:w-4">
                      {category.icon}
                    </span>
                    <span className="text-xs font-medium">{category.name}</span>
                  </div>
                )}

                {category.tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const count = getTabCount(String(tab.id));
                  const isCompleted =
                    getTabProgress(String(tab.id)) && count > 0;

                  const tabButton = (
                    <button
                      key={String(tab.id)}
                      type="button"
                      onClick={() => onChangeTab(tab.id as TabId)}
                      className={cn(
                        "group flex items-center rounded-xl text-left transition-all duration-200 active:scale-[0.98]",
                        isCollapsed
                          ? "relative h-11 w-11 justify-center"
                          : "w-full gap-3 px-3 py-2.5",
                        isActive
                          ? "bg-slate-950 text-white shadow-[0_18px_35px_-24px_rgba(15,23,42,0.8)]"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                      )}
                      aria-label={isCollapsed ? tab.label : undefined}
                    >
                      <span
                        className={cn(
                          "shrink-0 [&_svg]:h-4 [&_svg]:w-4",
                          isActive ? "text-white" : "text-slate-500",
                        )}
                      >
                        {tab.icon}
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {tab.label}
                          </span>
                          {count > 0 && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-5 rounded-full px-2 text-[11px]",
                                isActive
                                  ? "border-white/20 bg-white/10 text-white"
                                  : isCompleted
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-slate-200 text-slate-500",
                              )}
                            >
                              {count}
                            </Badge>
                          )}
                          {isCompleted && count === 0 && (
                            <CheckCircle2Icon className="h-4 w-4 text-emerald-700" />
                          )}
                        </>
                      )}
                      {isCollapsed && count > 0 && (
                        <span
                          className={cn(
                            "absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                            isActive
                              ? "bg-white text-slate-950"
                              : "bg-emerald-600 text-white",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={String(tab.id)}>
                        <TooltipTrigger render={tabButton} />
                        <TooltipContent side="right">
                          <p>{tab.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return tabButton;
                })}
              </div>
            ))}
          </div>
        </nav>

        <div
          className={cn(
            "mt-auto border-t border-slate-200 pt-3",
            isCollapsed ? "flex flex-col items-center gap-2" : "space-y-3",
          )}
        >
          {!isCollapsed && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
                className={actionButtonClass}
              >
                <EyeIcon className="mr-1.5 h-4 w-4" />
                Aperçu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onShortcuts}
                className={actionButtonClass}
              >
                <KeyboardIcon className="mr-1.5 h-4 w-4" />
                Raccourcis
              </Button>
            </div>
          )}

          {isCollapsed && (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onPreview}
                      aria-label="Aperçu"
                      className={cn("border-slate-200", collapsedControlClass)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  }
                />
                <TooltipContent side="right">
                  <p>Aperçu</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onShortcuts}
                      aria-label="Raccourcis clavier"
                      className={cn("border-slate-200", collapsedControlClass)}
                    >
                      <KeyboardIcon className="h-4 w-4" />
                    </Button>
                  }
                />
                <TooltipContent side="right">
                  <p>Raccourcis clavier</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="default"
                  size={isCollapsed ? "icon" : "sm"}
                  onClick={onSave}
                  disabled={isSaving}
                  aria-label={isCollapsed ? "Finaliser le rapport" : undefined}
                  className={cn(
                    "rounded-xl bg-slate-950 font-semibold text-white shadow-none hover:bg-slate-800 active:scale-[0.98]",
                    isCollapsed ? "h-11 w-11" : "h-10 w-full",
                  )}
                >
                  <SaveIcon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed &&
                    (isSaving ? "Enregistrement..." : "Finaliser le rapport")}
                </Button>
              }
            />
            {isCollapsed && (
              <TooltipContent side="right">
                <p>{isSaving ? "Enregistrement..." : "Finaliser le rapport"}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
