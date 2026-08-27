# Scaffold phase

After the idea has been solidified, scaffold the project. The exact steps depend on the tech stack chosen in `docs/tech.md`.

## When to use

- Idea phase exit criteria are met (`docs/gameplan.md`, `docs/tech.md`, ADR-0001 exist)
- Project source files do not yet exist, or dependencies are not installed
- The user is ready to start building

## Inputs

- `docs/gameplan.md` (game definition)
- `docs/tech.md` (engine, language, libraries, tooling)
- `docs/architectural-decisions/0001-*.md` (locked engine/language/art-style)
- The current working directory

## Disambiguation: two kinds of "templates"

Two folders in this plugin both contain the word **templates**. They are different things — do not confuse them:

- **Project sketches** at the plugin `templates/` (e.g. `templates/phaser-2d/`, `templates/threejs-3d/`). Pattern ideas (EventBus, scenes) to rewrite into this Next app. _This step uses these._
- **Doc skeletons** at `skills/make-game/templates/` (`gameplan.md`, `tech.md`, `milestone.md`, `adr.md`, `state.md`). Empty markdown shells the skill mandates. _Used in idea/development phases for writing docs._

When this pipeline says "sketch," it means the first; when it says "doc skeleton," it means the second.

## Steps

**1. Re-read `docs/tech.md`**

Confirm the engine, language, and tooling. The scaffold method follows directly from this file.

**2. Prefer `/use-template` if a sketch matches and `/use-template` is available**

If `templates/phaser-2d/` or `templates/threejs-3d/` matches the engine in `docs/tech.md`, run `/use-template <id> [route]`. That reads the patterns and writes a client island under `app/` — not a copy + `npm install`.

**3. If no sketch matches, add the engine as a library — do not start a second app**

This project is already a Next.js App Router starter (`app/`, bun). For Phaser / Three.js: `bun add phaser` or `bun add three`, then **InstallDependencies**. Skip `npx degit`, `npm create vite`, `npm create @phaserjs/game`, and a second `package.json`.

For a non-browser engine (Unity, Unreal, Godot) that cannot live in this app, stop and ask the user how they want to proceed.

**4. Write the island**

- Mount under `app/<route>/` with `'use client'` + `dynamic(..., { ssr: false })`.
- Take EventBus / GameState / Constants / scene split from the sketches. Rewrite in TypeScript — do not copy the folder.
- Do not add Vite config, `index.html`, or a nested `package.json`.

**5. Set up asset and binary conventions early**

Run the [asset-pipeline sub-pipeline](../sub-pipelines/asset-pipeline.md) once during scaffold. Establishing folder layout, naming, and Git LFS now is much cheaper than retrofitting later.

**6. Smoke test**

Boot the game in the browser (or the engine's play mode). Confirm:

- No build errors
- No console errors at startup
- The initial scene renders something — even a placeholder cube or empty scene with the camera live counts

If the smoke test fails, fix it before declaring scaffold done. A "compiles clean but crashes on boot" state is the most common scaffold-phase trap.

**7. Bootstrap `AGENTS.md` and `CLAUDE.md`**

Run the [agents-bootstrap sub-pipeline](../sub-pipelines/agents-bootstrap.md). This produces the project-root files that enforce `make-game` rules across every future session and every agent tool. Do not skip — it's the strongest cross-session enforcement mechanism in the skill, and it's much cheaper to write now than to retrofit later.

**8. Update `docs/STATE.md`**

Phase: `scaffold` → `development`. Set the next step to the first AC of milestone 01.

## Outputs

- Initial project files committed
- Dependencies installed
- Asset folder layout in place
- Boot smoke test passing
- `AGENTS.md` and `CLAUDE.md` at project root (filled, no placeholders)
- `docs/STATE.md` flipped to development phase

## Exit criteria

- Game island mounts (`ssr: false`); initial scene renders
- No console errors
- `AGENTS.md` exists at the project root and is filled in
- `CLAUDE.md` points to `AGENTS.md`
- A future agent can preview this Next app without a second Vite/`npm run dev` root
