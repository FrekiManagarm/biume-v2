"use client";

import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  organization,
  signOut,
  useActiveOrganization,
} from "#/lib/auth-client";
import { proMenuList, type Menu, type Submenu } from "#/lib/menu-list";
import {
  AlertCircle,
  Building,
  Check,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  Plus,
  User,
} from "lucide-react";
import { Sidebar, useSidebar } from "#/components/ui/sidebar";
import { cn } from "@biume/ui/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@biume/ui/components/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@biume/ui/components/avatar";
import { AccountSwitchDialog } from "../dialogs/account-switch-dialog";
import { toast } from "sonner";
import { Credenza } from "@biume/ui/components/credenza";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@biume/ui/components/collapsible";
import type { AuthSession } from "@biume/auth";
import type { Organization, User as UserType } from "@biume/db/schema/index";
import { useCustomer } from "autumn-js/react";
import { UserProfileDialog } from "../dialogs/user-profile-dialog";

interface DashboardSidebarProps {
  session: AuthSession;
  organizations: Organization[];
}

const itemBaseClassName =
  "group/nav relative flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground/72 outline-none transition-[background,color,box-shadow,transform] duration-200 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0";

const itemActiveClassName =
  "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_10px_24px_hsl(168_44%_14%/0.16)] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-[hsl(160_55%_64%)] hover:bg-sidebar-primary hover:text-sidebar-primary-foreground group-data-[collapsible=icon]:before:top-auto group-data-[collapsible=icon]:before:bottom-1 group-data-[collapsible=icon]:before:left-1/2 group-data-[collapsible=icon]:before:h-1 group-data-[collapsible=icon]:before:w-4 group-data-[collapsible=icon]:before:-translate-x-1/2";

const iconClassName =
  "size-4 shrink-0 text-sidebar-foreground/62 transition-colors group-hover/nav:text-sidebar-accent-foreground group-data-[active=true]/nav:text-[hsl(160_55%_64%)]";

export function DashboardSidebar({
  session,
  organizations,
}: DashboardSidebarProps) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();
  const { data: activeOrganization } = useActiveOrganization();
  const { state, isMobile } = useSidebar();
  const [switchingOrg, setSwitchingOrg] = useState<string | null>(null);
  const [showProfessionalDialog, setShowProfessionalDialog] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredenza, setShowCredenza] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { refetch } = useCustomer();

  const menuGroups = proMenuList(pathname || "");
  const isCollapsed = state === "collapsed" && !isMobile;

  const handleOrganizationSwitch = async (orgId: string) => {
    setSwitchingOrg(orgId);
    setActiveOrgId(orgId);
    setIsLoading(true);
    setShowProfessionalDialog(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const result = await organization.setActive({
        organizationId: orgId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      await refetch();

      await navigate({ to: "/dashboard" });
      setIsLoading(false);
    } catch (error) {
      console.error("Error changing organization:", error);
      toast.error("Erreur lors du changement de compte", {
        description: "Veuillez réessayer",
        icon: <AlertCircle className="h-5 w-5 text-white" />,
      });
      setShowProfessionalDialog(false);
    } finally {
      setSwitchingOrg(null);
    }
  };

  const OrganizationMark = ({ className }: { className?: string }) => (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
        className,
      )}
    >
      {activeOrganization?.logo ? (
        <img
          src={activeOrganization.logo}
          alt={activeOrganization.name ?? ""}
          width={36}
          height={36}
          className="size-full object-cover"
        />
      ) : (
        <Building className="size-4" />
      )}
    </div>
  );

  const NavLink = ({
    menu,
    className,
  }: {
    menu: Menu | Submenu;
    className?: string;
  }) => {
    const Icon = menu.icon;

    return (
      <Link
        to={menu.href}
        title={isCollapsed ? menu.label : undefined}
        data-active={menu.active ? true : undefined}
        className={cn(
          itemBaseClassName,
          menu.active && itemActiveClassName,
          className,
        )}
      >
        <Icon
          className={cn(
            iconClassName,
            menu.active && "text-[hsl(160_55%_64%)]",
          )}
        />
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {menu.label}
        </span>
      </Link>
    );
  };

  const CollapsedSubMenu = ({ menu }: { menu: Menu }) => {
    const Icon = menu.icon;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              title={menu.label}
              data-active={menu.active ? true : undefined}
              className={cn(itemBaseClassName, menu.active && itemActiveClassName)}
            >
              <Icon
                className={cn(
                  iconClassName,
                  menu.active && "text-[hsl(160_55%_64%)]",
                )}
              />
              <span className="sr-only">{menu.label}</span>
            </button>
          }
        />
        <DropdownMenuContent side="right" align="start" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{menu.label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {menu.submenus?.map((submenu) => (
              <DropdownMenuItem
                key={submenu.href}
                render={
                  <Link
                    to={submenu.href}
                    className={cn(
                      "flex items-center gap-2",
                      submenu.active &&
                        "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                  >
                    <submenu.icon className="size-4" />
                    <span>{submenu.label}</span>
                  </Link>
                }
              />
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const ExpandedSubMenu = ({ menu }: { menu: Menu }) => {
    const Icon = menu.icon;

    return (
      <Collapsible defaultOpen={menu.active}>
        <CollapsibleTrigger
          render={
            <button
              type="button"
              data-active={menu.active ? true : undefined}
              className={cn(itemBaseClassName, menu.active && itemActiveClassName)}
            >
              <Icon
                className={cn(
                  iconClassName,
                  menu.active && "text-[hsl(160_55%_64%)]",
                )}
              />
              <span className="truncate">{menu.label}</span>
              <ChevronRight className="ml-auto size-4 text-sidebar-foreground/42 transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </button>
          }
        />
        <CollapsibleContent>
          <ul className="ml-4 mt-1 grid gap-1 border-l border-sidebar-border/80 pl-3">
            {menu.submenus?.map((submenu) => (
              <li key={submenu.href}>
                <NavLink menu={submenu} className="h-8 text-xs" />
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const NavItem = ({ menu }: { menu: Menu }) => {
    if (menu.submenus) {
      return isCollapsed ? (
        <CollapsedSubMenu menu={menu} />
      ) : (
        <ExpandedSubMenu menu={menu} />
      );
    }

    return <NavLink menu={menu} />;
  };

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-sidebar-border bg-sidebar"
    >
      <div className="flex size-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-3 pb-3 pt-3 group-data-[collapsible=icon]:px-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  title={isCollapsed ? activeOrganization?.name : undefined}
                  className="flex h-14 w-full items-center gap-3 rounded-md border border-sidebar-border/80 bg-sidebar-accent/45 px-2.5 text-left shadow-[0_1px_0_hsl(154_24%_84%/0.7)] outline-none transition-colors duration-200 hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none"
                >
                  <OrganizationMark className="group-data-[collapsible=icon]:size-9" />
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <span className="block truncate text-sm font-semibold text-sidebar-foreground">
                      {activeOrganization?.name}
                    </span>
                    <span className="block truncate text-xs text-sidebar-foreground/55">
                      Compte professionnel
                    </span>
                  </div>
                  <ChevronsUpDown className="size-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
                </button>
              }
            />
            <DropdownMenuContent
              align="end"
              side={isMobile ? "bottom" : "right"}
              className="w-64 rounded-lg border border-border/40 p-2 shadow-lg animate-in fade-in-50 zoom-in-95 slide-in-from-top-5 duration-200"
            >
              {organizations && organizations.length > 0 && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Comptes professionnels
                    </DropdownMenuLabel>
                    <div className="my-1 max-h-50 space-y-0.5 overflow-y-auto rounded-md pr-1">
                      {organizations.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          className={cn(
                            "group flex cursor-pointer items-center gap-3 rounded-md p-2 transition-all duration-200",
                            activeOrganization?.id === org.id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                              : "hover:bg-sidebar-accent hover:translate-x-1 hover:shadow-sm",
                            switchingOrg === org.id && "animate-pulse opacity-70",
                          )}
                          onSelect={() => handleOrganizationSwitch(org.id)}
                          disabled={switchingOrg !== null}
                        >
                          {org.logo ? (
                            <div
                              className={cn(
                                "size-8 shrink-0 overflow-hidden rounded-md shadow-sm transition-all duration-300",
                                activeOrganization?.id === org.id
                                  ? "ring-2 ring-sidebar-primary/30"
                                  : "ring-1 ring-sidebar-border/50 hover:ring-sidebar-primary/20",
                              )}
                            >
                              <img
                                src={org.logo}
                                alt={org.name}
                                width={32}
                                height={32}
                                className={cn(
                                  "size-full object-cover transition-transform duration-300",
                                  activeOrganization?.id !== org.id &&
                                    "hover:scale-110",
                                )}
                              />
                            </div>
                          ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/15 transition-colors duration-300 hover:bg-sidebar-primary/20">
                              <Building className="size-4 text-sidebar-primary" />
                            </div>
                          )}
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium leading-none">
                              {org.name}
                            </span>
                            <span className="mt-1 truncate text-xs text-muted-foreground">
                              Compte professionnel
                            </span>
                          </div>
                          {activeOrganization?.id === org.id && (
                            <Check className="ml-auto size-4 text-sidebar-primary animate-in zoom-in-50 duration-300" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuGroup>
                  <DropdownMenuGroup>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Nouvelle entreprise
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setShowCredenza(true)}
                      className="group flex cursor-pointer items-center gap-3 rounded-md p-2 transition-all duration-200 hover:bg-sidebar-accent hover:translate-x-1 hover:shadow-sm"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/15 transition-colors duration-300 hover:bg-sidebar-primary/20">
                        <Plus className="size-4 text-sidebar-primary" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium leading-none">
                          Créer une entreprise
                        </span>
                        <span className="mt-1 truncate text-xs text-muted-foreground">
                          Devenez professionnel
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mx-3 h-px bg-sidebar-border/70 group-data-[collapsible=icon]:mx-2" />

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:px-1.5">
          <div className="grid gap-3 group-data-[collapsible=icon]:gap-2">
            {menuGroups.map((group, groupIndex) => (
              <section
                key={`${group.groupLabel}-${groupIndex}`}
                className="grid gap-1"
              >
                {group.groupLabel ? (
                  <div className="px-3 pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/44 group-data-[collapsible=icon]:sr-only">
                    {group.groupLabel}
                  </div>
                ) : null}
                <ul className="grid gap-1">
                  {group.menus.map((menu) => (
                    <li key={menu.href}>
                      <NavItem menu={menu} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </nav>

        <div className="mx-3 mb-3 border-t border-sidebar-border/70 pt-3 group-data-[collapsible=icon]:mx-1.5 group-data-[collapsible=icon]:mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  title={isCollapsed ? session.user.name : undefined}
                  className="flex h-12 w-full items-center gap-3 rounded-md px-2 text-left text-sidebar-foreground/78 outline-none transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                >
                  <Avatar className="size-8 rounded-md ring-1 ring-sidebar-border">
                    <AvatarImage
                      src={session.user.image ?? ""}
                      alt={session.user.name ?? ""}
                    />
                    <AvatarFallback className="rounded-md bg-sidebar-primary/15 text-sidebar-primary">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="block truncate font-medium">
                      {session.user.name}
                    </span>
                    <span className="block truncate text-xs text-sidebar-foreground/52">
                      {session.user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="size-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
                </button>
              }
            />
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-md ring-1 ring-sidebar-border">
                      <AvatarImage
                        src={session.user.image ?? ""}
                        alt={session.user.name}
                      />
                      <AvatarFallback className="rounded-md bg-sidebar-primary/15 text-sidebar-primary">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {session.user.name}
                      </span>
                      <span className="truncate text-xs">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="size-4" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-red-500 group"
                  onClick={async () => {
                    await signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          void navigate({ to: "/signin" });
                        },
                      },
                    });
                  }}
                >
                  <LogOut className="size-4 text-red-500 group-hover:text-white" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AccountSwitchDialog
        open={showProfessionalDialog}
        onOpenChange={setShowProfessionalDialog}
        type="professional"
        organizationName={
          organizations?.find((org) => org.id === activeOrgId)?.name
        }
        isLoading={isLoading}
      />

      <Credenza open={showCredenza} onOpenChange={setShowCredenza}>
        <></>
      </Credenza>

      <UserProfileDialog
        open={showProfile}
        onOpenChange={setShowProfile}
        user={session.user as UserType}
      />
    </Sidebar>
  );
}
