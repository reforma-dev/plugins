---
name: add-feature
description: Add a new gameplay feature to an existing browser game following its architecture patterns. Use when the user says "add a feature", "add double-jump", "add a power-up", "add a leaderboard", or describes a specific game mechanic to implement. Do NOT use for visual-only changes (use design-game) or replacing shapes with sprites (use add-assets).
argument-hint: "[feature-description]"
license: MIT
metadata:
  author: OpusGameLabs
  version: 1.3.0
  tags: [game, feature, gameplay, mechanic, power-up]
---

## Performance Notes

- Take your time to do this thoroughly
- Quality is more important than speed
- Do not skip validation steps

# Add Feature

Add a new feature to your game. Just describe what you want in plain English — for example, "add a double-jump power-up" or "add a high score leaderboard" — and the feature will be built following your game's existing patterns.

## Instructions

The user wants to add: $ARGUMENTS

### Step 1: Understand the codebase

- Read `package.json` to identify the engine (Three.js or Phaser)
- Read `app/play/game/` (or the named route) — EventBus, GameState, Constants, scenes
- Read existing scene and gameplay files to understand what's already built

### Step 2: Plan the feature

Before writing code, explain the plan in plain English:

1. **What it does**: Describe the feature from the player's perspective
2. **How it works**: List the new files, events, and settings that will be created
3. **What it touches**: List existing files that need small changes to wire in the feature

Then determine what's needed technically:

- New module file(s) and where they go in the directory structure
- New events to add to the Events enum
- New constants to add to Constants.js
- New state to add to GameState.js
- How to wire it into the Game orchestrator

### Step 3: Implement

Follow these rules strictly:

1. Create the new module next to the existing game files under `app/<route>/game/`
2. Add ALL new events to `EventBus.js` Events enum
3. Add ALL configuration values to `Constants.js` (zero hardcoded values)
4. Add any new state domains to `GameState.js`
5. Wire the new system into `Game.js` (import, instantiate, update in loop)
6. Use EventBus for ALL communication with other systems
7. Follow the existing code style and patterns in the project

### Step 4: Verify

- **PageScreenshot** `/play` (or the named route). Confirm the feature didn't break boot, score, fail, or restart.
- Confirm the feature integrates without breaking existing systems
- Check that no circular dependencies were introduced
- Ensure event listeners are properly cleaned up if applicable
- Summarize what was added in plain English

## Troubleshooting

### Game breaks after adding feature

**Cause:** New code conflicts with existing EventBus events or GameState fields.
**Fix:** Check for event name collisions in EventBus.js. Ensure new state fields have defaults in GameState.reset().

### Feature works but breaks existing gameplay

**Cause:** Modified shared constants or collision groups.
**Fix:** Add new constants rather than changing existing ones. Test original gameplay after changes.

## Output

Tell the user:

1. What the feature does (from the player's perspective)
2. What files were created or changed
3. How to test it — "Preview this app, open `/play`, try [specific action]"

## Example Usage

### Adding a power-up

```
/add-feature add a speed boost power-up that spawns randomly
```

Result: Creates `app/play/game/entities/PowerUp.ts`, adds `POWER_UP` events to EventBus, adds spawn timing and duration to Constants, wires into `createGame`. Player collects power-up → speed doubles for 8 seconds.

### Adding a scoring mechanic

```
/add-feature add combo multiplier that increases when you score quickly
```

Result: Adds `comboMultiplier` and `comboTimer` to GameState, creates combo logic in scoring system, adds `COMBO_CHANGED` event for UI updates.

## Tips

> You can run this command as many times as you want to keep adding features. Each one builds on the last.
>
> When you're happy with the gameplay, run `/game-creator:design-game` to polish the visuals, `/game-creator:add-audio` for music and sound effects, or `/game-creator:review-game` for a full quality check.
