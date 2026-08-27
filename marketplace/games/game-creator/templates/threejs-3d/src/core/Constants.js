export const GAME = {
  FOV: 60,
  NEAR: 0.1,
  FAR: 1000,
  MAX_DELTA: 0.05,
  MAX_DPR: 2,
};

export const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : '',
) || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);

export const SAFE_ZONE = {
  TOP_PX: 75,
  BOTTOM_PX: 0,
  TOP_PERCENT: 8,
};

export const PLAYER = {
  SIZE: 1,
  SPEED: 5,
  TURN_SPEED: 10,
  START_X: 0,
  START_Y: 0,
  START_Z: 0,
  COLOR: 0x44aaff,
};

export const LEVEL = {
  GROUND_SIZE: 50,
  GROUND_COLOR: 0x4a7c2e,
  FOG_COLOR: 0x87ceeb,
  FOG_NEAR: 20,
  FOG_FAR: 80,
};

export const CAMERA = {
  HEIGHT: 3,
  DISTANCE: 6,
  MIN_DISTANCE: 3,
  MAX_DISTANCE: 15,
};

export const COLORS = {
  SKY: 0x87ceeb,
  AMBIENT_LIGHT: 0xffffff,
  AMBIENT_INTENSITY: 0.6,
  DIR_LIGHT: 0xffffff,
  DIR_INTENSITY: 0.8,
  PLAYER: 0x44aaff,
};

// Drop GLB into the Next `public/` folder. URL is site-root.
export const CHARACTER = {
  path: '/assets/models/Soldier.glb',
  scale: 1,
  offsetY: 0,
  facingOffset: Math.PI,
  clipMap: { idle: 'Idle', walk: 'Walk', run: 'Run' },
};

export const ASSET_PATHS = {};
export const MODEL_CONFIG = {};
