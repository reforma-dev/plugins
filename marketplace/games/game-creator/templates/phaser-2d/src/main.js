import Phaser from 'phaser';
import { GameConfig } from './core/GameConfig.js';

/** Mount into a Next client island. Call `game.destroy(true)` on unmount. */
export function createGame(parent) {
  return new Phaser.Game({ ...GameConfig, parent });
}
