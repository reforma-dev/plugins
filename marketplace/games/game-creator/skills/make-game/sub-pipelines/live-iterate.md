# Live iterate

Post-edit check during development. Run after every meaningful code change. A change is not done until this loop has run.

## When to use

- A code change just landed in the development phase
- A milestone step finished
- A bug fix landed (also run the repro from [bug-fix.md](bug-fix.md))
- The user asked "did that work?" or "can you check?"

## Inputs

- This Next app's preview (no nested Vite)
- The files you just changed under `app/<route>/` (default `play`)
- The acceptance criterion or bug repro from the milestone

Read `GameState` / `Constants` in source. **PageScreenshot** the route.

## Steps

1. **Preview this project.** If `package.json` / lockfile changed → **InstallDependencies** first.

2. **PageScreenshot** `/play` (or the named route). Look for boot, input, score, fail, restart. Any crash or blank canvas → stop and fix. Do not paper over with try/catch.

3. **Read GameState in source** for the fields the change should have touched (mode, score, reset). Confirm `reset()` still clears them.

4. **Regression smoke.** Score still increments? Fail still fires? Restart still a clean slate? Adjacent systems that share EventBus events still make sense.

5. **Verdict.** One of:
   - **Verified** — matches the AC, no regressions.
   - **Off-target** — runs but misses the AC. Edit, re-loop.
   - **Broken** — crash or blank. Fix before anything else.

6. **Hand back one line + one question.** Not a dump. Example: "Jump apex looks ~0.4s. Landing still floaty, or good?"

## Outputs

- A screenshot of the route
- A one-line verdict and one focused question

## Exit criteria

- Screenshot shows the change (or a listed fail with a fix)
- The AC or repro is satisfied, or deferred with the user
- The user has a narrow question, not a wall of state
