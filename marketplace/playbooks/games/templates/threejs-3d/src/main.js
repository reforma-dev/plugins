import { Game } from './core/Game.js';

/** Mount into a Next client island. Call `game.destroy()` on unmount. */
export function createGame(parent) {
  return new Game(parent);
}
