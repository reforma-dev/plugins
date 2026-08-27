# Reforma plugins

Marketplace plugins for Reforma. Each plugin is a folder with `.reforma-plugin/plugin.json`. Pack renames `.cursor-plugin`, `.codex-plugin`, or `.claude-plugin` to `.reforma-plugin` when that folder is missing.

## Plugins

| name             | Plugin                                                                   | Author      | Category  | description                                                                               |
| ---------------- | ------------------------------------------------------------------------ | ----------- | --------- | ----------------------------------------------------------------------------------------- |
| demo-hooks       | [Demo Hooks](marketplace/demo/demo-hooks)                                | Reforma     | Demo      | Fixture: SessionStart/End, UserPromptSubmit, PreToolUse Bash guard.                       |
| demo-tools       | [Demo Tools](marketplace/demo/demo-tools)                                | Reforma     | Demo      | Fixture: Fortune + Grep override (`defineTool`).                                          |
| demo-kit         | [Demo Kit](marketplace/demo/demo-kit)                                    | Reforma     | Demo      | Kitchen-sink: skills, command, rule, agents, hooks, tools, MCP.                           |
| demo-skills      | [Demo Skills](marketplace/demo/demo-skills)                              | Reforma     | Demo      | Test card: bundled skills + rule, no auth.                                                |
| demo-stdio       | [Demo Stdio](marketplace/demo/demo-stdio)                                | Reforma     | Demo      | Stdio MCP: command/args stay as written. Variables substitute into env at connect.        |
| demo-system      | [Demo System](marketplace/demo/demo-system)                              | Reforma     | Demo      | Always-on test card. Cannot disable or uninstall.                                         |
| bro-mode         | [Bro Mode](marketplace/moods/bro-mode)                                   | Reforma     | Moods     | Brother energy — blunt, warm, pushes back.                                                |
| zen-mode         | [Zen Mode](marketplace/moods/zen-mode)                                   | Reforma     | Moods     | Calm, minimal, one clear step at a time.                                                  |
| ship-it          | [Ship It](marketplace/moods/ship-it)                                     | Reforma     | Moods     | Smallest shippable change — merge beats polish.                                           |
| professor        | [Professor](marketplace/moods/professor)                                 | Reforma     | Moods     | Explain the why — context and tradeoffs.                                                  |
| hype-man         | [Hype Man](marketplace/moods/hype-man)                                   | Reforma     | Moods     | Founder energy — vision, momentum, this thing wins.                                       |
| caveman-mode     | [Caveman](marketplace/moods/caveman-mode)                                | Reforma     | Moods     | Cave-person talk. Broken words. Me do work.                                               |
| shadcn-tailwind  | [shadcn / Tailwind](marketplace/ui/shadcn-tailwind)                      | shadcn      | UI        | Always-on UI foundation. Official primitives + Tailwind. MCP search/view. Cannot disable. |
| fonts            | [Fonts](marketplace/ui/fonts)                                            | Reforma     | UI        | Always-on font wiring. next/font faces, role tokens, ImportAsset WOFF2. Cannot disable.   |
| coss             | [coss](marketplace/ui/coss)                                              | coss        | UI        | Opt-in @coss primitives and particles.                                                    |
| flexnative       | [Flexnative](marketplace/ui/flexnative)                                  | Flexnative  | UI        | Opt-in @flx blocks, patterns, and intents.                                                |
| context7         | [Context7](marketplace/workspace/context7)                               | Reforma     | Workspace | Up-to-date library docs and code examples. MCP with an API key.                           |
| google-drive     | [Google Drive](marketplace/files/google-drive)                           | Reforma     | Files     | Search, read, create, and share files across Drive.                                       |
| notion-workspace | [Notion Workspace](https://github.com/makenotion/cursor-notion-plugin)   | Notion Labs | Workspace | Notion Skills + Notion MCP server packaged as a Cursor plugin.                            |
| dropbox          | [Dropbox](https://github.com/dropbox/dropbox-ai-plugins/tree/main/codex) | Dropbox     | Files     | Access, save and share files with Dropbox.                                                |

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
