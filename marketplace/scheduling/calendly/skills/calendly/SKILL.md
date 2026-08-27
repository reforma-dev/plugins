---
name: calendly
description: >-
  Puts a Calendly embed on the Next.js App Router starter and uses Calendly MCP
  for event types and links. Use when embedding Calendly, adding a scheduling
  page, or managing Calendly events from chat.
---

# Calendly

Starter is `app/` (no `src/`), bun. Embed: `react-calendly`. Help: `https://calendly.com/help/how-to-embed-calendly-in-a-react-app`. MCP: connected Calendly account.

The widget `url` is their public scheduling link (`https://calendly.com/…`). Personal access tokens stay off the client.

## Embed on the site

Done when the named route renders the inline widget and a time is selectable.

1. `bun add react-calendly`. If `package.json` / lockfile changed → **InstallDependencies**.
2. If they have no event type yet and MCP is connected: create it, then use the scheduling link MCP returns.
3. Client Component. `InlineWidget` from `react-calendly`.

```tsx
"use client";

import { InlineWidget } from "react-calendly";

export function Booker({ url }: { url: string }) {
  return (
    <InlineWidget url={url} styles={{ height: "700px" }} />
  );
}
```

4. Popup: `PopupButton` / `PopupWidget` from the same package when they asked for a button, not a full page.
5. Prefill `name` / `email` when the visitor is signed in. `useCalendlyEventListener` `onEventScheduled` for a thank-you state.

## Account from chat

MCP tools list event types, open slots, scheduling links, book and cancel. Use that to get the `url` the embed needs. Do not send Calendly REST from the browser.
