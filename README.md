# Reforma plugins

Marketplace plugins for Reforma. Each plugin is a folder with `.reforma-plugin/plugin.json`. Pack renames `.cursor-plugin`, `.codex-plugin`, or `.claude-plugin` to `.reforma-plugin` when that folder is missing.

## Plugins

| name             | Plugin                                                                   | Author      | Category      | description                                                                        |
| ---------------- | ------------------------------------------------------------------------ | ----------- | ------------- | ---------------------------------------------------------------------------------- |
| demo-hooks       | [Demo Hooks](reforma/demo-hooks)                                         | Reforma     | Demo          | Fixture: SessionStart/End, UserPromptSubmit, PreToolUse Bash guard.                |
| demo-tools       | [Demo Tools](reforma/demo-tools)                                         | Reforma     | Demo          | Fixture: Fortune + Grep override (`defineTool`).                                   |
| demo-kit         | [Demo Kit](reforma/demo-kit)                                             | Reforma     | Demo          | Kitchen-sink: skills, command, rule, agents, hooks, tools, MCP.                    |
| demo-skills      | [Demo Skills](reforma/demo-skills)                                       | Reforma     | Demo          | Test card: bundled skills + rule, no auth.                                         |
| demo-stdio       | [Demo Stdio](reforma/demo-stdio)                                         | Reforma     | Demo          | Stdio MCP: command/args stay as written. Variables substitute into env at connect. |
| demo-system      | [Demo System](reforma/demo-system)                                       | Reforma     | Demo          | Always-on test card. Cannot disable or uninstall.                                  |
| context7         | [Context7](third_party/context7)                                         | Reforma     | Documentation | Up-to-date library docs and code examples. MCP with an API key.                    |
| google-drive     | [Google Drive](third_party/google-drive)                                 | Reforma     | Files         | Search, read, create, and share files across Drive.                                |
| notion-workspace | [Notion Workspace](https://github.com/makenotion/cursor-notion-plugin)   | Notion Labs | —             | Notion Skills + Notion MCP server packaged as a Cursor plugin.                     |
| dropbox          | [Dropbox](https://github.com/dropbox/dropbox-ai-plugins/tree/main/codex) | Dropbox     | —             | Access, save and share files with Dropbox.                                         |

Author is `plugin.json` `author.name` when present, else Reforma. Category is the Reforma marketplace id; `—` means the upstream manifest has no `.reforma-plugin` category.

## Repository structure

Root `marketplace.json` lists plugins. `source` is a path in this repo or a GitHub `tree/…` URL.

```
plugins/
├── marketplace.json           # categories + plugin index
├── reforma/<name>/            # first-party
│   ├── .reforma-plugin/
│   │   └── plugin.json
│   ├── mcp.json / .mcp.json   # optional (pack normalizes to mcp.json)
│   ├── hooks/                 # optional, hooks.json + scripts
│   ├── tools/                 # optional defineTool modules (*.ts → pack tools.mjs)
│   ├── skills/                # optional, SKILL.md per folder
│   ├── rules/                 # optional, always-on *.md
│   └── agents/                # optional
├── third_party/<name>/        # vendored
└── scripts/pack/              # snapshot for the API (entry: scripts/pack.ts)
```

```sh
bun install
bun run pack              # writes dist/catalog/ and dist/catalog.tar.gz
```

Pack discovers convention folders (`skills/`, `agents/`, `rules/`, `hooks/`, `tools/`, `mcp.json` or `.mcp.json`) — no path fields needed in source `plugin.json`. Custom paths are remapped into that layout. If you import a Cursor/vendor plugin, pack also normalizes `rules/*.mdc`, `.cursor/rules/`, and `instructions/` to plain `rules/*.md`, and renames `.mcp.json` → `mcp.json`. Packed `plugin.json` keeps `hooks: "./hooks/hooks.json"` (+ `hookOffers`) and `tools: "./tools.mjs"` (+ `toolOffers`) when those ship. Skills/agents/rules/mcp paths are stripped — catalog and sandbox discover the folders.

Pack **bundles** `tools/*.ts` into one `tools.mjs` (`@reforma/plugin-sdk` / `ai` / `zod` stay external). Export `defineTool` as the file default; name = filename (`Grep.ts` → `Grep`); `override: true` = bare name, shadows.

Push to `main` or `dev` publishes a `catalog-<7-char-sha>` GitHub Release (keeps the newest 10). Reforma API on local/staging tries `dev`, then `main`. Prod bakes `main`.
