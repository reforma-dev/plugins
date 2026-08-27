// =============================================================================
// InputSystem.js — Keyboard state tracker for third-person controller
//
// WASD / Arrow keys for movement. Provides both boolean (forward/left/etc)
// and analog (moveX/moveZ) accessors for backward compatibility.
// =============================================================================

export class InputSystem {
  constructor() {
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code.startsWith('Arrow')) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
  }

  isDown(code) { return !!this.keys[code]; }
  setGameActive() {}
  update() {}

  get forward() { return this.isDown('KeyW') || this.isDown('ArrowUp'); }
  get backward() { return this.isDown('KeyS') || this.isDown('ArrowDown'); }
  get left() { return this.isDown('KeyA') || this.isDown('ArrowLeft'); }
  get right() { return this.isDown('KeyD') || this.isDown('ArrowRight'); }
  get shift() { return this.isDown('ShiftLeft') || this.isDown('ShiftRight'); }
  get jump() { return this.isDown('Space'); }

  get moveX() { return (this.right ? 1 : 0) - (this.left ? 1 : 0); }
  get moveZ() { return (this.backward ? 1 : 0) - (this.forward ? 1 : 0); }
}
