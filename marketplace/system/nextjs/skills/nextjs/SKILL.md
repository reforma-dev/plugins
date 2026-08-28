---
name: nextjs
disable-user-invocation: true
description: >-
  Next.js App Router routes, layouts, loading and error UI, metadata,
  request APIs, Server Actions, route handlers, caching, authentication,
  and request rewrites.
---

# Next.js

## Before editing

Read `package.json` → `next`, `next.config.ts`, and the existing App Router tree (`app/` or `src/app`). Match adjacent routes for naming, runtime, caching, errors, providers, data-access, and auth. One App Router root. Leave `fonts/` and `tokens/` in place unless the task moves them.

When a sibling skill exists, read and apply it before changing that surface. Otherwise follow adjacent files.

- UI primitives → `shadcn`
- Fonts → `fonts`
- Tokens → `tokens`
- Chrome icons → `icons`
- Marks / favicons → `svg`
- Locales → `i18n`
- Performance → `react-best-practices`

Preserve `next.config.ts` composition and keys (`turbopack`, `tsconfigPath`, wrappers, plugins, environment branches). Run the project's `lint` script — Next 16 has no `next lint`. Leave `cacheComponents` as configured unless the user asked to change it. Leave `instrumentation-client.ts` unless the task is client instrumentation.

## Route

Add the route inside the existing route-group and layout structure. Route groups `(…)`, parallel slots `@slot`, and intercepting routes do not necessarily map to URL segments.

- `page.tsx` — makes the route segment publicly addressable
- `layout.tsx` — nested layout only when the segment needs a persistent shared **boundary**: UI, providers, data, metadata, or parallel-route slots
- `loading.tsx` — fallback for the **whole** segment. One slow block: local `<Suspense>`
- `error.tsx` — Client Component. Does not catch errors in its own `layout.tsx`. Root layout failures: `global-error.tsx`. Expected form/mutation errors: typed action state
- `route.ts` — HTTP endpoint

Static head: `export const metadata`. Head that needs params or cookies: `generateMetadata`.

Nav: `next/link`, or `Link` from `@/i18n/navigation` when that module exists. User-facing raster images: `next/image` unless the source or context cannot use the optimizer. Keep existing remote image config.

`notFound()`, `redirect()`, `permanentRedirect()` for those outcomes. `unauthorized()` / `forbidden()` only when this Next version and config support them. Do not swallow `redirect()` or `notFound()` in a broad `catch`.

## Request data

On Next 15+, request APIs are asynchronous:

- `params` — Promise in `page.tsx`, `layout.tsx`, `generateMetadata`, and Route Handler context
- `searchParams` — Promise in `page.tsx` and `generateMetadata`. Layouts do not receive it
- `cookies()`, `headers()`, `draftMode()` — return Promises

Await them, or `use()` a Promise in a Client Component.

When this Next version generates them, type with `PageProps<'/users/[id]'>`, `LayoutProps<'/users/[id]'>`, `RouteContext<'/api/users/[id]'>`.

Route handlers: `await context.params`. Query string is `request.nextUrl.searchParams`.

```tsx
export default async function Page(props: PageProps<"/users/[id]">) {
  const { id } = await props.params;
  const query = await props.searchParams;
}
```

## Server vs client

Default is a Server Component. Read data in Server Components or the server-side data-access layer, close to the owner, unless that creates a waterfall or fights the project's architecture. Pass serializable props into a small client **island**. Extend the existing client provider file.

Add `'use client'` only at the client boundary. Modules imported exclusively through that boundary are already in the client graph. Keep the boundary low. Event handlers live inside the client graph — they cannot cross the Server-to-Client serialization boundary.

Secrets stay on the server. Browser-exposed values: `NEXT_PUBLIC_`. Modules that must never enter the client graph: `import 'server-only'` when the project uses it.

Call the data-access layer from Server Components and Server Actions. `fetch` this app's own Route Handlers only when an HTTP boundary is required.

Start independent requests before awaiting them. Suspense streams independent UI.

## Cache

Inspect `cacheComponents` and adjacent conventions.

When `cacheComponents` is on: `'use cache'` only for data safe to share at that scope; declare lifetime and tags on purpose; keep request-time APIs outside cached scopes unless the project uses private cache.

Diagnose a failing fetch. Do not hide the cause with `force-dynamic`, `no-store`, or unrelated revalidation.

## Mutations

`'use server'` and `route.ts` are public. A layout or `proxy.ts` / `middleware.ts` check does not cover a direct POST. Mark intentionally public endpoints (webhooks, OAuth callbacks) and verify signatures/state there.

Protected mutations, in order: authenticate → validate untrusted input → authorize the operation and referenced resources → write → invalidate affected data. Use the project's auth helper (and the auth skill when present). Add `@/lib/auth` only when that file already exists.

- Route Handler: no session → `401`; session without permission → `403`; bad input → `400` / `422`; missing → `404`; conflict → `409`
- Server Action: stop before the write. Throw, `redirect`, or return the project's typed action state — match adjacent actions

Invalidate **only the affected data**:

- `updateTag` — Server Action expires tagged data immediately (read-your-own-writes)
- `revalidateTag` — tagged stale-while-revalidate (actions and handlers). Use the non-deprecated signature for the pinned Next version, not a profile copied from another repo
- `revalidatePath` — the dependency is the route. Valid in Server Actions and Route Handlers
- `refresh()` — Server Actions only. Refreshes the client router; it does not expire the server cache

## Rewrites and Proxy

Prefer `redirects()` / `rewrites()` in `next.config.ts` for declarative path, header, cookie, or query rules. Use `proxy.ts` for request-time logic that cannot be expressed there.

On Next 16+, place `proxy.ts` at the same level as `app/` (`proxy.ts` or `src/proxy.ts`) and export `proxy`. Extend existing `middleware.ts` on Next 15; do not add a new one on Next 16. Locale interception: `i18n` skill when present.

## Done

The route renders or the handler responds correctly for every case it owns. Protected mutations authorize, return the right status or action state, and invalidate only the data they changed. Independent fetches are not waterfalls. `fonts/` / `tokens/` paths are unchanged unless the task moved them. The project's lint and type-check commands pass.
