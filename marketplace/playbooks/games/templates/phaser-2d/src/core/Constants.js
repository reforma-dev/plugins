// Design units. Phaser Scale.FIT sizes the canvas to the mount node.
export const GAME = {
  WIDTH: 960,
  HEIGHT: 540,
  GRAVITY: 800,
};

export const SAFE_ZONE = {
  TOP: GAME.HEIGHT * 0.08,
  BOTTOM: 0,
  LEFT: 0,
  RIGHT: 0,
};

const SPRITE_ASPECT = 1.5;

export const PLAYER = {
  START_X: GAME.WIDTH * 0.25,
  START_Y: GAME.HEIGHT * 0.65,
  WIDTH: GAME.WIDTH * 0.08,
  HEIGHT: GAME.WIDTH * 0.08 * SPRITE_ASPECT,
  SPEED: 200,
  JUMP_VELOCITY: -400,
  COLOR: 0x44aaff,
};

export const COLORS = {
  SKY: 0x87ceeb,
  GROUND: 0x4a7c2e,
  PLAYER: 0x44aaff,
  UI_TEXT: '#ffffff',
  MUTED_TEXT: '#8888aa',
  SCORE_GOLD: '#ffd700',
  BG_TOP: 0x0f0c29,
  BG_BOTTOM: 0x302b63,
  BTN_PRIMARY: 0x6c63ff,
  BTN_PRIMARY_HOVER: 0x857dff,
  BTN_PRIMARY_PRESS: 0x5a52d5,
  BTN_TEXT: '#ffffff',
};

export const UI = {
  FONT: 'system-ui, sans-serif',
  TITLE_RATIO: 0.08,
  HEADING_RATIO: 0.05,
  BODY_RATIO: 0.035,
  SMALL_RATIO: 0.025,
  BTN_W_RATIO: 0.45,
  BTN_H_RATIO: 0.075,
  BTN_RADIUS: 12,
  MIN_TOUCH: 44,
};

export const TOUCH = {
  BUTTON_SIZE: GAME.WIDTH * 0.12,
  ALPHA_IDLE: 0.35,
  ALPHA_ACTIVE: 0.6,
  MARGIN_X: GAME.WIDTH * 0.08,
  MARGIN_BOTTOM: GAME.HEIGHT * 0.06,
  ARROW_COLOR: 0xffffff,
};

export const TRANSITION = {
  FADE_DURATION: 350,
};
