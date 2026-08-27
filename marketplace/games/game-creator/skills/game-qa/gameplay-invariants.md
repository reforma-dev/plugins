# Gameplay Invariants

The game on `/play` (or the named route) must be playable, not just render. Check these after every meaningful change. **PageScreenshot** the route; read `GameState` / EventBus in `app/` to know what "pass" looks like.

## 1. Scoring

The player can earn at least 1 point through normal play (not by editing state).

## 2. Fail condition

The player can lose: collision, timer, fall, or inaction. Doing nothing must not win.

## 3. Game-over chrome

After fail: title, score, and a restart control with a visible label. Restart restores a clean `GameState.reset()` — three restarts in a row behave the same.

## 4. Boot

Canvas mounts (`'use client'` + `dynamic(..., { ssr: false })`). No SSR/WebGL blank. Input (keyboard + touch if the game is mobile) moves the player.

## 5. Design intent

Mechanics that exist in code actually change the game. If Constants say a hazard deals damage, a screenshot after contact shows fail or a health drop — not a no-op.

## 6. Entity interactions

Visible moving entities that collide with one thing collide with the rest of that class. Flag `// QA FLAG: asymmetric interaction` in the handler if one side is decorative and it isn't obvious.

## 7. Mute (if audio exists)

`GameState.isMuted` toggles. M key or a speaker control. Screenshot before/after if the UI has a mute button.
