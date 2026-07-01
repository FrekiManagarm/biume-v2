# Sidebar Hybrid Confort Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Biume dashboard sidebar into the validated "Hybrid confort" direction while preserving all current behavior.

**Architecture:** Keep the existing Shadcn-style sidebar primitives and update only sidebar-specific theme tokens plus `DashboardSidebar` composition classes. The implementation remains local to the product dashboard and avoids route, data, or shared component rewrites.

**Tech Stack:** TanStack Start, React, TanStack Router, Tailwind CSS v4, Shadcn-style sidebar components, lucide-react.

---

## File Structure

- Modify: `packages/ui/src/styles/globals.css`
  - Responsibility: define sidebar color tokens used by the local sidebar primitives.
- Modify: `apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx`
  - Responsibility: dashboard-specific organization switcher, nav items, group labels, footer account menu, and active visual treatment.
- Do not modify: `apps/web/src/components/ui/sidebar.tsx`
  - Reason: existing primitives already expose enough `className`, `isActive`, `tooltip`, and data attributes for the target design. Avoid touching this file because the worktree already contains unrelated formatting changes there.

## Task 1: Protect The Existing Worktree

**Files:**
- Inspect only: repository status

- [ ] **Step 1: Confirm no unrelated files are staged**

Run:

```bash
git diff --cached --name-only
```

Expected: no output. If files are staged, stop and ask before changing the index.

- [ ] **Step 2: Confirm the sidebar-related dirty files**

Run:

```bash
git status --short apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx apps/web/src/components/ui/sidebar.tsx packages/ui/src/styles/globals.css .superpowers docs/superpowers
```

Expected: `dashboard-sidebar.tsx`, `apps/web/src/components/ui/sidebar.tsx`, and `packages/ui/src/styles/globals.css` may already be modified. `.superpowers/` may be untracked from visual brainstorming and must remain uncommitted.

## Task 2: Update Sidebar Theme Tokens

**Files:**
- Modify: `packages/ui/src/styles/globals.css`

- [ ] **Step 1: Replace light sidebar tokens**

In the `:root` block, replace only these sidebar variables:

```css
  --sidebar: hsl(150 33% 98%);
  --sidebar-foreground: hsl(168 44% 14%);
  --sidebar-primary: hsl(164 56% 28%);
  --sidebar-primary-foreground: hsl(150 40% 98%);
  --sidebar-accent: hsl(154 34% 92%);
  --sidebar-accent-foreground: hsl(168 44% 14%);
  --sidebar-border: hsl(154 24% 84%);
  --sidebar-ring: hsl(164 56% 28%);
```

- [ ] **Step 2: Replace dark sidebar tokens**

In the `.dark` block, replace only these sidebar variables:

```css
  --sidebar: hsl(174 20% 9%);
  --sidebar-foreground: hsl(150 40% 96%);
  --sidebar-primary: hsl(160 55% 64%);
  --sidebar-primary-foreground: hsl(174 28% 10%);
  --sidebar-accent: hsl(172 20% 16%);
  --sidebar-accent-foreground: hsl(150 40% 96%);
  --sidebar-border: hsl(172 18% 20%);
  --sidebar-ring: hsl(160 55% 64%);
```

- [ ] **Step 3: Verify token replacement**

Run:

```bash
rg -n "sidebar:|sidebar-primary|sidebar-accent|sidebar-border|sidebar-ring" packages/ui/src/styles/globals.css
```

Expected: light and dark sidebar tokens show clinical green/mint values, not violet values.

## Task 3: Restyle The Sidebar Shell And Organization Switcher

**Files:**
- Modify: `apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx`

- [ ] **Step 1: Add local class constants after `menuGroups`**

Add this code directly after `const menuGroups = proMenuList(pathname || "");`:

```tsx
  const menuButtonClassName =
    "h-9 rounded-lg text-sidebar-foreground/78 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-[hsl(168_44%_14%)] data-[active=true]:text-white data-[active=true]:shadow-sm data-[active=true]:hover:bg-[hsl(168_44%_14%)]";
  const menuLinkClassName =
    "relative flex items-center gap-3 before:absolute before:left-[-0.5rem] before:h-5 before:w-1 before:rounded-full before:bg-transparent data-[active=true]:before:bg-[hsl(160_55%_64%)]";
  const menuIconClassName =
    "h-4 w-4 rounded-[5px] text-sidebar-foreground/65 transition-colors group-data-active/menu-button:text-[hsl(160_55%_64%)]";
```

- [ ] **Step 2: Update the `Sidebar` and `SidebarHeader` opening markup**

Replace:

```tsx
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="pb-2">
```

With:

```tsx
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="px-3 pb-3 pt-3">
```

- [ ] **Step 3: Update the organization trigger button**

Replace the top organization `SidebarMenuButton size="lg"` block with:

```tsx
                  <SidebarMenuButton
                    size="lg"
                    className="h-14 rounded-lg border border-sidebar-border/80 bg-white/72 px-2.5 shadow-sm transition-all duration-200 hover:bg-white hover:text-sidebar-foreground data-[state=open]:bg-white group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
                  >
                    <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                      {activeOrganization?.logo ? (
                        <img
                          src={activeOrganization?.logo ?? ""}
                          alt={activeOrganization?.name ?? ""}
                          width={36}
                          height={36}
                          className="size-full object-cover"
                        />
                      ) : (
                        <Building className="size-4" />
                      )}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-sidebar-foreground">
                        {activeOrganization?.name}
                      </span>
                      <span className="truncate text-xs text-sidebar-foreground/55">
                        Compte professionnel
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/55" />
                  </SidebarMenuButton>
```

- [ ] **Step 4: Update the organization dropdown active and hover colors**

Within organization dropdown items, replace primary/violet state classes with sidebar green classes:

```tsx
activeOrganization?.id === org.id
  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
  : "hover:bg-sidebar-accent hover:translate-x-1 hover:shadow-sm"
```

Use `ring-sidebar-primary/30`, `hover:ring-sidebar-primary/20`, `bg-sidebar-primary/15`, `hover:bg-sidebar-primary/20`, and `text-sidebar-primary` for the logo fallback and check icon classes.

## Task 4: Restyle Menu Groups And Items

**Files:**
- Modify: `apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx`

- [ ] **Step 1: Update the separator and content spacing**

Replace:

```tsx
      <SidebarSeparator />

      <SidebarContent>
```

With:

```tsx
      <SidebarSeparator className="mx-3 w-auto bg-sidebar-border/70" />

      <SidebarContent className="gap-1 px-3 py-3">
```

- [ ] **Step 2: Update top-level menu item rendering**

For menus without submenus in the first menu group, change `SidebarMenuButton` to:

```tsx
                      <SidebarMenuButton
                        isActive={menu.active}
                        tooltip={state === "collapsed" ? menu.label : undefined}
                        className={menuButtonClassName}
                        render={
                          <Link
                            to={menu.href}
                            data-active={menu.active}
                            className={cn(
                              menuLinkClassName,
                              menu.active && "font-medium",
                            )}
                          >
                            {menu.icon && (
                              <menu.icon className={menuIconClassName} />
                            )}
                            <span>{menu.label}</span>
                          </Link>
                        }
                      />
```

- [ ] **Step 3: Update grouped menu labels**

Replace grouped `SidebarGroup` and `SidebarGroupLabel` markup with:

```tsx
              <SidebarGroup key={groupIndex} className="px-0 py-1.5">
                <SidebarGroupLabel className="h-6 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45 group-data-[collapsible=icon]:opacity-0">
                  <span>{group.groupLabel}</span>
                </SidebarGroupLabel>
```

- [ ] **Step 4: Update grouped menu item rendering**

For grouped menus without submenus, replace the existing `SidebarMenuButton` block with:

```tsx
                        <SidebarMenuButton
                          isActive={menu.active && !menu.comingSoon}
                          disabled={menu.comingSoon}
                          tooltip={
                            state === "collapsed" ? menu.label : undefined
                          }
                          className={menuButtonClassName}
                          render={
                            <Link
                              to={menu.href}
                              data-active={menu.active && !menu.comingSoon}
                              className={cn(
                                menuLinkClassName,
                                menu.active && "font-medium",
                              )}
                            >
                              {menu.icon && (
                                <menu.icon className={menuIconClassName} />
                              )}
                              <span>{menu.label}</span>
                            </Link>
                          }
                        />
```

## Task 5: Restyle Submenu Entry Points

**Files:**
- Modify: `apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx`

- [ ] **Step 1: Update `CollapsedSubMenu` trigger**

Change the trigger button to include the shared menu button classes and icon classes:

```tsx
              <SidebarMenuButton
                isActive={menu.active}
                tooltip={menu.label}
                className={menuButtonClassName}
              >
                {menu.icon && <menu.icon className={menuIconClassName} />}
                <span>{menu.label}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-sidebar-foreground/45" />
              </SidebarMenuButton>
```

- [ ] **Step 2: Update `ExpandedSubMenu` trigger**

Change the trigger button to:

```tsx
              <SidebarMenuButton
                className={cn("group", menuButtonClassName)}
                isActive={menu.active}
              >
                {menu.icon && <menu.icon className={menuIconClassName} />}
                <span>{menu.label}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-sidebar-foreground/45 transition-transform duration-200 group-data-[state=open]:rotate-90 group-data-active/menu-button:text-white/70" />
              </SidebarMenuButton>
```

- [ ] **Step 3: Update submenu dropdown colors**

In submenu dropdown items, replace active classes with:

```tsx
submenu.active && "bg-sidebar-accent text-sidebar-accent-foreground"
```

## Task 6: Restyle Footer Account Area

**Files:**
- Modify: `apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx`

- [ ] **Step 1: Add footer spacing and border**

Replace:

```tsx
      <SidebarFooter>
```

With:

```tsx
      <SidebarFooter className="mx-3 mb-3 border-t border-sidebar-border/70 px-0 pt-3">
```

- [ ] **Step 2: Update footer trigger button**

Replace the footer `SidebarMenuButton` classes with:

```tsx
                    size="lg"
                    className="h-12 rounded-lg px-2 text-sidebar-foreground/80 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
```

- [ ] **Step 3: Update avatar treatment**

Use these avatar classes in the footer trigger:

```tsx
                    <Avatar className="h-8 w-8 rounded-lg ring-1 ring-sidebar-border">
```

And:

```tsx
                      <AvatarFallback className="rounded-lg bg-sidebar-primary/15 text-sidebar-primary">
```

## Task 7: Verify UI And Types

**Files:**
- Inspect: dashboard in browser

- [ ] **Step 1: Run the focused type check**

Run:

```bash
bun --filter @biume/web check-types
```

Expected: PASS, or existing unrelated errors documented with file paths.

- [ ] **Step 2: Start the web dev server**

Run:

```bash
bun run dev:web
```

Expected: web app starts and prints a local URL.

- [ ] **Step 3: Inspect desktop expanded sidebar**

Open the dashboard route in the browser. Confirm:

- Organization switcher appears as a pale clinical block.
- Active menu item is deep green with a mint accent.
- Group labels are small uppercase muted text.
- The layout still feels readable and not over-compressed.

- [ ] **Step 4: Inspect collapsed and mobile sidebar states**

Use the sidebar trigger to collapse the sidebar. Confirm:

- Icon-only mode remains usable.
- Tooltips appear for collapsed items.
- Active state is still visible.

Use a narrow viewport or mobile emulation. Confirm:

- The sidebar opens in the existing sheet.
- Organization dropdown still opens.
- User profile and logout menu still opens.

## Task 8: Commit Sidebar Redesign

**Files:**
- Stage only:
  - `packages/ui/src/styles/globals.css`
  - `apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx`

- [ ] **Step 1: Review the final diff**

Run:

```bash
git diff -- packages/ui/src/styles/globals.css apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx
```

Expected: only sidebar theme token changes and dashboard sidebar class/composition changes.

- [ ] **Step 2: Stage only implementation files**

Run:

```bash
git add packages/ui/src/styles/globals.css apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx
```

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "feat: redesign dashboard sidebar"
```

Expected: commit succeeds. Do not stage `.superpowers/` or unrelated dirty files.
