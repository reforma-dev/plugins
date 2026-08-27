# Reforma plugins

Marketplace plugins for Reforma. Each plugin is a folder with `.reforma-plugin/plugin.json`. Pack renames `.cursor-plugin`, `.codex-plugin`, or `.claude-plugin` to `.reforma-plugin` when that folder is missing.

## Plugins

| name             | Plugin                                                                   | Author        | Category   | description                                                            |
| ---------------- | ------------------------------------------------------------------------ | ------------- | ---------- | ---------------------------------------------------------------------- |
| demo-kit         | [Demo Kit](marketplace/demo/demo-kit)                                    | Reforma       | Demo       | Sample plugin to try the catalog — skills, tools, hooks, and a server. |
| bro-mode         | [Bro Mode](marketplace/moods/bro-mode)                                   | Reforma       | Moods      | Brother energy — blunt, warm, pushes back.                             |
| zen-mode         | [Zen Mode](marketplace/moods/zen-mode)                                   | Reforma       | Moods      | Calm, minimal, one clear step at a time.                               |
| ship-it          | [Ship It](marketplace/moods/ship-it)                                     | Reforma       | Moods      | Smallest shippable change — merge beats polish.                        |
| professor        | [Professor](marketplace/moods/professor)                                 | Reforma       | Moods      | Explain the why — context and tradeoffs.                               |
| hype-man         | [Hype Man](marketplace/moods/hype-man)                                   | Reforma       | Moods      | Founder energy — vision, momentum, this thing wins.                    |
| caveman-mode     | [Caveman](marketplace/moods/caveman-mode)                                | Reforma       | Moods      | Cave-person talk. Broken words. Me do work.                            |
| shadcn-tailwind  | [shadcn / Tailwind](marketplace/ui/shadcn-tailwind)                      | shadcn        | UI         | Official components and Tailwind utilities for the project.            |
| fonts            | [Fonts](marketplace/ui/fonts)                                            | Reforma       | UI         | Google Fonts and custom typefaces for the project.                     |
| coss             | [coss](marketplace/ui/coss)                                              | coss          | UI         | Extra components and particles on top of shadcn.                       |
| flexnative       | [Flexnative](marketplace/ui/flexnative)                                  | Flexnative    | UI         | Ready-made blocks and patterns on top of shadcn.                       |
| context7         | [Context7](marketplace/workspace/context7)                               | Reforma       | Workspace  | Up-to-date library docs and examples. Needs an API key.                |
| google-drive     | [Google Drive](marketplace/files/google-drive)                           | Reforma       | Files      | Search, read, create, and share files across Drive.                    |
| notion-workspace | [Notion Workspace](https://github.com/makenotion/cursor-notion-plugin)   | Notion Labs   | Workspace  | Notion Skills + Notion MCP server packaged as a Cursor plugin.         |
| linear           | [Linear](https://github.com/linear/cursor-plugin)                        | Linear        | Workspace  | Issues, projects, and docs from the Linear workspace.                  |
| dropbox          | [Dropbox](https://github.com/dropbox/dropbox-ai-plugins/tree/main/codex) | Dropbox       | Files      | Access, save and share files with Dropbox.                             |
| slack            | [Slack](marketplace/workspace/slack)                                     | Slack         | Workspace  | Search channels, read threads, and post to the workspace.              |
| github-mcp       | [GitHub](marketplace/workspace/github-mcp)                               | GitHub        | Workspace  | Search issues, pull requests, and code in GitHub repositories.         |
| clerk            | [Clerk](marketplace/auth/clerk)                                          | Clerk         | Auth       | Sign-in, organizations, and user management for the app.               |
| supabase         | [Supabase](https://github.com/supabase-community/supabase-plugin)        | Supabase      | Backend    | Database, auth, and storage for the Supabase project.                  |
| stripe           | [Stripe](https://github.com/stripe/ai/tree/main/providers/cursor/plugin) | Stripe        | Payments   | Payments, customers, and webhooks from the Stripe account.             |
| higgsfield       | [Higgsfield](https://github.com/higgsfield-ai/cursor-plugin)             | Higgsfield AI | Media      | Images and video from Higgsfield.                                      |
| quiver           | [Quiver](https://github.com/quiverai/cursor-plugin)                      | QuiverAI      | Media      | Generate and vectorize SVG.                                            |
| svgator          | [SVGator](marketplace/media/svgator)                                     | SVGator       | Media      | Create, edit, and export animated SVG.                                 |
| lottiefiles      | [LottieFiles](marketplace/media/lottiefiles)                             | LottieFiles   | Media      | Search and manage Lottie animations.                                   |
| recraft          | [Recraft](marketplace/media/recraft)                                     | Recraft       | Media      | Generate and edit images with Recraft.                                 |
| replicate        | [Replicate](marketplace/media/replicate)                                 | Replicate     | Media      | Run image, video, and audio models on Replicate.                       |
| heygen           | [HeyGen](marketplace/media/heygen)                                       | HeyGen        | Media      | Generate avatar videos with HeyGen.                                    |
| fal              | [fal](marketplace/media/fal)                                             | fal           | Media      | Generate images, video, and audio from fal models. Needs an API key.   |
| elevenlabs       | [ElevenLabs](marketplace/media/elevenlabs)                               | ElevenLabs    | Media      | Generate speech and manage voices in ElevenLabs.                       |
| cartesia         | [Cartesia](marketplace/media/cartesia)                                   | Cartesia      | Media      | Generate speech with Cartesia voices.                                  |
| sentry           | [Sentry](https://github.com/getsentry/plugin-cursor)                     | Sentry        | Analytics  | Errors and traces from the Sentry org.                                 |
| gsap             | [GSAP](https://github.com/greensock/gsap-skills)                         | GreenSock     | UI         | Animation timelines, ScrollTrigger, and GSAP plugins.                  |
| motion           | [Motion](https://github.com/motiondivision/cursor-plugin)                | Motion        | UI         | Web animation, springs, and Motion docs.                               |
| remotion         | [Remotion](https://github.com/remotion-dev/cursor-plugin)                | Remotion      | UI         | Videos and motion graphics with React.                                 |
| algorithmic-art  | [Algorithmic Art](marketplace/ui/algorithmic-art)                        | Anthropic     | UI         | Generative art with p5.js — seeded sketches.                           |
| firebase         | [Firebase](https://github.com/firebase/agent-skills)                     | Firebase      | Backend    | Auth, Firestore, and hosting for the Firebase project.                 |
| convex           | [Convex](https://github.com/get-convex/convex-agent-plugins)             | Convex        | Backend    | Reactive backend and database for the Convex project.                  |
| neon             | [Neon](marketplace/backend/neon)                                         | Neon          | Backend    | Postgres databases, branches, and SQL on Neon.                         |
| planetscale      | [PlanetScale](marketplace/backend/planetscale)                           | PlanetScale   | Backend    | Databases, branches, and schema on PlanetScale.                        |
| appwrite         | [Appwrite](https://github.com/appwrite/cursor-plugin)                    | Appwrite      | Backend    | Auth, database, and storage for the Appwrite project.                  |
| prisma           | [Prisma](https://github.com/prisma/cursor-plugin)                        | Prisma        | Backend    | Schema, migrations, and queries with Prisma.                           |
| auth0            | [Auth0](marketplace/auth/auth0)                                          | Auth0         | Auth       | Sign-in and user management with Auth0.                                |
| workos           | [WorkOS](marketplace/auth/workos)                                        | WorkOS        | Auth       | Sign-in, SSO, and user management with WorkOS.                         |
| shopify          | [Shopify](marketplace/payments/shopify)                                  | Shopify       | Payments   | Products, orders, and store data from Shopify.                         |
| resend           | [Resend](https://github.com/resend/resend-skills)                        | Resend        | Messaging  | Send email and manage templates with Resend.                           |
| figma            | [Figma](marketplace/design/figma)                                        | Figma         | Design     | Read designs and generate code from Figma files.                       |
| miro             | [Miro](https://github.com/miroapp/miro-ai/tree/main/cursor-plugins/miro) | Miro          | Design     | Read boards and create diagrams in Miro.                               |
| posthog          | [PostHog](marketplace/analytics/posthog)                                 | PostHog       | Analytics  | Events, funnels, and session replay from PostHog.                      |
| amplitude        | [Amplitude](marketplace/analytics/amplitude)                             | Amplitude     | Analytics  | Events and charts from the Amplitude project.                          |
| sanity           | [Sanity](marketplace/cms/sanity)                                         | Sanity        | CMS        | Read and edit content in the Sanity dataset.                           |
| granola          | [Granola](https://github.com/granola-inc/granola-cursor-plugin)          | Granola       | Workspace  | Meeting notes and decisions from Granola.                              |
| jira             | [Jira](marketplace/workspace/jira)                                       | Atlassian     | Workspace  | Issues and pages in Jira and Confluence.                               |
| zapier           | [Zapier](marketplace/automation/zapier)                                  | Zapier        | Automation | Run actions and look up data from connected Zapier apps.               |
| composio         | [Composio](marketplace/automation/composio)                              | Composio      | Automation | Run actions across the apps connected in Composio.                     |
| make             | [Make](marketplace/automation/make)                                      | Make          | Automation | Run scenarios and look up data from connected Make apps.               |
| n8n              | [n8n](marketplace/automation/n8n)                                        | n8n           | Automation | Run workflows and look up data from connected n8n apps.                |

Author is `plugin.json` `author.name` when present, else Reforma. Shelf is the parent `categories[]` entry — `plugin.json` has no `category`.

## Repository structure

Root `marketplace.json` lists plugins under `categories[].plugins`. `source` is a path in this repo or a GitHub `tree/…` URL. `"disabled": true` skips pack (folder stays); delete that line to ship after the vendor allowlists us.

Local plugins live under `marketplace/<category>/<name>/`. Origin (first-party vs vendored) is `plugin.json` `author`, not the folder tree. Remote pins stay as GitHub URLs. Array order is section order; empty shelves omit `plugins`.

```
plugins/
├── marketplace.json                 # categories + plugin index
├── marketplace/<category>/<name>/
└── scripts/pack/                    # snapshot for the API (entry: scripts/pack.ts)
```

A plugin folder:

```
marketplace/<category>/<name>/
├── .reforma-plugin/plugin.json
├── assets/logo.svg
└── …convention folders (skills/, rules/, hooks/, …)
```

Other plugin layouts (skills, hooks, tools, MCP) follow the same convention folders as demos — see [demo-kit](marketplace/demo/demo-kit).

```sh
bun install
bun run pack              # writes dist/catalog/ and dist/catalog.tar.gz
```

Pack discovers convention folders (`skills/`, `agents/`, `rules/`, `hooks/`, `tools/`, `mcp.json` or `.mcp.json`) — no path fields needed in source `plugin.json`. Custom paths are remapped into that layout. If you import a Cursor/vendor plugin, pack also normalizes `rules/*.mdc`, `.cursor/rules/`, and `instructions/` to plain `rules/*.md`, renames `.mcp.json` → `mcp.json`, and renames a lone MCP server key to the marketplace plugin name (`chatgpt_app_mcp` → `dropbox`). HTTP MCP with no `tools` in `mcp.json`: pack calls `initialize`, then `tools/list`. Stdio MCP is not probed. Packed `plugin.json` keeps `hooks: "./hooks/hooks.json"` (+ `hookOffers`) and `tools: "./tools.mjs"` (+ `toolOffers`) when those ship. Skills/agents/rules/mcp paths are stripped — catalog and sandbox discover the folders.

Pack **bundles** `tools/*.ts` into one `tools.mjs` (`@reforma/plugin-sdk` / `ai` / `zod` stay external). Export `defineTool` as the file default; name = filename (`Grep.ts` → `Grep`); `override: true` = bare name, shadows.

Push to `main` or `dev` publishes a `catalog-<7-char-sha>` GitHub Release (keeps the newest 10). Reforma API on local/staging tries `dev`, then `main`. Prod bakes `main`.
