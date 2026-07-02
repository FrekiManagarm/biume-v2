# Dashboard Overview Design

Date: 2026-07-02

## Context

Biume serves independent animal-care professionals rather than teams operating from a fixed clinic. Many users are self-employed, mobile, and responsible for the whole workflow themselves: preparing sessions, seeing animals, reassuring owners, writing owner-friendly summaries, and following up after care.

The current merged dashboard makes `/dashboard` an agenda-first day workspace. That is useful, but it is too narrow for a page named dashboard. It answers "what appointments do I have today?" more than "what needs my attention across my activity?"

The dashboard should become a calm operational overview. It should keep the day agenda visible, but combine it with overdue work, next actions, recent activity, and lightweight activity signals.

## Product Direction

The default dashboard becomes an activity overview for an independent animal practitioner.

It answers four questions in this order:

1. What is happening today?
2. What requires action now?
3. What is late, blocked, or at risk?
4. How is my activity moving recently?

The dashboard should not feel like a SaaS analytics cockpit or a marketing page. It should feel like a practical working surface for a professional who has limited admin time between sessions.

## Target User

The primary user is an independent professional in the animal sector:

- animal osteopath
- animal manual therapist
- behaviorist
- educator
- adjacent animal wellness practitioner
- mobile or mixed-location practitioner

The interface should assume the user may work alone, move between locations, and personally handle owner communication and reports.

## Vocabulary

Preferred vocabulary:

- Activity instead of clinic or practice
- Sessions or appointments instead of consultations when the context is broad
- Animals instead of patients for high-level navigation and dashboard content
- Owners instead of clients in care workflows
- Comptes rendus instead of reports when the user-facing French term is needed
- Follow-ups instead of relances when the action is post-session care

Avoid making "cabinet" the central metaphor. It can appear only where a physical location is explicitly meant.

## Dashboard Structure

The default route `/dashboard` should show "Vue d'ensemble".

### Top Summary

A compact operational strip should show the most useful day signals:

- next appointment and time until it starts
- today's appointment count
- comptes rendus to create, finalize, or send
- pending follow-ups
- one warning state if something is overdue

These should be compact indicators, not oversized marketing cards.

### Main Area: Today's Agenda

The agenda remains central because the user's workday is session-driven.

Each appointment should show enough context to act:

- time and duration
- animal name
- species and breed when available
- owner name
- location or visit mode
- session reason when available
- compte rendu status
- one primary contextual action

The agenda block should link to the full agenda page for deeper scheduling work.

### Right Panel: À traiter

The right panel is the dashboard's most important prioritization surface.

It should group actionable work:

- completed sessions without a compte rendu
- draft comptes rendus to finalize
- finalized comptes rendus ready to send
- post-session follow-ups
- missing documents or information when available

This panel should not become a generic inbox. Items should be tied to sessions, animals, owners, or compte rendu completion.

### Lower Area: Recent Activity

Recent activity should show useful activity movement without turning the dashboard into analytics.

Examples:

- new animals added
- new owners added
- comptes rendus sent
- sessions completed
- upcoming appointment volume for the next few days

This area should be secondary. It supports orientation, but it should not compete with today's work and urgent actions.

## Navigation Model

Keep `/dashboard` as the overview route.

Use `/dashboard/agenda` for the full agenda experience:

- richer day/week navigation
- more scheduling controls
- appointment management
- future availability or blocking time when implemented

The sidebar should make the distinction clear:

- Vue d'ensemble
- Agenda
- Animaux
- Propriétaires
- Comptes rendus
- Paramètres

If follow-ups become a real module later, add it as a first-class item. Until then, follow-ups can live inside dashboard priorities.

## Data Model and Sources

The first implementation should reuse existing data where possible:

- appointments and linked reports for today's agenda
- report status for compte rendu actions
- animals and owners for display labels
- existing dashboard metrics for lightweight recent activity

When a signal cannot be derived precisely yet, use a conservative best-effort derivation and keep it visibly operational. Avoid inventing decorative fake metrics.

## States

The dashboard needs useful states:

- Loading: skeletons that match the summary, agenda, priorities, and recent activity shapes.
- Empty day: show that no appointments are planned and surface useful next actions such as creating an appointment or reviewing pending reports.
- Empty priorities: show a calm "nothing urgent" state, not a blank panel.
- Error: show an inline recovery message and keep the shell stable.

## Visual Direction

The dashboard should be dense, calm, and functional.

Use:

- restrained neutral surfaces
- thin borders and dividers
- compact data rows
- monospace only for numbers and times
- lucide icons for recognizable actions
- cards only where they frame a real repeated item or tool

Avoid:

- large hero composition
- decorative metric bento grids
- oversized marketing cards
- broad gradients or ornamental backgrounds
- treating the dashboard as only an agenda page

## First Implementation Scope

Implement now:

- refactor `/dashboard` into the activity overview
- preserve and reuse the current day agenda components where they fit
- add a top summary strip
- add a prioritized "À traiter" panel
- add a secondary recent activity section
- keep `/dashboard/agenda` as the fuller agenda page
- update visible labels toward independent animal-practitioner vocabulary

Defer:

- advanced analytics
- public booking
- availability management
- recurring appointment rules
- a dedicated follow-up module
- deep schema refactors
- financial or revenue reporting

## Success Criteria

The redesigned dashboard is successful if a practitioner can open it and understand, within a few seconds:

- what is next today
- what must be finished before or after sessions
- which comptes rendus are blocking owner communication
- whether there are recent activity changes worth noticing
- where to go for the full agenda or full lists

The page should feel like an activity command center for an independent animal professional, not a clinic analytics dashboard and not just an agenda.

## Open Decisions

No blocking open decisions remain for the first implementation plan.

The implementation should avoid broad data model changes and should keep any new derivation logic isolated and testable.
