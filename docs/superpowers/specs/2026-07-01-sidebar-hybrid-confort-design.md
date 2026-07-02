# Sidebar Hybrid Confort Design

## Goal

Redesign the dashboard sidebar so it feels more aligned with Biume: clinical, precise, modern, and professional. The chosen direction is "Hybrid confort", a middle ground between a clear SaaS sidebar and a compact expert navigation rail.

## Scope

This change is limited to the product dashboard sidebar in `apps/web`.

In scope:

- Refresh the visual treatment of `DashboardSidebar`.
- Keep the existing navigation structure from `proMenuList`.
- Preserve current organization switching, user profile, logout, dropdowns, mobile sheet behavior, and collapsed icon mode.
- Adjust sidebar-specific classes and theme tokens only when needed for the new visual direction.

Out of scope:

- Reworking dashboard page content.
- Changing route structure or menu labels.
- Replacing the Shadcn-style sidebar primitives.
- Adding new dependencies.
- Redesigning the marketing site.

## Visual Direction

The sidebar should use a clean clinical palette with more character than the current white/violet theme.

- Base: warm white or very pale green-tinted surface.
- Primary active state: deep clinical green.
- Accent: mint/teal highlight for active indicators and icon surfaces.
- Borders: soft green-gray lines.
- Text: dark green-black for high contrast, muted green-gray for secondary labels.

The result should feel like a serious veterinary practice tool: calm, efficient, readable, and slightly premium without becoming decorative.

## Layout

The sidebar remains a standard text sidebar when expanded.

- Organization switcher at the top becomes a stronger branded block with logo/avatar, organization name, and a subtle secondary line.
- Navigation groups remain visible, but group labels become smaller, uppercase, and muted.
- Menu items use tighter spacing, consistent icon boxes, and an active state with a dark green background.
- The active menu item includes a mint visual accent so the current location is unmistakable.
- Footer user/account area remains compact and separated with a fine border.

Collapsed mode keeps the existing icon behavior and tooltips. The collapsed design should inherit the same active and hover language without introducing a separate rail implementation.

## Component Boundaries

Primary file:

- `apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx`

Possible supporting files:

- `apps/web/src/components/ui/sidebar.tsx` if local sidebar primitive classes need minor active/hover tuning.
- `packages/ui/src/styles/globals.css` if sidebar theme tokens need to shift from violet/neutral to clinical green.

The implementation should avoid broad shared UI changes unless the local sidebar cannot achieve the target design cleanly.

## Behavior

All existing behavior must remain intact.

- Organization switcher dropdown still lists organizations and handles switching.
- Mobile sidebar still opens through the existing sheet behavior.
- Collapsible sidebar still supports icon mode.
- Submenu dropdowns and collapsibles still work.
- User profile dialog and logout still work.

No new data fetching, mutations, or route changes are required.

## Accessibility

The redesigned sidebar must preserve accessible navigation behavior.

- Active states must not rely only on color; shape, contrast, or accent position should also communicate state.
- Text contrast should remain readable on light and dark active surfaces.
- Existing keyboard/focus behavior from the sidebar primitives should remain intact.
- Icon-only collapsed items should keep tooltips.

## Testing

Verification should be scoped to the UI change.

- Run the relevant type check if the component structure changes.
- Start the web dev server and inspect the dashboard sidebar visually.
- Check expanded desktop, collapsed desktop, and mobile sidebar states.
- Confirm organization dropdown and profile/logout controls still open.

If the repository has unrelated existing type errors, document them rather than claiming the full check passed.
