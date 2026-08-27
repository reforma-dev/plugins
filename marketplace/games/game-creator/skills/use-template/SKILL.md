---
name: use-template
description: Adapt Phaser or Three.js pattern sketches into this Next app. Use when the user says "use a template", "start from a template", or wants the 2D/3D starter patterns. Do NOT copy a second project root.
argument-hint: "[phaser-2d|threejs-3d] [route-name]"
license: MIT
metadata:
  author: OpusGameLabs
  version: 1.4.0
  tags: [game, template, scaffold]
---

# Use Template

Read a pattern sketch, then write a playable island in **this** Next app. Not a clone.

## Behavior

1. Parse `<template-id> [route-name]`. IDs: `phaser-2d`, `threejs-3d`. Default route `play`.
2. Read `templates/<id>/` (EventBus, GameState, Constants, scenes / Game orchestrator). Treat files as ideas.
3. `bun add phaser` or `bun add three`. If `package.json` / lockfile changed → **InstallDependencies**.
4. Write TypeScript under `app/<route>/`: client canvas, `dynamic(..., { ssr: false })`, `createGame(mountNode)`.
5. Do not copy the folder, do not add Vite / a second `package.json` / `index.html`, do not `npm install` a nested app.

```tsx
"use client";

import { useEffect, useRef } from "react";
import { createGame } from "./game";

export function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const game = createGame(ref.current);
    return () => game.destroy(true);
  }, []);

  return <div ref={ref} className="h-dvh w-full" />;
}
```

## Example

```
/use-template phaser-2d play
/use-template threejs-3d arena
```
