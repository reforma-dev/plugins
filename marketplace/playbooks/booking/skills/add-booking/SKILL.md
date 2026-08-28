---
name: add-booking
description: >-
  Chooses embed vs event calendar vs owned slots, then wires it on the Next.js
  App Router starter. Use when adding booking, scheduling, office hours, a
  book-a-call page, or a month calendar of events. Also when the user runs
  /add-booking.
---

# Booking

Starter is `app/` (no `src/`), bun. Pick **one** path. Done when that path's criterion holds.

## Pick

| They asked | Path |
| ---------- | ---- |
| Book a call, consultation, office hours, "pick a slot" | **Embed** |
| Month/week of *their* events (classes, launches, agenda) | **Calendar** |
| Inventory they own (tables, rooms) and they refused Cal.com/Calendly | **Slots** |

Unspecified "add booking" → **Embed**, Cal.com. They already named Calendly → Calendly.

## Embed

Done when a public route shows the vendor booker and a slot is selectable.

If the **cal-com** or **calendly** plugin is on, follow that skill. Otherwise Cal.com default:

1. `bun add @calcom/embed-react`. Lockfile changed → **InstallDependencies**.
2. Client `Cal` from `@calcom/embed-react`, `calLink` = `username/event-slug` they own. Keys off the client.

Calendly named: `bun add react-calendly`, `InlineWidget` `url` = their `https://calendly.com/…` link.

## Calendar

Done when a month (or week) shows events from project data, timezone is named, an empty day lists nothing.

1. `bunx shadcn add calendar`. If lockfile changed → **InstallDependencies**.
2. Persist `start` / `end` as ISO UTC. Render with `Intl.DateTimeFormat` in one IANA zone (`Europe/Lisbon`, not the browser's leftover offset).
3. `Calendar` from `@/components/ui/calendar`. Modifiers mark days that have events. Selected day → a list beside the grid.
4. Week grid with drag-resize only if they asked for a scheduler UI — then one library (`@schedule-x/react`). Default is the shadcn month + list.

## Slots

Done when two overlapping bookings on the same resource cannot both confirm, rows store UTC, the booker shows times in one IANA zone.

1. Table: `resource_id`, `start_at` timestamptz, `end_at` timestamptz. Unique `(resource_id, start_at)`.
2. List open slots in the guest timezone; write UTC.
3. Confirm = insert then email (Resend skill if that plugin is on). Unique violation → slot taken, pick another.
