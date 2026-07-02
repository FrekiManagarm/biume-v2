# Assistant Page Design

## Goal

Move the Biume AI assistant from a dashboard header drawer to a dedicated dashboard page at `/dashboard/assistant`.

The assistant should feel like a welcoming workspace for reflection and clinical organization, not a command palette. The dashboard header assistant trigger will be removed completely. Access will happen through a visually distinct sidebar item.

## Decisions

- Use route `/dashboard/assistant`.
- Add a sidebar item labeled `Assistant` with the `Sparkles` icon.
- Make the sidebar item visually distinct from regular navigation while staying consistent with the existing sidebar.
- Keep the new shadcn AI components already introduced: `Message`, `Bubble`, and `MessageScroller`.
- Keep the Vercel AI SDK chat flow through `/api/chat`.
- Keep quick suggestions and slash commands.
- Remove the header assistant button and the drawer as the primary access path.

## Navigation

The sidebar will include a special AI item in the first menu group, directly after `Agenda` and before dossier-oriented links.

Expanded sidebar behavior:

- Label: `Assistant`
- Icon: `Sparkles`
- Badge: `IA`
- Surface: subtly tinted emerald/sage treatment, with a more expressive active state than standard nav items.

Collapsed sidebar behavior:

- Keep the `Sparkles` icon visible.
- Preserve the special surface treatment so it remains identifiable.
- Use the existing `title` behavior for accessibility.

Active state:

- Active when `pathname.startsWith("/dashboard/assistant")`.
- Should not reuse the exact default active item styling only; it should combine active navigation feedback with the special AI treatment.

## Page Layout

The page will be a full dashboard route rendered inside the existing dashboard shell.

Desktop layout:

- Top page header with a calm title and short support copy.
- Asymmetric grid with:
  - Main conversation area.
  - Right contextual panel for shortcuts, context, and command reminders.

Mobile layout:

- Single column.
- Conversation appears first.
- Contextual panel appears below the conversation, with no horizontal overflow.

The layout should use restrained dashboard styling:

- Neutral/slate base.
- One accent color: emerald/sage.
- No purple or blue AI gradient aesthetic.
- No emojis.
- No decorative blobs or generic AI effects.
- Cards only where they frame real tools or repeated actions.

## Conversation Area

The main conversation area will reuse the current chat behavior:

- `useChat` with `DefaultChatTransport({ api: "/api/chat" })`.
- Send user messages with app context from `useAppContext`.
- Stream assistant responses.
- Render messages with shadcn AI `Message`, `Bubble`, and `MessageScroller`.
- Render markdown through `Streamdown`.
- Show loading state while submitted or streaming.
- Show inline error state if the AI request fails.
- Allow clearing the current conversation.

The empty state should be welcoming and useful:

- Warm intro copy.
- Suggested prompts for consultation prep, report structure, relances, and synthesis.
- Clear indication that natural language works and slash commands are optional.

## Context Panel

The page includes a contextual side panel with:

- Current page or workspace context.
- Selected patient/client status when available.
- Quick suggestion buttons.
- Slash command reference.
- Small trust/status note explaining that the assistant is contextual but does not execute destructive app actions by itself.

The panel is informative and action-oriented, not a marketing feature list.

## Header Removal

`DashboardHeader` should no longer import or render:

- `AISearch`
- `AIChatDialog`
- local assistant dialog state

If `ai-search.tsx` and `ai-chat-dialog.tsx` become unused after the page implementation, they should be removed unless another component still imports them.

## Route And Breadcrumbs

Add a new TanStack file route:

- `apps/web/src/routes/dashboard/assistant.tsx`

Update dashboard metadata:

- Page title: `Assistant | Biume`
- Description: dashboard assistant for reports, consultations, and organization.

Update breadcrumbs:

- Add `Assistant` with `/dashboard/assistant`.

Regenerate the TanStack route tree after adding the route.

## Component Boundaries

Use small, focused components:

- Route file only wires metadata and renders the page component.
- Page component owns layout.
- Chat component owns `useChat`, input, commands, message rendering, and reset.
- Sidebar special item logic stays close to the dashboard sidebar implementation.

Avoid broad refactors of existing dashboard pages.

## Interaction States

Required states:

- Empty state with suggestions.
- Loading/streaming state.
- Error state.
- Disabled send state when input is empty or request is loading.
- Active sidebar state.
- Collapsed sidebar state.

Controls should have tactile hover/active feedback, but motion must stay lightweight and transform/opacity based.

## Verification

After implementation:

- Run `bun --filter @biume/web generate-routes`.
- Run `bun run build` from `apps/web`.
- Run `bun run check-types` from the workspace root.
- Start the web dev server and provide the local URL.

Manual visual checks:

- `/dashboard/assistant` desktop layout.
- `/dashboard/assistant` mobile-width layout.
- Sidebar expanded active state.
- Sidebar collapsed assistant item.
- Header no longer contains assistant access.
