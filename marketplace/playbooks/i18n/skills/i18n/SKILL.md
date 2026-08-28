---
name: i18n
description: >-
  Wires next-intl locales, message files, and language switching on the Next.js
  App Router starter. Use when adding a language, translating UI copy,
  locale-prefixed routes, or a language switcher.
---

# i18n

`next-intl` on this starter: `app/` (no `src/`), bun. Docs: `https://next-intl.dev`.

User-facing copy goes through next-intl. In-app links go through `@/i18n/navigation`, not `next/link`.

## First wire

Done when `/<defaultLocale>` and `/<other>` both render, `<html lang>` matches the URL locale, and one visible string is read from `messages/*.json`.

1. `bun add next-intl`. If `package.json` / lockfile changed → **InstallDependencies**.
2. Add the four files below. Locales = what the user named (BCP 47, e.g. `en`, `es`, `pt-BR`). Default = first / the one they called default. At least two locales.
3. Wrap the **existing** `next.config.ts` with `createNextIntlPlugin('./i18n/request.ts')`. Keep `turbopack`, `typescript`, and every other key.
4. Add root `proxy.ts`.
5. Move route files (`layout.tsx`, `page.tsx`, and other `app/**/page.tsx` trees) under `app/[locale]/`. Leave `app/fonts/` and `app/tokens/` where they are. After the move, `app/layout.tsx` and `app/page.tsx` must not remain at the root — `[locale]/layout.tsx` is the `<html>` owner.
6. Locale layout owns `<html lang={locale}>` (and `dir="rtl"` for `ar` / `he` / `fa` / `ur`), fonts, `Providers`, and `NextIntlClientProvider`. `params` is a Promise — `const { locale } = await params`. Call `setRequestLocale(locale)` after `hasLocale`. Export `generateStaticParams` from `routing.locales`.
7. Seed `messages/<locale>.json` for every locale. Same keys everywhere.

### `i18n/routing.ts`

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
});
```

### `i18n/navigation.ts`

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

### `i18n/request.ts`

```ts
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### `proxy.ts`

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
```

### `next.config.ts`

```ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// existing nextConfig stays
export default withNextIntl(nextConfig);
```

## New string

Done when the key exists in **every** `messages/<locale>.json` and the UI calls `t('…')`.

- Server Component / layout: `getTranslations` from `next-intl/server`.
- Client Component: `useTranslations` from `next-intl`.
- Namespace = screen or feature (`Home`, `Nav`). Key = short role (`title`, `submit`), not the English sentence.
- Variables and plurals: ICU (`Hello {name}`, `{count, plural, one {# item} other {# items}}`). No string concat of phrases.

## New locale

Done when `routing.locales` lists it, `messages/<code>.json` has the same keys as the default locale, and `/<code>` renders.

1. Append the code on `routing.locales`.
2. Copy `messages/<defaultLocale>.json` → `messages/<code>.json` and translate **values** only.
3. Language switcher (if any) reads `routing.locales` — do not hardcode the list.

## Switcher

Client. `usePathname` + `useRouter` from `@/i18n/navigation`. Keep the current path:

```ts
router.replace(pathname, { locale: next });
```

`Link` from the same module also accepts `locale`.
