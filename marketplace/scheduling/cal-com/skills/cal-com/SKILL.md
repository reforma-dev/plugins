---
name: cal-com
description: >-
  Puts a Cal.com booker on the Next.js App Router starter and uses Cal.com MCP
  for event types. Use when embedding Cal.com, adding a book-a-call page, or
  managing Cal.com bookings from chat.
---

# Cal.com

Starter is `app/` (no `src/`), bun. Embed docs: `https://www.npmjs.com/package/@calcom/embed-react`. MCP: connected Cal.com account (event types, slots, bookings).

`calLink` is `username/event-slug` (or team link). API keys stay off the client. `CAL_API_KEY` is MCP/stdio only.

## Booker on the site

Done when `/book` (or the route they named) renders the Cal.com widget and a slot is selectable.

1. `bun add @calcom/embed-react`. If `package.json` / lockfile changed → **InstallDependencies**.
2. If they have no event type yet and MCP is connected: create a 30-minute type, then use its `username/slug`.
3. Add a Client Component. `Cal` from `@calcom/embed-react`. `namespace` unique per embed on the page.

```tsx
"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export function Booker({ calLink }: { calLink: string }) {
  useEffect(() => {
    void getCalApi({ namespace: "book" }).then((cal) => {
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    });
  }, []);

  return (
    <Cal
      namespace="book"
      calLink={calLink}
      style={{ width: "100%", height: "100%", overflow: "auto" }}
      config={{ layout: "month_view" }}
    />
  );
}
```

4. Put it on a page. `calLink` from their username + slug, not a hardcoded demo account.
5. Optional: `getCalApi` `cal("on", { action: "bookingSuccessfulV2", callback })` for a thank-you state. Prefill via `config` (`name`, `email`) when the user is signed in.

## Account from chat

MCP tools manage event types, schedules, availability, and bookings on **their** Cal.com org. Use that to create the type the embed points at. Do not proxy Cal.com REST from a Route Handler unless they asked for a headless booker.

Headless (own UI, Cal.com API v2): server routes only, `cal-api-version` header as in current v2 docs. Prefer embed until they need custom markup.
