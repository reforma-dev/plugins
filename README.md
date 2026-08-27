# Reforma plugins

Marketplace plugins for Reforma. Each plugin is a folder with `.reforma-plugin/plugin.json`. Pack renames `.cursor-plugin`, `.codex-plugin`, or `.claude-plugin` to `.reforma-plugin` when that folder is missing.

## Plugins

| name             | Plugin                                                                   | Author        | Category  | description                                                            |
| ---------------- | ------------------------------------------------------------------------ | ------------- | --------- | ---------------------------------------------------------------------- |
| demo-kit         | [Demo Kit](marketplace/demo/demo-kit)                                    | Reforma       | Demo      | Sample plugin to try the catalog — skills, tools, hooks, and a server. |
| bro-mode         | [Bro Mode](marketplace/moods/bro-mode)                                   | Reforma       | Moods     | Brother energy — blunt, warm, pushes back.                             |
| zen-mode         | [Zen Mode](marketplace/moods/zen-mode)                                   | Reforma       | Moods     | Calm, minimal, one clear step at a time.                               |
| ship-it          | [Ship It](marketplace/moods/ship-it)                                     | Reforma       | Moods     | Smallest shippable change — merge beats polish.                        |
| professor        | [Professor](marketplace/moods/professor)                                 | Reforma       | Moods     | Explain the why — context and tradeoffs.                               |
| hype-man         | [Hype Man](marketplace/moods/hype-man)                                   | Reforma       | Moods     | Founder energy — vision, momentum, this thing wins.                    |
| caveman-mode     | [Caveman](marketplace/moods/caveman-mode)                                | Reforma       | Moods     | Cave-person talk. Broken words. Me do work.                            |
| shadcn-tailwind  | [shadcn / Tailwind](marketplace/ui/shadcn-tailwind)                      | shadcn        | UI        | Official components and Tailwind utilities for the project.            |
| fonts            | [Fonts](marketplace/ui/fonts)                                            | Reforma       | UI        | Google Fonts and custom typefaces for the project.                     |
| coss             | [coss](marketplace/ui/coss)                                              | coss          | UI        | Extra components and particles on top of shadcn.                       |
| flexnative       | [Flexnative](marketplace/ui/flexnative)                                  | Flexnative    | UI        | Ready-made blocks and patterns on top of shadcn.                       |
| context7         | [Context7](marketplace/workspace/context7)                               | Reforma       | Workspace | Up-to-date library docs and examples. Needs an API key.                |
| google-drive     | [Google Drive](marketplace/files/google-drive)                           | Reforma       | Files     | Search, read, create, and share files across Drive.                    |
| notion-workspace | [Notion Workspace](https://github.com/makenotion/cursor-notion-plugin)   | Notion Labs   | Workspace | Notion Skills + Notion MCP server packaged as a Cursor plugin.         |
| linear           | [Linear](https://github.com/linear/cursor-plugin)                        | Linear        | Workspace | Issues, projects, and docs from the Linear workspace.                  |
| dropbox          | [Dropbox](https://github.com/dropbox/dropbox-ai-plugins/tree/main/codex) | Dropbox       | Files     | Access, save and share files with Dropbox.                             |
| slack            | [Slack](marketplace/workspace/slack)                                     | Slack         | Workspace | Search channels, read threads, and post to the workspace.              |
| github-mcp       | [GitHub](marketplace/workspace/github-mcp)                               | GitHub        | Workspace | Search issues, pull requests, and code in GitHub repositories.         |
| clerk            | [Clerk](marketplace/auth/clerk)                                          | Clerk         | Auth      | Sign-in, organizations, and user management for the app.               |
| supabase         | [Supabase](https://github.com/supabase-community/supabase-plugin)        | Supabase      | Backend   | Database, auth, and storage for the Supabase project.                  |
| stripe           | [Stripe](https://github.com/stripe/ai/tree/main/providers/cursor/plugin) | Stripe        | Payments  | Payments, customers, and webhooks from the Stripe account.             |
| higgsfield       | [Higgsfield](https://github.com/higgsfield-ai/cursor-plugin)             | Higgsfield AI | Media     | Images and video from Higgsfield.                                      |
| sentry           | [Sentry](https://github.com/getsentry/plugin-cursor)                     | Sentry        | Analytics | Errors and traces from the Sentry org.                                 |

Author is `plugin.json` `author.name` when present, else Reforma. Shelf is the parent `categories[]` entry — `plugin.json` has no `category`.

## Repository structure

Root `marketplace.json` lists plugins under `categories[].plugins`. `source` is a path in this repo or a GitHub `tree/…` URL.

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
