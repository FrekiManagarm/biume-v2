import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@biume/ui/components/sidebar"
import {
  CalendarIcon,
  HeartPulseIcon,
  HomeIcon,
  PawPrintIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

// Some wrapper spacing/color below uses inline styles instead of arbitrary
// Tailwind utilities (py-1.5, h-24, bg-sidebar-primary, font-semibold, ...):
// this repo's standalone CSS compile only scans packages/ui/src/** for class
// literals, so utilities that only appear in this preview file are silently
// dropped from the compiled stylesheet. CSS custom properties (var(--sidebar-
// primary) etc.) are always available since they're defined at :root, so
// inline style is a safe substitute. See .design-sync/learnings/B7-complex.md.

const navItems = [
  { title: "Dashboard", icon: HomeIcon, isActive: true },
  { title: "Patients", icon: PawPrintIcon, badge: "128" },
  { title: "Clients", icon: UsersIcon },
  { title: "Appointments", icon: CalendarIcon, badge: "5" },
  { title: "Treatments", icon: HeartPulseIcon },
]

export function Default() {
  return (
    <SidebarProvider defaultOpen style={{ minHeight: "100%" }}>
      <Sidebar>
        <SidebarHeader>
          <div
            className="flex items-center gap-2 px-2"
            style={{ paddingTop: 6, paddingBottom: 6 }}
          >
            <div
              className="flex items-center justify-center rounded-md"
              style={{
                width: 28,
                height: 28,
                backgroundColor: "var(--sidebar-primary)",
                color: "var(--sidebar-primary-foreground)",
              }}
            >
              <PawPrintIcon className="size-4" />
            </div>
            <span className="text-sm" style={{ fontWeight: 600 }}>
              Biume Clinic
            </span>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={item.isActive} render={<a href="#" />}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<a href="#" />}>
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header
          className="flex items-center gap-2 border-b px-4"
          style={{ height: 48 }}
        >
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
            Dashboard
          </span>
        </header>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div
            className="rounded-xl bg-muted"
            style={{ height: 96, opacity: 0.6 }}
          />
          <div
            className="rounded-xl bg-muted"
            style={{ height: 96, opacity: 0.6 }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
