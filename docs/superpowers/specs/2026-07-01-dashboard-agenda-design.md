# Dashboard Agenda Design

Date: 2026-07-01

## Context

Biume is positioned for animal health practitioners, especially animal osteopaths and manual care practitioners. The product promise is not a generic CRM or business analytics cockpit. It is an operational workspace for preparing sessions, creating owner-friendly reports, and keeping post-session follow-up clear.

The current dashboard mixes business metrics, today appointments, recent reports, activity, and species breakdown. The redesign should simplify the home experience around the practitioner's day.

## Product Direction

The dashboard becomes a day-of-care workspace driven by the agenda.

It answers three questions in this order:

1. What sessions do I have today?
2. What do I need to prepare before the next sessions?
3. Which reports do I need to create, finalize, or send after sessions?

The default dashboard should not lead with global statistics such as new clients, new patients, sent reports, or species distribution. Those can exist later in a separate analytics or practice overview area, but they are not the first screen.

## Target User

The primary user is an animal practitioner managing their own daily sessions:

- animal osteopath
- animal manual therapist
- adjacent animal wellness practitioner

The interface should remain animal-specific rather than generic for human and animal practitioners.

Preferred vocabulary:

- Owners instead of clients
- Animals instead of patients
- Reports or owner summaries for session reports
- Follow-ups for post-session relances and owner feedback

## Dashboard Structure

The default route `/dashboard` should show the agenda day view.

Header:

- current day label
- previous and next day navigation
- view switch with Day selected by default and Week available as a secondary mode
- New appointment action
- optional Block time action

Main area:

- dominant day agenda
- time slots
- appointment cards
- clear status per appointment
- contextual primary action per appointment

Right panel:

- "To do today"
- only actions extracted from today's agenda and report workflow
- grouped into Before session and After session
- no generic activity feed
- no decorative statistics

Mobile:

- avoid squeezing the two-column layout
- show Agenda and To do as tabs or segmented views
- Agenda remains the first/default tab

## Appointment Cards

Appointment cards should show enough context to act without becoming clinical records.

Each card should include:

- start time and duration
- animal name as the primary label
- species and breed when available
- owner name
- session reason
- location, such as practice, home visit, stable, or other
- history indicator, such as first session, follow-up, or last visit
- report status
- one primary contextual action

Report statuses:

- No report yet
- To create
- Draft
- To finalize
- Ready to send
- Sent

Primary action examples:

- before session: Prepare
- after session with no report: Create report
- draft report: Finalize
- ready report: Send to owner
- sent report: View report

Clinical details, full history, observations, documents, and previous reports should live in the animal file or report editor, not directly in the agenda card.

## To Do Today Panel

The panel should be a compact extraction of next actions from the agenda and reports.

Before session examples:

- prepare next animal
- review previous report
- review attached owner documents

After session examples:

- create the report for a completed session
- finalize a draft
- send a ready owner summary

The panel should not become a second inbox. It is a daily working list tied to sessions and report completion.

## Navigation

The sidebar should become more animal-practitioner oriented:

- Agenda
- Animals
- Owners
- Reports
- Follow-ups
- Settings

For the first implementation pass, routes can remain technically close to the current structure to avoid a heavy migration. User-facing labels should move toward the new vocabulary:

- Clients becomes Owners
- Patients becomes Animals
- Dashboard becomes the agenda day view

The Follow-ups entry may be planned for a later phase if the module is not ready.

## First Implementation Scope

Implement now:

- transform `/dashboard` into the agenda-dominant day view
- remove the current metric-led dashboard composition from the home route
- add the To do today panel
- make appointment cards action-oriented
- rename sidebar labels from Clients to Owners and Patients to Animals
- keep existing routes where practical

Defer:

- advanced week view
- public online booking
- business analytics
- deep data model refactor
- a full Follow-ups module for J+7 and J+30 relances
- complex recurrence or availability rules

## Design Principles

- The agenda is the practitioner's source of truth for the day.
- Every visible item should help prepare, perform, or close a session.
- Reports are treated as part of the appointment workflow, not as a disconnected document archive.
- The interface should feel operational, dense, and calm.
- Avoid marketing-style dashboard cards on the product home screen.
- Keep the animal-specific language because it strengthens Biume's positioning.

## Open Decisions

No blocking open decisions remain for the first design pass.

The first implementation can use the existing appointment and report data available in the app. If a required status cannot be derived precisely yet, the first version should compute a simple best-effort status from existing report state and appointment timing, then refine it later.
