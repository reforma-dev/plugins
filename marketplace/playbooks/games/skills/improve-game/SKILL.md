---
name: improve-game
description: Analyze a game, find what needs work, and implement the highest-impact improvements. Use when the user says "improve my game", "make my game better", "fix my game", "what's wrong with my game", or "polish my game". Run repeatedly — each pass finds the next most impactful thing to fix. Do NOT use for adding specific new features (use add-feature) or initial game creation (use viral-game for one-shot builds, make-game for milestone-driven projects).
argument-hint: "[area-to-focus]"
license: MIT
metadata:
  author: OpusGameLabs
  version: 1.3.0
  tags: [game, improve, audit, fix, polish]
---

## Performance Notes

- Take your time to do this thoroughly
- Quality is more important than speed
- Do not skip validation steps

# Improve Game

Make your game better. This command deep-audits gameplay, visuals, code quality, performance, and player experience, then implements the highest-impact improvements. Run it as many times as you want — each pass finds the next most impactful thing to fix.

## Instructions

Improve the game in the current directory. If `$ARGUMENTS` specifies a focus area (e.g., "gameplay", "visuals", "performance", "polish", "game-over"), weight that area higher but still audit everything.

### Step 1: Deep audit

Read the entire game codebase to build a complete picture:

- App `package.json` — engine, dependencies
- `app/<route>/game/` — Constants, EventBus, GameState, `createGame`
- Scenes / systems / entities / UI / audio next to them
- Input handling (touch + keyboard)

Don't skim. Read every file completely so you understand the full picture before making recommendations.

### Step 2: Score and diagnose

Rate each area on a 1–5 scale (1 = broken/missing, 3 = functional but basic, 5 = polished and complete). Present a diagnostic table:

| Area                    | Score | Diagnosis                                                                                                                                            |
| ----------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gameplay feel**       |       | Is the core loop fun? Are controls responsive? Does difficulty ramp?                                                                                 |
| **Visual polish**       |       | Backgrounds, colors, particles, animations, screen effects                                                                                           |
| **Game Over & UI**      |       | Game over screen, transitions, restart flow, buttons                                                                                                 |
| **Audio**               |       | BGM for each state, SFX for each action, volume balance, mute toggle                                                                                 |
| **Code architecture**   |       | EventBus, GameState, Constants, no circular deps                                                                                                     |
| **Restart safety**      |       | Does GameState.reset() fully clean up? 3 restarts identical? No stale listeners/timers?                                                              |
| **Performance**         |       | Delta capping, object pooling, disposal, no leaks                                                                                                    |
| **Player experience**   |       | Onboarding, feedback, difficulty curve, replayability                                                                                                |
| **Mobile support**      |       | Touch input, responsive layout, gyro/joystick, 44px touch targets                                                                                    |
| **HUD band**            |       | All UI below `SAFE_ZONE.TOP` (~8%)? Nothing clipped by page chrome?                                                                                  |
| **Gameplay invariants** |       | Can the player score? Lose? Restart with visible button labels?                                                                                      |
| **Entity sizing**       |       | Are characters large enough to read? Character-driven games need 12–15% of GAME.WIDTH. Proportional sizing (`GAME.WIDTH * ratio`), not fixed pixels? |
| **Test coverage**       |       | Screenshot pass on boot, gameplay, scoring, restart                                                                                                  |

**Overall score: X / 65**

### Step 3: Improvement plan

From the audit, identify the **top 5–8 improvements** ranked by player impact. For each one:

1. **Title** — short name (e.g., "Add difficulty progression")
2. **Area** — which category it improves
3. **Impact** — why this matters to the player
4. **What to do** — plain-English description of the change
5. **Files touched** — which files will be created or modified

Format as a numbered list. Put the highest-impact items first.

Present the plan to the user and ask which improvements to implement. Options:

- "All" — implement everything
- Specific numbers — implement selected items
- "Top 3" — just the most impactful

**Wait for the user to choose before implementing.**

### Step 4: Implement

For each selected improvement, follow these rules:

1. **Constants first** — add all new config values to `Constants.js`. Zero hardcoded values.
2. **Events next** — add any new events to `EventBus.js` using `domain:action` naming.
3. **State if needed** — add new state fields to `GameState.js` with proper reset.
4. **New files in proper directories** — entities in `entities/`, systems in `systems/`, UI in `ui/`.
5. **Wire through orchestrator** — register new systems in `Game.js` with proper lifecycle.
6. **EventBus for communication** — modules never import each other directly.
7. **Match existing code style** — same patterns, naming, formatting as the rest of the project.
8. **Don't break what works** — existing gameplay, controls, and scoring must still function identically unless the improvement specifically targets them.

After each improvement, **PageScreenshot** `/play`. Fix anything broken before the next improvement.

### Step 5: Verify

After all improvements are implemented:

1. **PageScreenshot** `/play` — boot, score, fail, restart
2. Walk [gameplay-invariants.md](../game-qa/gameplay-invariants.md)

### Step 6: Report

Tell the user what changed:

> **Improvement report**
>
> **Score: X/65 → Y/65** (+Z points)
>
> **Implemented:**
>
> 1. [Title] — [one-sentence summary of what changed]
> 2. [Title] — [one-sentence summary of what changed]
>    ...
>
> **Files created:** [list new files]
> **Files modified:** [list changed files]
>
> **How to test:** Preview this app, open `/play`, and try:
>
> - [specific thing to look for]
> - [specific thing to look for]
>
> **Next improvements:** Run `/game-creator:improve-game` again to find the next batch.

## Focus areas

When `$ARGUMENTS` includes a focus area keyword, weight these specific checks:

**"gameplay"** — core loop, controls, difficulty progression, enemy variety, power-ups, risk/reward, pacing, level design

**"visuals"** — load the game-designer skill and apply its full design audit (backgrounds, palette, animations, particles, transitions, typography, juice)

**"performance"** — delta capping, object pooling, geometry/material disposal, event listener cleanup, requestAnimationFrame usage, draw call count, texture atlas usage

**"polish"** — screen shake, hit pause, squash/stretch, easing curves, sound timing, button feedback, score popups, death animations, transition smoothness

**"game-over"** — game over screen appeal, restart flow, button styling, score display, best score display, animations. **Button text must be visible** — verify `createButton()` uses Container + Graphics + Text (Graphics first, Text second, Container interactive). No title screen unless the user asked. Keep game-over UI below `SAFE_ZONE.TOP`.

**"audio"** — load the game-audio skill. Check BGM coverage (every game state should have music), SFX coverage (every player action should have feedback), volume mixing, transition smoothness between tracks

**"mobile"** — touch input (tap zones, virtual joystick, or gyroscope), canvas fills the mount node, 44px minimum touch targets, no hover-only interactions.

**"ux"** — onboarding (does the player know what to do?), feedback (does every action have a response?), difficulty curve (is it too hard/easy?), replayability (is there a reason to play again?)

## Example Usage

### General improvement

```
/improve-game
```

Result: Deep audit → scores 38/65 → identifies top 6 improvements (difficulty progression, screen shake, better game-over, particle effects, mobile touch, restart safety) → asks which to implement → implements selected → score rises to 52/65.

### Focused improvement

```
/improve-game gameplay
```

Result: Weights gameplay checks higher → finds enemy variety is low and difficulty is flat → adds 3 enemy types with distinct behaviors, progressive speed ramp, and score-based difficulty tiers.

## Troubleshooting

### Improvements break existing gameplay

**Cause:** Changes to shared systems (physics, scoring) have cascading effects.
**Fix:** Test each improvement individually. Run existing tests after each change. Revert if a change breaks core gameplay.

### Too many changes at once

**Cause:** Audit identified 10+ issues and all were implemented simultaneously.
**Fix:** Prioritize top 3-5 improvements. Ship incrementally. Verify after each change.

## Tips

> This command is designed for iterative improvement. Run it multiple times:
>
> - First pass: fix the biggest gaps (missing features, broken UX)
> - Second pass: add polish (particles, transitions, juice)
> - Third pass: fine-tune (difficulty curve, timing, balance)
>
> Each run picks up where the last left off — previously fixed areas will score higher, surfacing new priorities.
>
> For targeted work, use the focus area: `/game-creator:improve-game gameplay` or `/game-creator:improve-game visuals`
