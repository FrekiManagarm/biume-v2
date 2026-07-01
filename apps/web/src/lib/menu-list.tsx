import {
  Contact2,
  CalendarDays,
  type LucideIcon,
  NotepadText,
  PawPrint,
  Settings,
} from "lucide-react";

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  comingSoon?: boolean;
  icon: LucideIcon;
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
  comingSoon?: boolean;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function proMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: `/dashboard`,
          label: "Agenda",
          active: pathname === `/dashboard`,
          icon: CalendarDays,
        },
      ],
    },
    {
      groupLabel: "Dossiers",
      menus: [
        {
          href: `/dashboard/patients`,
          label: "Animaux",
          active: pathname === `/dashboard/patients`,
          icon: PawPrint,
        },
        {
          href: `/dashboard/clients`,
          label: "Propriétaires",
          active: pathname === `/dashboard/clients`,
          icon: Contact2,
        },
      ],
    },
    {
      groupLabel: "Suivi",
      menus: [
        {
          href: `/dashboard/reports`,
          label: "Comptes rendus",
          active: pathname.startsWith(`/dashboard/reports`),
          icon: NotepadText,
        },
      ],
    },
    {
      groupLabel: "Autre",
      menus: [
        {
          href: `/dashboard/settings`,
          label: "Paramètres",
          active: pathname.startsWith(`/dashboard/settings`),
          icon: Settings,
        },
      ],
    },
  ];
}
