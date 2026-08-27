---
name: threejs-game
description: Build 3D browser games with Three.js using event-driven modular architecture. Use when creating a new 3D game, adding 3D game features, setting up Three.js scenes, or working on any Three.js game project.
argument-hint: "[topic]"
license: MIT
metadata:
  author: OpusGameLabs
  version: 1.3.0
  tags: [game, 3d, threejs, webgl, event-driven, modular]
---

# Three.js Game Development

You are an expert Three.js game developer. Follow these opinionated patterns when building 3D browser games.

> **Reference**: See `reference/llms.txt` (quick guide) and `reference/llms-full.txt` (full API + TSL) for official Three.js LLM documentation. Prefer patterns from those files when they conflict with this skill.

## Performance Notes

- Take your time with each step. Quality is more important than speed.
- Do not skip validation steps — they catch issues early.
- Read the full context of each file before making changes.
- Profile before optimizing. The bottleneck is rarely where you think.

## Reference Files

For detailed reference, see companion files in this directory:

- `core-patterns.md` — Full EventBus, GameState, Constants, and Game.js orchestrator code
- `tsl-guide.md` — Three.js Shading Language reference (NodeMaterial classes, when to use TSL)
- `input-patterns.md` — Gyroscope input, virtual joystick, unified analog InputSystem, input priority system

For performance optimization patterns with measured before/after evidence, see the **threejs-perf** skill (`skills/threejs-perf/SKILL.md`).

## Tech Stack

- **Renderer**: Three.js (`three`, ESM imports)
- **Host**: this Next.js App Router app (`app/`, bun)
- **Language**: TypeScript in the app. Plugin sketches under `templates/threejs-3d/` are JS ideas.

## Project Setup

```bash
bun add three
```

Then **InstallDependencies**. Mount `createGame(el)` from a `'use client'` island under `app/<route>/` with `dynamic(..., { ssr: false })`. Read `templates/threejs-3d/` — do not copy the folder, do not add Vite.

```tsx
"use client";

import { useEffect, useRef } from "react";
import { createGame } from "./game";

export function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const game = createGame(ref.current);
    return () => game.destroy();
  }, []);

  return <div ref={ref} className="h-dvh w-full" />;
}
```

## Modern Import Patterns

### Bundler / npm (this Next app)

```js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
```

### Import Maps / CDN (standalone HTML games, no build step)

```html
<script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.183.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.183.0/examples/jsm/"
    }
  }
</script>
<script type="module">
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
</script>
```

Use import maps when shipping a single HTML file with no build tooling. Pin the version in the import map URL.

## Required Architecture

Every Three.js game MUST use this module split (place it under `app/<route>/game/`):

```
app/<route>/game/
├── core/
│   ├── Game.ts
│   ├── EventBus.ts
│   ├── GameState.ts
│   └── Constants.ts
├── systems/
├── gameplay/
├── level/
├── ui/
└── createGame.ts
```

## Core Principles

1. **Core loop first** — Implement one camera, one scene, one gameplay loop. Add player input and a terminal condition (win/lose) **before** adding visual polish. Keep initial scope small: 1 mechanic, 1 fail condition, 1 scoring system.
2. **Gameplay clarity > visual complexity** — Treat 3D as a style choice, not a complexity mandate. A readable game with simple materials beats a visually complex but confusing one.
3. **Restart-safe** — Gameplay must be fully restart-safe. `GameState.reset()` must restore a clean slate. Dispose geometries/materials/textures on cleanup. No stale references or leaked listeners across restarts.

## Core Patterns (Non-Negotiable)

Every Three.js game requires these four core modules. Full implementation code is in `core-patterns.md`.

### 1. EventBus Singleton

ALL inter-module communication goes through an EventBus (`core/EventBus.js`). Modules never import each other directly for communication. Provides `on`, `once`, `off`, `emit`, and `clear` methods. Events use `domain:action` naming (e.g., `player:hit`, `game:over`). See `core-patterns.md` for the full implementation.

### 2. Centralized GameState

One singleton (`core/GameState.js`) holds ALL game state. Systems read from it, events update it. Must include a `reset()` method that restores a clean slate for restarts. See `core-patterns.md` for the full implementation.

### 3. Constants File

Every magic number, balance value, asset path, and configuration goes in `core/Constants.js`. Never hardcode values in game logic. Organize by domain: `PLAYER_CONFIG`, `ENEMY_CONFIG`, `WORLD`, `CAMERA`, `COLORS`, `ASSET_PATHS`. See `core-patterns.md` for the full implementation.

### 4. Game.js Orchestrator

The Game class (`core/Game.js`) initializes everything and runs the render loop. Uses `renderer.setAnimationLoop()` -- the official Three.js pattern (handles WebGPU async correctly and pauses when the tab is hidden). Sets up renderer, scene, camera, systems, UI, and event listeners in `init()`. See `core-patterns.md` for the full implementation.

## Renderer Selection

### WebGLRenderer (default — use for all game templates)

Maximum browser compatibility. Well-established, most examples and tutorials use this. Our templates default to WebGLRenderer.

```js
import * as THREE from "three";
const renderer = new THREE.WebGLRenderer({ antialias: true });
```

### WebGPURenderer (when you need TSL or compute shaders)

Required for custom node-based materials (TSL), compute shaders, and advanced rendering. Note: import path changes to `'three/webgpu'` and init is async.

```js
import * as THREE from "three/webgpu";
const renderer = new THREE.WebGPURenderer({ antialias: true });
await renderer.init();
```

**When to pick WebGPU**: You need TSL custom shaders, compute shaders, or node-based materials. Otherwise, stick with WebGL. See `tsl-guide.md` for TSL details.

## HUD band

Keep overlay UI below `SAFE_ZONE.TOP` (about 8% of the viewport) so page chrome does not cover buttons.

## Performance Rules

- **Use `renderer.setAnimationLoop()`** instead of manual `requestAnimationFrame`. It pauses when the tab is hidden and handles WebGPU async correctly.
- **Cap delta time**: `Math.min(clock.getDelta(), 0.1)` to prevent death spirals
- **Cap pixel ratio**: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — avoids GPU overload on high-DPI screens
- **Object pooling**: Reuse `Vector3`, `Box3`, temp objects in hot loops to minimize GC. Avoid per-frame allocations — preallocate and reuse.
- **Disable shadows on first pass** — Only enable shadow maps when specifically needed and tested on mobile. Dynamic shadows are the single most expensive rendering feature.
- **Keep draw calls low** — Fewer unique materials and geometries = fewer draw calls. Merge static geometry where possible. Use instanced meshes for repeated objects. See `skills/threejs-perf/` for InstancedMesh patterns (~9,000× fewer draw calls, ~57× faster render CPU).
- **Prefer simple materials** — Use `MeshBasicMaterial` or `MeshStandardMaterial`. Avoid `MeshPhysicalMaterial`, custom shaders, or complex material setups unless specifically needed.
- **No postprocessing by default** — Skip bloom, SSAO, motion blur, and other postprocessing passes on first implementation. These tank mobile performance. Add only after gameplay is solid and perf budget allows.
- **Keep geometry/material count small** — A game with 10 unique materials renders faster than one with 100. Reuse materials across objects with the same appearance.
- **Use `powerPreference: 'high-performance'`** on the renderer
- **Dispose properly**: Call `.dispose()` on geometries, materials, textures when removing objects
- **Frustum culling**: Let Three.js handle it (enabled by default) but set bounding spheres on custom geometry

## Asset Loading

- Place static assets in `/public/` for Vite
- Use GLB format for 3D models (smaller, single file)
- Use `THREE.TextureLoader`, `GLTFLoader` from `three/addons`
- Show loading progress via callbacks to UI

```js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

function loadModel(path) {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error),
    );
  });
}
```

## Input Handling (Mobile-First)

All games MUST work on desktop AND mobile unless explicitly specified otherwise. Allocate 60% effort to mobile / 40% desktop when making tradeoffs. Choose the best mobile input for each game concept:

| Game Type           | Primary Mobile Input           | Fallback          |
| ------------------- | ------------------------------ | ----------------- |
| Marble/tilt/balance | Gyroscope (DeviceOrientation)  | Virtual joystick  |
| Runner/endless      | Tap zones (left/right half)    | Swipe gestures    |
| Puzzle/turn-based   | Tap targets (44px min)         | Drag & drop       |
| Shooter/aim         | Virtual joystick + tap-to-fire | Dual joysticks    |
| Platformer          | Virtual D-pad + jump button    | Tilt for movement |

### Unified Analog InputSystem

Use a dedicated InputSystem that merges keyboard, gyroscope, and touch into a single analog interface. Game logic reads `moveX`/`moveZ` (-1..1) and never knows the source. Keyboard input is always active as an override; on mobile, the system initializes gyroscope (with iOS 13+ permission request) or falls back to a virtual joystick. See `input-patterns.md` for the full implementation, including GyroscopeInput, VirtualJoystick, and input priority patterns.

## When Adding Features

1. Create a new module in the appropriate `src/` subdirectory
2. Define new events in `EventBus.js` Events object using `domain:action` naming
3. Add configuration to `Constants.js`
4. Add state to `GameState.js` if needed
5. Wire it up in `Game.js` orchestrator
6. Communicate with other systems ONLY through EventBus

## Pre-Ship Validation Checklist

Before considering a game complete, verify:

- [ ] **Core loop works** — Player can start, play, lose/win, and see the result
- [ ] **Restart works cleanly** — `GameState.reset()` restores a clean slate, all Three.js resources disposed
- [ ] **Touch + keyboard input** — Game works on mobile (gyro/joystick/tap) and desktop (keyboard/mouse)
- [ ] **Responsive canvas** — Renderer resizes on window resize, camera aspect updated
- [ ] **All values in Constants** — Zero hardcoded magic numbers in game logic
- [ ] **EventBus only** — No direct cross-module imports for communication
- [ ] **Resource cleanup** — Geometries, materials, textures disposed when removed from scene
- [ ] **No postprocessing** — Unless explicitly needed and tested on mobile
- [ ] **Shadows disabled** — Unless explicitly needed and budget allows
- [ ] **Delta-capped movement** — `Math.min(clock.getDelta(), 0.1)` on every frame
- [ ] **Mute toggle** — Audio can be muted/unmuted; `isMuted` state is respected
- [ ] **HUD band** — overlay UI stays below `SAFE_ZONE.TOP`
- [ ] **Island mounts** — `'use client'` + `dynamic(..., { ssr: false })`; **PageScreenshot** `/play` is clean
- [ ] **No console errors** — Game runs without uncaught exceptions or WebGL failures
