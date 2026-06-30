import {
  Contact2,
  CalendarDays,
  LayoutGrid,
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
          label: "Tableau de bord",
          active: pathname === `/dashboard`,
          icon: LayoutGrid,
        },
      ],
    },
    {
      groupLabel: "Gestion",
      menus: [
        {
          href: `/dashboard/agenda`,
          label: "Agenda",
          active: pathname === `/dashboard/agenda`,
          icon: CalendarDays,
        },
        {
          href: `/dashboard/owners`,
          label: "Propriétaires",
          active: pathname === `/dashboard/owners`,
          icon: Contact2,
        },
        {
          href: `/dashboard/patients`,
          label: "Patients",
          active: pathname === `/dashboard/patients`,
          icon: PawPrint,
        },
      ],
    },
    {
      groupLabel: "Services",
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
