/**
 * Keyboard input handler.
 * Maps key events to game engine actions.
 */

import {
  moveLeft,
  moveRight,
  softDrop,
  hardDrop,
  rotateCW,
  rotateCCW,
  pauseGame,
  resumeGame,
  restartGame,
  type GameEngine,
} from '../engine/engine';

export type InputAction =
  | 'left'
  | 'right'
  | 'softDrop'
  | 'hardDrop'
  | 'rotateCW'
  | 'rotateCCW'
  | 'pause'
  | 'restart';

const KEY_MAP: Record<string, InputAction | null> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowDown: 'softDrop',
  Space: 'hardDrop',
  ArrowUp: 'rotateCW',
  KeyX: 'rotateCW',
  KeyZ: 'rotateCCW',
  KeyP: 'pause',
  KeyR: 'restart',
};

export interface InputHandler {
  dispose(): void;
}

/**
 * Create a keyboard input handler.
 * Soft-hold: holding left/right/softDrop repeats after a delay.
 */
export function createInputHandler(engine: GameEngine): InputHandler {
  const repeatDelay = 100;   // ms before repeat starts
  const repeatInterval = 50; // ms between repeats

  let activeKey: string | null = null;
  let repeatTimer: ReturnType<typeof setInterval> | null = null;

  function doAction(action: InputAction): void {
    switch (action) {
      case 'left':
        moveLeft(engine);
        break;
      case 'right':
        moveRight(engine);
        break;
      case 'softDrop':
        softDrop(engine);
        break;
      case 'hardDrop':
        hardDrop(engine);
        break;
      case 'rotateCW':
        rotateCW(engine);
        break;
      case 'rotateCCW':
        rotateCCW(engine);
        break;
      case 'pause':
        if (engine.state.status === 'playing') {
          pauseGame(engine);
        } else if (engine.state.status === 'paused') {
          resumeGame(engine);
        }
        break;
      case 'restart':
        restartGame(engine);
        break;
    }
  }

  function startRepeat(action: InputAction): void {
    if (repeatTimer) clearInterval(repeatTimer);
    repeatTimer = setInterval(() => {
      doAction(action);
    }, repeatInterval);
  }

  function stopRepeat(): void {
    if (repeatTimer) {
      clearInterval(repeatTimer);
      repeatTimer = null;
    }
  }

  function handleKeyDown(e: KeyboardEvent): void {
    const action = KEY_MAP[e.code];
    if (!action) return;

    e.preventDefault();

    if (action === 'restart' || action === 'pause') {
      doAction(action);
      return;
    }

    activeKey = e.code;
    doAction(action);
    startRepeat(action);
  }

  function handleKeyUp(e: KeyboardEvent): void {
    const action = KEY_MAP[e.code];
    if (!action) return;

    if (e.code === activeKey) {
      activeKey = null;
      stopRepeat();
    }
  }

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  return {
    dispose(): void {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (repeatTimer) clearInterval(repeatTimer);
    },
  };
}
