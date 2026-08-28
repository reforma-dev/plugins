import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GAME, CAMERA, COLORS } from './Constants.js';
import { eventBus, Events } from './EventBus.js';
import { gameState } from './GameState.js';
import { InputSystem } from '../systems/InputSystem.js';
import { Player } from '../gameplay/Player.js';
import { LevelBuilder } from '../level/LevelBuilder.js';
import { Menu } from '../ui/Menu.js';

export class Game {
  constructor(parent) {
    this.parent = parent;
    this.clock = new THREE.Clock();

    const { clientWidth: w, clientHeight: h } = parent;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, GAME.MAX_DPR));
    this.renderer.setClearColor(COLORS.SKY);
    this.renderer.shadowMap.enabled = true;
    parent.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(GAME.FOV, w / Math.max(h, 1), GAME.NEAR, GAME.FAR);
    this.camera.position.set(0, CAMERA.HEIGHT, CAMERA.DISTANCE);

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enablePan = false;
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.1;
    this.orbitControls.minDistance = CAMERA.MIN_DISTANCE;
    this.orbitControls.maxDistance = CAMERA.MAX_DISTANCE;
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.orbitControls.target.set(0, 1, 0);
    this.orbitControls.update();

    this.input = new InputSystem();
    this.level = new LevelBuilder(this.scene);
    this.menu = new Menu(parent);
    this.player = null;

    eventBus.on(Events.GAME_RESTART, () => this.restart());

    this._onResize = () => this.onResize();
    window.addEventListener('resize', this._onResize);

    this.startGame();
    this.renderer.setAnimationLoop(() => this.animate());
  }

  startGame() {
    gameState.reset();
    gameState.started = true;
    this.player = new Player(this.scene);
    this.input.setGameActive(true);
  }

  restart() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    this.startGame();
  }

  animate() {
    const delta = Math.min(this.clock.getDelta(), GAME.MAX_DELTA);

    this.input.update();

    if (gameState.started && !gameState.gameOver && this.player) {
      const azimuth = this.orbitControls.getAzimuthalAngle();
      const oldX = this.player.mesh.position.x;
      const oldZ = this.player.mesh.position.z;

      this.player.update(delta, this.input, azimuth);

      const dx = this.player.mesh.position.x - oldX;
      const dz = this.player.mesh.position.z - oldZ;
      this.orbitControls.target.x += dx;
      this.orbitControls.target.z += dz;
      this.orbitControls.target.y = this.player.mesh.position.y + 1;
      this.camera.position.x += dx;
      this.camera.position.z += dz;
    }

    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    const w = this.parent.clientWidth;
    const h = Math.max(this.parent.clientHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  destroy() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this._onResize);
    this.orbitControls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
