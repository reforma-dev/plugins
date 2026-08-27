import Phaser from 'phaser';
import { GAME, COLORS } from './Constants.js';
import { BootScene } from '../scenes/BootScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { GameOverScene } from '../scenes/GameOverScene.js';

/** Pass `parent` (HTMLElement) from createGame — never a second index.html. */
export const GameConfig = {
  type: Phaser.AUTO,
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  backgroundColor: COLORS.SKY,
  roundPixels: true,
  antialias: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME.GRAVITY },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, GameOverScene],
};
