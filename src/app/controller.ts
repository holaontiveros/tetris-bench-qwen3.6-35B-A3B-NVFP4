/**
 * Game controller - wires together the engine, input, renderer, and timing loop.
 *
 * This is the main application component that runs in the browser.
 */

import { createGame, lockPiece, gravityStep, type GameEngine } from '../engine/engine';
import { createInputHandler } from '../input/keyboard';
import { createRenderer } from '../rendering/renderer';

export interface GameController {
  dispose(): void;
}

/**
 * Create a game controller that runs the game loop.
 */
export function createController(canvas: HTMLCanvasElement, seed?: number): GameController {
  const engine = createGame(seed);
  const renderer = createRenderer({ canvas });
  const input = createInputHandler(engine);

  let lastDropTime = 0;
  let animFrameId: number | null = null;

  function getFallInterval(): number {
    const level = engine.state.level;
    return Math.max(100, 800 - (level - 1) * 60);
  }

  function gameLoop(timestamp: number): void {
    if (engine.state.status !== 'playing') {
      // Still render but don't update
      renderer.render(engine.state);
      animFrameId = requestAnimationFrame(gameLoop);
      return;
    }

    const fallInterval = getFallInterval();

    if (timestamp - lastDropTime >= fallInterval) {
      // Attempt one gravity step
      const moved = gravityStep(engine);
      if (!moved) {
        // Piece is stuck - lock it
        lockPiece(engine);
      }
      lastDropTime = timestamp;
    }

    renderer.render(engine.state);
    animFrameId = requestAnimationFrame(gameLoop);
  }

  // Start the game loop
  animFrameId = requestAnimationFrame(gameLoop);

  return {
    dispose(): void {
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      input.dispose();
      renderer.dispose();
    },
  };
}
