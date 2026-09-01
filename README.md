# Reforma plugins

Marketplace plugins for Reforma. Each plugin is a folder with `.reforma-plugin/plugin.json`. Pack renames `.cursor-plugin`, `.codex-plugin`, or `.claude-plugin` to `.reforma-plugin` when that folder is missing.

## Plugins

| name                  | Plugin                                                                   | Author        | Category   | description                                                                                                             |
| --------------------- | ------------------------------------------------------------------------ | ------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| bro-mode              | [Bro Mode](marketplace/moods/bro-mode)                                   | Reforma       | Moods      | Turns the agent into a brutally honest bestie who knows the craft, calls out bad ideas, and ships better ones with you. |
| zen-mode              | [Zen Mode](marketplace/moods/zen-mode)                                   | Reforma       | Moods      | Quiet. Do the work. No status talk — just the outcome.                                                                  |
| ship-it               | [Ship It](marketplace/moods/ship-it)                                     | Reforma       | Moods      | Cuts scope, kills gold-plating, and gets the smallest working change merged.                                            |
| professor             | [Professor](marketplace/moods/professor)                                 | Reforma       | Moods      | Grills the problem first — researches, challenges assumptions, settles every major fork with you — then builds.         |
| founder               | [Founder](marketplace/moods/founder)                                     | Reforma       | Moods      | Rough idea in, MVP out. Picks product, UX, and copy — no workshop. If it flops, it gets deleted.                        |
| caveman-mode          | [Caveman](marketplace/moods/caveman-mode)                                | Reforma       | Moods      | Chat like a caveman — savage mouth, real work.                                                                          |
| frontend-design       | [Frontend Design](marketplace/playbooks/frontend-design)                 | Anthropic     | Playbooks  | Give the UI a visual identity — palette, type, and layout for this product                                              |
| web-design-guidelines | [Web Design Guidelines](marketplace/playbooks/web-design-guidelines)     | Vercel        | Playbooks  | Catch accessibility, form, and focus issues before they ship                                                            |
| react-best-practices  | [React Best Practices](marketplace/playbooks/react-best-practices)       | Vercel        | Playbooks  | Keep the app fast — React and Next.js performance patterns                                                              |
| i18n                  | [i18n](marketplace/playbooks/i18n)                                       | Reforma       | Playbooks  | Multiple languages — translated copy and a language switcher for the app                                                |
| motion-design         | [Motion Design](marketplace/playbooks/motion-design)                     | LottieFiles   | Playbooks  | Timing, easing, and choreography so motion in the app feels intentional                                                 |
| coss                  | [coss](marketplace/ui/coss)                                              | coss          | UI         | Extra components and particle effects beyond the default shadcn set                                                     |
| flexnative            | [Flexnative](marketplace/ui/flexnative)                                  | Flexnative    | UI         | Ready-made page blocks and patterns — drop in a section instead of assembling it                                        |
| magic-ui              | [Magic UI](marketplace/ui/magic-ui)                                      | Magic UI      | UI         | Animated marketing pieces — shine, marquee, shimmer, and that kind of polish                                            |
| tailark               | [Tailark](marketplace/ui/tailark)                                        | Tailark       | UI         | Marketing landing blocks and pages — heroes, pricing, footers                                                           |
| aceternity            | [Aceternity](marketplace/ui/aceternity)                                  | Aceternity    | UI         | Motion-heavy blocks and visual effects for landing pages                                                                |
| 21st                  | [21st](marketplace/ui/21st)                                              | 21st          | UI         | A living library of React components, templates, and themes. Add them to the project, or generate new UI.               |
| context7              | [Context7](marketplace/workspace/context7)                               | Reforma       | Workspace  | Current docs and examples for the libraries in the project                                                              |
| google-drive          | [Google Drive](marketplace/files/google-drive)                           | Reforma       | Files      | Docs and files in Google Drive — find them, upload drafts, share from the project                                       |
| notion-workspace      | [Notion](https://github.com/makenotion/cursor-notion-plugin)             | Notion Labs   | Workspace  | The team’s Notion — notes, pages, and databases in the project                                                          |
| linear                | [Linear](https://github.com/linear/cursor-plugin)                        | Linear        | Workspace  | The issue tracker — bugs, projects, and docs from Linear                                                                |
| dropbox               | [Dropbox](https://github.com/dropbox/dropbox-ai-plugins/tree/main/codex) | Dropbox       | Files      | Files in Dropbox — save, share, and pull them into the project                                                          |
| cloudinary            | [Cloudinary](marketplace/files/cloudinary)                               | Cloudinary    | Files      | Images and video in the cloud — upload, transform, and deliver them                                                     |
| slack                 | [Slack](marketplace/workspace/slack)                                     | Slack         | Workspace  | The team’s Slack — channels, threads, and posts from the project                                                        |
| github                | [GitHub](marketplace/workspace/github)                                   | GitHub        | Workspace  | GitHub in the project — issues, pull requests, and the repo                                                             |
| clerk                 | [Clerk](marketplace/auth/clerk)                                          | Clerk         | Auth       | Drop-in auth — sign-in, organizations, and user accounts for the app                                                    |
| supabase              | [Supabase](https://github.com/supabase-community/supabase-plugin)        | Supabase      | Backend    | Backend for the app — database, auth, and file storage                                                                  |
| stripe                | [Stripe](https://github.com/stripe/ai/tree/main/providers/cursor/plugin) | Stripe        | Payments   | Accept payments, manage customers, and handle subscriptions                                                             |
| higgsfield            | [Higgsfield](https://github.com/higgsfield-ai/cursor-plugin)             | Higgsfield AI | Media      | AI images and video from one studio                                                                                     |
| quiver                | [Quiver](https://github.com/quiverai/cursor-plugin)                      | QuiverAI      | Media      | Generate SVG and turn pictures into clean vectors                                                                       |
| svgator               | [SVGator](marketplace/media/svgator)                                     | SVGator       | Media      | Animated SVG — design the motion and export it into the project                                                         |
| lottiefiles           | [LottieFiles](marketplace/media/lottiefiles)                             | LottieFiles   | Media      | Lightweight motion for the app — Lottie animations you can browse and drop in                                           |
| recraft               | [Recraft](marketplace/media/recraft)                                     | Recraft       | Media      | Generate and edit images with Recraft’s design models                                                                   |
| replicate             | [Replicate](marketplace/media/replicate)                                 | Replicate     | Media      | Image, video, and audio models — pick one, get the file                                                                 |
| heygen                | [HeyGen](marketplace/media/heygen)                                       | HeyGen        | Media      | Talking-head videos from a script and an avatar                                                                         |
| fal                   | [fal](marketplace/media/fal)                                             | fal           | Media      | Generate images, video, and audio from a wide set of models                                                             |
| elevenlabs            | [ElevenLabs](marketplace/media/elevenlabs)                               | ElevenLabs    | Media      | Voice for the app — generate speech and pick the voice                                                                  |
| sentry                | [Sentry](https://github.com/getsentry/plugin-cursor)                     | Sentry        | Analytics  | See crashes and traces from the live app, then fix them                                                                 |
| gsap                  | [GSAP](https://github.com/greensock/gsap-skills)                         | GreenSock     | UI         | Timeline animation, scroll effects, and motion — the GSAP toolkit                                                       |
| motion                | [Motion](https://github.com/motiondivision/cursor-plugin)                | Motion        | UI         | Animation for the web — springs, gestures, and layout motion                                                            |
| remotion              | [Remotion](https://github.com/remotion-dev/cursor-plugin)                | Remotion      | UI         | Videos and motion graphics, written in React                                                                            |
| game-creator          | [Game Creator](marketplace/games/game-creator)                           | OpusGameLabs  | Games      | Browser games — 2D with Phaser, 3D with Three.js                                                                        |
| firebase              | [Firebase](https://github.com/firebase/agent-skills)                     | Firebase      | Backend    | Google’s backend — auth, database, and hosting                                                                          |
| convex                | [Convex](https://github.com/get-convex/convex-agent-plugins)             | Convex        | Backend    | A live backend — the database updates the UI as data changes                                                            |
| neon                  | [Neon](marketplace/backend/neon)                                         | Neon          | Backend    | Serverless Postgres — databases, branches, and SQL without running a server                                             |
| appwrite              | [Appwrite](https://github.com/appwrite/cursor-plugin)                    | Appwrite      | Backend    | An open-source backend — auth, database, and storage                                                                    |
| prisma                | [Prisma](https://github.com/prisma/cursor-plugin)                        | Prisma        | Backend    | Talk to the database — schema, migrations, and queries in TypeScript                                                    |
| auth0                 | [Auth0](marketplace/auth/auth0)                                          | Auth0         | Auth       | Sign-in and user accounts, including social login and enterprise identity                                               |
| workos                | [WorkOS](marketplace/auth/workos)                                        | WorkOS        | Auth       | SSO and user management for B2B apps — enterprise sign-in without building it                                           |
| shopify               | [Shopify](marketplace/payments/shopify)                                  | Shopify       | Payments   | The store in the app — products, orders, and shop data                                                                  |
| resend                | [Resend](https://github.com/resend/resend-skills)                        | Resend        | Messaging  | Send email from the app — transactional mail and templates                                                              |
| cal-com               | [Cal.com](marketplace/scheduling/cal-com)                                | Cal.com       | Scheduling | Let people book time — event types and a scheduler in the app                                                           |
| calendly              | [Calendly](marketplace/scheduling/calendly)                              | Calendly      | Scheduling | Scheduling links and a Calendly embed so people book themselves                                                         |
| figma                 | [Figma](marketplace/design/figma)                                        | Figma         | Design     | Turn Figma frames into code for the project                                                                             |
| google-maps           | [Google Maps](marketplace/maps/google-maps)                              | Google        | Maps       | Maps in the app — places, routes, and what’s nearby                                                                     |
| mapbox                | [Mapbox](https://github.com/mapbox/mapbox-agent-skills)                  | Mapbox        | Maps       | Custom maps — your style, search, and location in the app                                                               |
| posthog               | [PostHog](marketplace/analytics/posthog)                                 | PostHog       | Analytics  | Product analytics — events, funnels, and session replay                                                                 |
| amplitude             | [Amplitude](marketplace/analytics/amplitude)                             | Amplitude     | Analytics  | Product analytics — events and charts so you see what people do                                                         |
| sanity                | [Sanity](marketplace/cms/sanity)                                         | Sanity        | CMS        | Structured content editors can change and the app can render                                                            |
| zapier                | [Zapier](marketplace/automation/zapier)                                  | Zapier        | Automation | Connect the app to thousands of other tools without writing each integration                                            |
| composio              | [Composio](marketplace/automation/composio)                              | Composio      | Automation | A hub of app connections — Gmail, Notion, Slack, and the rest of the stack                                              |
| make                  | [Make](marketplace/automation/make)                                      | Make          | Automation | Visual automations from Make — run scenarios and use the results in the app                                             |

Author is `plugin.json` `author.name` when present, else Reforma. Shelf is the parent `categories[]` entry — `plugin.json` has no `category`. `description` is the marketplace pitch: what the product is for the person installing it. Not MCP verbs, not “needs an API key.”

## Repository structure

Root `marketplace.json` lists plugins under `categories[].plugins`. `source` is a path in this repo or a GitHub `tree/…` URL. `"disabled": true` skips pack (folder stays) when the hosted MCP only accepts catalog clients (Figma waitlist). OAuth apps you register yourself (Drive, Dropbox, Slack, GitHub) stay enabled — credentials go in IN → OAuth clients, not here.

Local plugins live under `marketplace/<category>/<name>/`. Origin (first-party vs vendored) is `plugin.json` `author`, not the folder tree. Remote pins stay as GitHub URLs. Optional `displayName` / `description` on the listing, plus `marketplace/_brand/<name>/logo.*` (and `logo-small.*`), overlay the packed manifest — upstream Cursor plugins often ship repo-slug names and “plugin for Cursor” blurbs.

```
plugins/
├── marketplace.json                 # categories + plugin index
├── marketplace/_brand/<name>/       # overlay logos for GitHub pins
├── marketplace/<category>/<name>/
└── scripts/pack/                    # snapshot for the API (entry: scripts/pack.ts)
```

A plugin folder:

```
marketplace/<category>/<name>/
├── .reforma-plugin/plugin.json
├── assets/logo.svg
├── assets/logo-small.svg   # optional 12–14px glyph
└── …convention folders (skills/, rules/, hooks/, …)
```

`interface.brandColor` is the hex plate behind the market `logo`. Optional `interface.brandColorDark` is the same plate in dark theme. Optional `logoSmall` is the chip / chat-chrome mark — not the plated card art.

```sh
bun install
bun run pack              # writes dist/catalog/ and dist/catalog.tar.gz
```

Pack discovers convention folders (`skills/`, `agents/`, `rules/`, `hooks/`, `tools/`, `mcp.json` or `.mcp.json`) — no path fields needed in source `plugin.json`. Custom paths are remapped into that layout. If you import a Cursor/vendor plugin, pack also normalizes `rules/*.mdc`, `.cursor/rules/`, and `instructions/` to plain `rules/*.md`, renames `.mcp.json` → `mcp.json`, and renames a lone MCP server key to the marketplace plugin name (`chatgpt_app_mcp` → `dropbox`). HTTP MCP with no `tools` / `resources` / `resourceTemplates` in `mcp.json`: pack calls `initialize`, then `tools/list`, `resources/list`, and `resources/templates/list` for whichever are missing. Bodies are not packed. Stdio MCP is not probed. Packed `plugin.json` keeps `hooks: "./hooks/hooks.json"` (+ `hookOffers`) and `tools: "./tools.mjs"` (+ `toolOffers`) when those ship. Skills/agents/rules/mcp paths are stripped — catalog and sandbox discover the folders.

Pack **bundles** `tools/*.ts` into one `tools.mjs` (`@reforma/plugin-sdk` / `ai` / `zod` stay external). Export `defineTool` as the file default; name = filename (`Grep.ts` → `Grep`); `override: true` = bare name, shadows.

Push to `main` or `dev` publishes a `catalog-<7-char-sha>` GitHub Release (keeps the newest 10). Reforma API on local/staging tries `dev`, then `main`. Prod bakes `main`.
