import { createController } from './app/controller';

function init(): void {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Parse seed from URL if present
  const params = new URLSearchParams(window.location.search);
  const seedStr = params.get('seed');
  const seed = seedStr ? parseInt(seedStr, 10) : undefined;

  createController(canvas, seed);
}

document.addEventListener('DOMContentLoaded', init);
