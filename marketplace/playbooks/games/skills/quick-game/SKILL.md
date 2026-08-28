---
name: quick-game
description: Rapidly scaffold and implement a playable game — no assets, design, audio, deploy, or monetize. Get something on screen fast. Use when the user says "quick game", "fast prototype", "just get something playable", or wants a game without the full pipeline. For the complete one-shot pipeline (deploy + monetize), use /viral-game instead. For a milestone-driven project, use /make-game. Do NOT use for production games.
argument-hint: "[2d|3d] [game-name] OR [tweet-url]"
license: MIT
metadata:
  author: OpusGameLabs
  version: 1.3.0
  tags: [game, prototype, scaffold, fast]
---

## Performance Notes

- Take your time to do this thoroughly
- Quality is more important than speed
- Do not skip validation steps

# Quick Game (Fast Prototype)

Build a playable game prototype as fast as possible. This is `/viral-game` without the polish — just scaffold + implement the core loop. Get something on screen, then incrementally add layers with `/add-assets`, `/design-game`, and `/add-audio`.

**What you'll get:**

1. A scaffolded game project with clean architecture
2. Core gameplay — input, movement, scoring, fail condition, restart
3. The game on `/play` (or the named route) you can preview immediately

**What you skip** (run these later if you want):

- `/add-assets` — pixel art sprites (2D) or 3D models
- `/design-game` — visual polish, particles, transitions
- `/add-audio` — music and sound effects

## Instructions

### Step 0: Parse arguments

Parse `$ARGUMENTS` to determine the game concept:

**Direct specification:** `[2d|3d] [game-name]`

- **Engine**: `2d` (Phaser) or `3d` (Three.js). If not specified, default to `2d`.
- **Name**: kebab-case. If not specified, ask the user.

**Tweet URL:** If arguments contain a tweet URL (`x.com/*/status/*`, `twitter.com/*/status/*`, `fxtwitter.com/*/status/*`):

1. Fetch the tweet using the `fetch-tweet` skill
2. Default to 2D
3. Creatively abstract a game concept from the tweet
4. Generate a kebab-case name
5. Tell the user what you'll build

**Meshy API Key (3D only):** If 3D, check for `MESHY_API_KEY`. If missing, ask the user (link to https://app.meshy.ai). Store for model generation.

### Step 1: Scaffold + Implement

**Infrastructure (main thread):**

1. Read `templates/phaser-2d/` or `templates/threejs-3d/` as pattern sketches (EventBus, GameState, scenes). Do not copy the folder.
2. `bun add phaser` or `bun add three`. If `package.json` / lockfile changed → **InstallDependencies**.
3. Implement under `app/<game-name>/` (or `app/play/` if unnamed): `'use client'` canvas, `dynamic(..., { ssr: false })`, `createGame(mountNode)`.
4. Preview this project — do not start a second Vite/`npm run dev` server.

**Game implementation (subagent via Task):**

Launch a `Task` subagent with:

> You are building a quick game prototype. Speed is the priority — get a playable core loop working.
>
> **Project path**: this Next app (`app/<game-name>/`)
> **Engine**: `<2d|3d>`
> **Game concept**: `<description>`
> **Skill to load**: `phaser` (2D) or `threejs-game` (3D)
>
> **Implement in this order:**
>
> 1. Input (touch + keyboard from the start)
> 2. Player movement / core mechanic
> 3. Fail condition (death, collision, timer)
> 4. Scoring
> 5. Restart flow (GameState.reset() → clean slate)
>
> **Scope: 1 scene, 1 mechanic, 1 fail condition.** Keep it tight.
>
> Rules:
>
> - All cross-module communication via EventBus
> - All magic numbers in Constants.js
> - No title screen — boot directly into gameplay
> - Score HUD is optional — keep it out of SAFE_ZONE.TOP if the page has chrome
> - Mobile-first input: touch + keyboard, use unified InputSystem pattern
> - Import `SAFE_ZONE` from Constants.js — keep UI below `SAFE_ZONE.TOP`
> - Minimum 7-8% canvas width for collectibles/hazards
> - Character sizing: `GAME.WIDTH * 0.12` to `GAME.WIDTH * 0.15` for character-driven games
> - Preserve the template's `createButton()` helper in GameOverScene — do NOT rewrite it
> - Wire spectacle events: `SPECTACLE_ENTRANCE`, `SPECTACLE_ACTION`, `SPECTACLE_HIT`, `SPECTACLE_COMBO`, `SPECTACLE_STREAK`, `SPECTACLE_NEAR_MISS`
> - Add `isMuted` to GameState for future audio support
> - Ensure restart is clean — 3 restarts in a row should work identically

### Step 2: Verify

After the subagent returns:

1. Confirm the island mounts (client component + `ssr: false`) and the engine import resolves
2. If imports fail, run **InstallDependencies** after `bun add`
3. **PageScreenshot** the route

## Example Usage

### 2D game

```
/quick-game 2d asteroid-dodge
```

Result: Phaser island under `app/asteroid-dodge/` — player ship, asteroid spawning, collision death, score, restart. Shapes only, no polish.

### From tweet

```
/quick-game https://x.com/user/status/123456
```

Result: Fetches tweet → abstracts game concept → scaffolds and implements a playable prototype inspired by the tweet content.

## Troubleshooting

### Game scaffolds but won't start

**Cause:** Canvas ran on the server, or Phaser/Three was not installed.
**Fix:** `'use client'` + `dynamic(..., { ssr: false })`. `bun add phaser` or `bun add three`, then **InstallDependencies**.

### Missing core files

**Cause:** Scaffold skipped EventBus/GameState/Constants.
**Fix:** Every game needs core/EventBus.js, core/GameState.js, core/Constants.js. Re-run scaffold or create manually.

### Done

Tell the user:

> Your game is on `/<route>`. Use this project's preview to play.
>
> **To keep building, run these commands:**
>
> - `/add-assets` — replace shapes with pixel art sprites
> - `/design-game` — add visual polish (particles, gradients, juice)
> - `/add-audio` — add music and sound effects
>
> Or run `/viral-game` next time for the full one-shot pipeline.
