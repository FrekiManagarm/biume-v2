
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CalendarClockIcon,
  ChevronLeftIcon,
  SaveIcon,
  EyeIcon,
  KeyboardIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  Maximize2Icon,
  Minimize2Icon,
  HomeIcon,
} from "lucide-react";
import { cn } from "@/lib/style";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
  focusMode = false,
  onToggleFocusMode,
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
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  appointment?: {
    beginAt: Date;
    endAt: Date;
    status?: string | null;
    atHome?: boolean | null;
  };
}) {
  const getAppointmentStatus = (status?: string | null) => {
    switch (status) {
      case "CONFIRMED":
        return { label: "Confirmé", className: "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-300/90 dark:bg-emerald-900/30 dark:border-emerald-800" };
      case "COMPLETED":
        return { label: "Terminé", className: "text-primary-foreground bg-primary/15 border-primary/20" };
      case "CANCELLED":
        return { label: "Annulé", className: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800" };
      case "CREATED":
        return { label: "En attente", className: "text-muted-foreground bg-muted/40 border-muted" };
      default:
        return null;
    }
  };

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
    })}${appointmentEnd
      ? ` - ${appointmentEnd.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
      : ""
    }`
    : undefined;

  const appointmentStatus = getAppointmentStatus(appointment?.status);

  const getProgressPercentage = () => {
    const totalTabs = categories.reduce((acc, cat) => acc + cat.tabs.length, 0);
    const completedTabs = categories.reduce(
      (acc, cat) =>
        acc + cat.tabs.filter((tab) => getTabProgress(String(tab.id))).length,
      0,
    );
    return { completed: completedTabs, total: totalTabs };
  };

  const progress = getProgressPercentage();
  const progressPercent =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  return (
    <TooltipProvider delayDuration={300}>
      <Card
        className={cn(
          "flex flex-col p-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-full",
        )}
        data-state={isCollapsed ? "collapsed" : "expanded"}
      >
        <CardContent className="flex flex-col h-full gap-0 p-4">
          {/* Header */}
          <div>
            <div
              className={cn(
                "flex items-center gap-3",
                isCollapsed ? "justify-center flex-col" : "justify-between",
              )}
            >
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onGoBack}
                      className="h-9 w-9 shrink-0"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Retour</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                {!focusMode && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative inline-flex items-center justify-center">
                        <svg
                          width={isCollapsed ? 40 : 48}
                          height={isCollapsed ? 40 : 48}
                          className="shrink-0 transition-all duration-300"
                        >
                          <title>Progression: {progressPercent}%</title>
                          {/* Cercle de fond */}
                          <circle
                            cx={isCollapsed ? 20 : 24}
                            cy={isCollapsed ? 20 : 24}
                            r={isCollapsed ? 16 : 20}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            className="text-muted-foreground/30"
                          />
                          {/* Cercle de progression */}
                          <circle
                            cx={isCollapsed ? 20 : 24}
                            cy={isCollapsed ? 20 : 24}
                            r={isCollapsed ? 16 : 20}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * (isCollapsed ? 16 : 20)}`}
                            strokeDashoffset={
                              2 *
                              Math.PI *
                              (isCollapsed ? 16 : 20) *
                              (1 - progress.completed / progress.total)
                            }
                            className="text-primary transition-all duration-300 ease-in-out"
                            transform={`rotate(-90 ${isCollapsed ? 20 : 24} ${isCollapsed ? 20 : 24})`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className={cn(
                              "font-semibold text-foreground transition-all duration-300",
                              isCollapsed ? "text-[10px]" : "text-xs",
                            )}
                          >
                            {progressPercent}%
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>
                        Progression: {progress.completed}/{progress.total}{" "}
                        sections complétées
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {!isCollapsed && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleCollapse}
                        className="h-9 w-9 shrink-0"
                      >
                        <PanelLeftCloseIcon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Réduire la barre latérale</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {isCollapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleCollapse}
                      className="h-9 w-9 shrink-0"
                    >
                      <PanelLeftOpenIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Agrandir la barre latérale</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <Separator className="my-3" />

          {/* Navigation */}
          <nav
            className={cn(
              "py-2 space-y-4 overflow-hidden",
              isCollapsed && "overflow-visible",
            )}
          >
            {!focusMode && !isCollapsed && (
              <div className="flex flex-col items-start gap-3">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="title"
                    className="pl-2 text-xs font-medium text-muted-foreground"
                  >
                    Titre
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => onTitleChange?.(e.target.value)}
                    placeholder="Titre du rapport"
                    className="text-base font-semibold h-9"
                  />
                  {hasUnsavedChanges && (
                    <div
                      className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shrink-0"
                      title="Modifications non sauvegardées"
                    />
                  )}
                </div>
              </div>
            )}

            {appointment && !isCollapsed && (
              <div className="w-full rounded-lg border bg-muted/40 px-3 py-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Rendez-vous lié
                    </span>
                  </div>
                  {appointmentStatus && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 px-2 text-[11px] font-medium",
                        appointmentStatus.className,
                      )}
                    >
                      {appointmentStatus.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground leading-tight">
                      {appointmentDateLabel || "Date non définie"}
                    </span>
                    {appointmentTimeLabel && (
                      <span className="text-xs text-muted-foreground">
                        {appointmentTimeLabel}
                      </span>
                    )}
                  </div>
                  {appointment.atHome && (
                    <Badge
                      variant="secondary"
                      className="h-6 px-2 text-[11px] font-medium gap-1"
                    >
                      <HomeIcon className="h-3.5 w-3.5" />
                      À domicile
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {!focusMode && !isCollapsed && <Separator className="my-3" />}

            {appointment && isCollapsed && (
              <div className="flex justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shrink-0 hover:from-primary/30 hover:to-primary/20 transition-all group relative cursor-default">
                      <CalendarClockIcon className="h-4 w-4 text-primary" />
                      {appointmentStatus && (
                        <div
                          className={cn(
                            "absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-semibold",
                            appointmentStatus.className,
                          )}
                        >
                          ·
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="flex flex-col gap-1.5 max-w-[220px]"
                  >
                    <p className="font-medium text-sm">Rendez-vous lié</p>
                    {appointmentDateLabel && (
                      <p className="text-xs text-muted-foreground">
                        {appointmentDateLabel}
                      </p>
                    )}
                    {appointmentTimeLabel && (
                      <p className="text-xs text-muted-foreground">
                        {appointmentTimeLabel}
                      </p>
                    )}
                    {appointment.atHome && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <HomeIcon className="h-3 w-3" />
                        <span>À domicile</span>
                      </div>
                    )}
                    {appointmentStatus && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-semibold">{appointmentStatus.label}</span>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {categories.map((category) => (
              <div key={category.id} className="space-y-4">
                {!focusMode && !isCollapsed && (
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {category.name}
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    "space-y-2",
                    isCollapsed && "flex flex-col items-center",
                  )}
                >
                  {category.tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const hasProgress = getTabProgress(String(tab.id));
                    const count = getTabCount(String(tab.id));
                    const isCompleted = hasProgress && count > 0;

                    const tabButton = (
                      <button
                        key={String(tab.id)}
                        onClick={() => onChangeTab(tab.id as TabId)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg group transition-all duration-300",
                          isCollapsed
                            ? "w-10 h-10 justify-center p-0 relative"
                            : "w-full px-3 py-3",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted/50",
                        )}
                      >
                        {isCollapsed ? (
                          <>
                            <div className="shrink-0 text-primary-foreground">
                              {tab.icon}
                            </div>
                            {count > 0 && (
                              <div
                                className={cn(
                                  "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold",
                                  isActive
                                    ? "bg-primary-foreground text-primary"
                                    : isCompleted
                                      ? "bg-green-500 text-white"
                                      : "bg-muted-foreground text-background",
                                )}
                              >
                                {count}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex-1 flex items-center gap-2 min-w-0">
                              <div className="shrink-0 text-primary-foreground">
                                {tab.icon}
                              </div>
                              <span className="font-medium text-sm truncate text-primary-foreground">
                                {tab.label}
                              </span>
                            </div>

                            {count > 0 && (
                              <Badge
                                variant={isActive ? "secondary" : "outline"}
                                className={cn(
                                  "h-5 px-2 text-xs font-medium shrink-0",
                                  isActive
                                    ? "bg-primary-foreground/20 text-primary-foreground border-0"
                                    : isCompleted
                                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                                      : "",
                                )}
                              >
                                {count}
                              </Badge>
                            )}
                          </>
                        )}
                      </button>
                    );

                    if (isCollapsed) {
                      return (
                        <Tooltip key={String(tab.id)}>
                          <TooltipTrigger asChild>{tabButton}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="flex flex-col gap-1"
                          >
                            <p className="font-medium">{tab.label}</p>
                            {count > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {count} élément{count > 1 ? "s" : ""}
                              </p>
                            )}
                            {isCompleted && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                ✓ Complété
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return tabButton;
                  })}
                </div>
              </div>
            ))}
          </nav>

          <Separator className="my-3" />

          {/* Actions */}
          <div
            className={cn(
              "space-y-2 pb-2",
              isCollapsed && "flex flex-col items-center",
            )}
          >
            {!focusMode && !isCollapsed && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreview}
                  className="h-9 text-xs"
                >
                  <EyeIcon className="h-3.5 w-3.5 mr-1.5" />
                  Aperçu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShortcuts}
                  className="h-9 text-xs"
                >
                  <KeyboardIcon className="h-3.5 w-3.5 mr-1.5" />
                  Raccourcis
                </Button>
              </div>
            )}

            {!focusMode && isCollapsed && (
              <div className="flex flex-col gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onPreview}
                      className="h-10 w-10"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Aperçu</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onShortcuts}
                      className="h-10 w-10"
                    >
                      <KeyboardIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Raccourcis clavier</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {onToggleFocusMode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={focusMode ? "default" : "outline"}
                    size={isCollapsed ? "icon" : "sm"}
                    onClick={onToggleFocusMode}
                    className={cn(
                      "font-medium transition-all duration-300",
                      isCollapsed ? "h-10 w-10" : "w-full h-10",
                    )}
                  >
                    {focusMode ? (
                      <>
                        <Minimize2Icon
                          className={cn("h-4 w-4", !isCollapsed && "mr-2")}
                        />
                        {!isCollapsed && "Quitter le mode focus"}
                      </>
                    ) : (
                      <>
                        <Maximize2Icon
                          className={cn("h-4 w-4", !isCollapsed && "mr-2")}
                        />
                        {!isCollapsed && "Mode focus"}
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>{focusMode ? "Quitter le mode focus" : "Mode focus"}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size={isCollapsed ? "icon" : "sm"}
                  onClick={onSave}
                  disabled={isSaving}
                  className={cn(
                    "font-medium transition-all duration-300",
                    isCollapsed ? "h-10 w-10" : "w-full h-10",
                  )}
                >
                  <SaveIcon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed &&
                    (isSaving ? "Enregistrement..." : "Finaliser le rapport")}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>
                    {isSaving ? "Enregistrement..." : "Finaliser le rapport"}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>

            {isCollapsed && hasUnsavedChanges && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Modifications non sauvegardées</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
