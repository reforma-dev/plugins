---
name: nextjs
disable-user-invocation: true
description: >-
  Next.js 16 App Router on this starter. Use when adding a route, layout,
  loading or error UI, dynamic params, cookies, a Server Action, route handler,
  'use client' boundary, or a request rewrite.
---

# Next.js

App Router, `app/` (no `src/`), bun. Pin: `package.json` → `next`. Keep `app/layout.tsx`, `app/fonts/`, `app/tokens/` at those roots. UI: **Skill** `shadcn`. Locales: **Skill** `i18n`.

## Route

A URL exists when the folder has `page.tsx`. Nested `layout.tsx` wraps the segment. Slow data: colocate `loading.tsx`. Failures: `error.tsx`. HTTP endpoint: `route.ts`.

Static head: `export const metadata`. Request-time head: `generateMetadata`.

Navigation: `next/link`. Images: `next/image`. After **Skill** `i18n`: `Link` from `@/i18n/navigation`.

Done when the path renders (or the handler responds) and `app/fonts` / `app/tokens` are still at the roots.

## Request data

`params`, `searchParams`, `cookies()`, and `headers()` are Promises. Await them (or `use()` in a Client Component). Same unwrap in `layout.tsx` and `generateMetadata`.

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}
```

## Server vs client

Default is a Server Component. Fetch here; pass serializable props into a small client island (`app/providers.tsx` is the existing one). `'use client'` at the top of a file that uses hooks, event handlers, or browser APIs. Secrets stay on the server.

## Mutations

`'use server'` actions and `route.ts` are public endpoints. Verify the caller inside the function. After a successful write: `refresh()` from `next/cache` in a Server Action; `revalidatePath` from a route handler (or when cached path data must drop). Status: 401 unsigned, 403 signed-in without permission. Patterns: [handlers.md](handlers.md).

## Proxy

Request rewrite or redirect: project-root `proxy.ts` with `export function proxy`. The file is not `middleware.ts`. Locale intercept: **Skill** `i18n`.
