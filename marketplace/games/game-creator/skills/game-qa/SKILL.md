---
name: game-qa
description: Gameplay checks for a Phaser/Three island — boot, score, fail, restart. Use when writing or running game QA. qa-game is the user-facing command.
argument-hint: "[route]"
license: MIT
metadata:
  author: OpusGameLabs
  version: 1.4.0
  tags: [game, qa, testing]
---

# Game QA

This Next app already has preview. Visual check is **PageScreenshot** on `/play` (or the named route). Load [gameplay-invariants.md](gameplay-invariants.md) and walk every item.

## Loop

1. Read `app/<route>/` — EventBus, GameState, Constants, scenes.
2. Confirm the island: `'use client'` + `dynamic(..., { ssr: false })`.
3. **PageScreenshot**. Compare to invariants 1–7. Note what failed (blank canvas, no score, no fail, restart broken, HUD clipped).
4. Fix game code. Screenshot again. Cap 2 rounds, then report.

If `package.json` has `phaser` or `three`, load that engine skill before judging architecture.
