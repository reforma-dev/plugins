import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

/** DOM overlay idea — in Next this can be React on top of the canvas. */
export class Menu {
  constructor(parent) {
    this.overlay = document.createElement('div');
    this.overlay.hidden = true;
    this.overlay.style.cssText =
      'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.75);color:#fff;z-index:2';
    this.overlay.innerHTML =
      '<h1>GAME OVER</h1><p data-score></p><p data-best></p><button type="button">Restart</button>';
    parent.style.position ||= 'relative';
    parent.appendChild(this.overlay);

    this.overlay.querySelector('button').addEventListener('click', () => {
      this.overlay.hidden = true;
      eventBus.emit(Events.GAME_RESTART);
    });

    eventBus.on(Events.GAME_OVER, ({ score }) => this.showGameOver(score));
  }

  showGameOver(score) {
    this.overlay.querySelector('[data-score]').textContent = `Score: ${score}`;
    this.overlay.querySelector('[data-best]').textContent = `Best: ${gameState.bestScore}`;
    this.overlay.hidden = false;
  }
}
