/**
 * Canvas renderer for the Falling Fusion game.
 *
 * Converts GameState to visible output on an HTML Canvas element.
 * This module is browser-specific and depends on Canvas APIs.
 */

import type { GameState, ActivePiece, BlobColor, Position } from '../engine/types';
import { BOARD_HEIGHT, BOARD_WIDTH, VISIBLE_ROWS, SPAWN_ROWS } from '../engine/types';

// Color mapping for blob colors
const BLOB_COLORS: Record<BlobColor, string> = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#2ecc71',
  yellow: '#f1c40f',
};

// Cell size in pixels
const DEFAULT_CELL_SIZE = 24;
const SIDEBAR_WIDTH = 160;

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  cellSize?: number;
}

export interface Renderer {
  render(state: GameState): void;
  dispose(): void;
}

function getCellSize(opts: RendererOptions): number {
  return opts.cellSize || DEFAULT_CELL_SIZE;
}

/**
 * Create a canvas renderer.
 */
export function createRenderer(opts: RendererOptions): Renderer {
  const canvas = opts.canvas;
  const CELL = getCellSize(opts);
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Failed to get canvas 2d context');

  const boardPixelWidth = BOARD_WIDTH * CELL;
  const boardPixelHeight = VISIBLE_ROWS * CELL;

  canvas.width = boardPixelWidth + SIDEBAR_WIDTH;
  canvas.height = boardPixelHeight;

  function drawCell(x: number, y: number, cell: { type: string; color?: string }): void {
    const px = x * CELL;
    const py = y * CELL;

    if (cell.type === 'empty') return;

    if (cell.type === 'solid') {
      ctx!.fillStyle = '#555';
      ctx!.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
      ctx!.fillStyle = '#777';
      ctx!.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
    } else if (cell.type === 'blob' && cell.color) {
      const color = BLOB_COLORS[cell.color as BlobColor] || '#999';
      ctx!.fillStyle = color;
      ctx!.beginPath();
      ctx!.arc(px + CELL / 2, py + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = 'rgba(255,255,255,0.3)';
      ctx!.beginPath();
      ctx!.arc(px + CELL / 2 - 2, py + CELL / 2 - 2, 3, 0, Math.PI * 2);
      ctx!.fill();
    }
  }

  function getPieceCells(piece: ActivePiece): Position[] {
    if (piece.type === 'tetromino') {
      return piece.cells.map(c => ({ x: piece.pivot.x + c.x, y: piece.pivot.y + c.y }));
    }
    // Blob pair
    return piece.blobs.map(b => ({ x: piece.pivot.x + b.offset.x, y: piece.pivot.y + b.offset.y }));
  }

  return {
    render(state: GameState): void {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx!.fillStyle = '#111';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      // Board border
      ctx!.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx!.strokeRect(0, 0, boardPixelWidth, canvas.height);

      // Draw board cells (visible rows only)
      for (let y = 0; y < VISIBLE_ROWS; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          drawCell(x, y, state.board[y + SPAWN_ROWS][x]);
        }
      }

      // Draw ghost piece
      if (state.activePiece) {
        let ghostY = 0;
        const pivotX = state.activePiece!.pivot.x;
        let pivotY = state.activePiece!.pivot.y;

        while (true) {
          let canDrop = true;
          const cells = getPieceCells(state.activePiece!);
          for (const cell of cells) {
            const boardY = pivotY + ghostY + 1 - SPAWN_ROWS;
            if (boardY + 1 >= BOARD_HEIGHT || cell.x < 0 || cell.x >= BOARD_WIDTH) {
              canDrop = false;
              break;
            }
            if (boardY + 1 >= 0 && boardY + 1 < BOARD_HEIGHT) {
              const cellBelow = state.board[boardY + 1][cell.x];
              if (cellBelow.type !== 'empty') {
                canDrop = false;
                break;
              }
            }
          }
          if (!canDrop) break;
          ghostY++;
          if (pivotY + ghostY >= BOARD_HEIGHT - 1) break;
        }

        if (ghostY > 0) {
          ctx!.globalAlpha = 0.2;
          const cells = getPieceCells(state.activePiece!);
          for (const cell of cells) {
            const px = (cell.x) * CELL;
            const py = (pivotY + ghostY - SPAWN_ROWS + (cell.y - (state.activePiece!.type === 'tetromino' ? 0 : 0))) * CELL;
            // Simplified ghost rendering
            const relativeCells = state.activePiece!.type === 'tetromino'
              ? state.activePiece.cells
              : state.activePiece!.blobs.map(b => b.offset);
            for (const rc of relativeCells) {
              const gpx = (pivotX + rc.x) * CELL;
              const gpy = (pivotY + ghostY + rc.y - SPAWN_ROWS) * CELL;
              ctx!.fillStyle = '#fff';
              ctx!.fillRect(gpx + 1, gpy + 1, CELL - 2, CELL - 2);
            }
          }
          ctx!.globalAlpha = 1;
        }

        // Draw active piece
        const cells = getPieceCells(state.activePiece!);
        for (const cell of cells) {
          const px = cell.x * CELL;
          const py = (cell.y - SPAWN_ROWS) * CELL;
          if (state.activePiece!.type === 'tetromino') {
            ctx!.fillStyle = '#888';
            ctx!.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
            ctx!.fillStyle = '#aaa';
            ctx!.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
          } else {
            const blobCell = state.activePiece!.type === 'blob'
              ? state.activePiece!.blobs.find(b => b.offset.x === (cell.x - state.activePiece!.pivot.x) && b.offset.y === (cell.y - state.activePiece!.pivot.y))
              : null;
            if (blobCell) {
              const color = BLOB_COLORS[blobCell.color] || '#999';
              ctx!.fillStyle = color;
              ctx!.beginPath();
              ctx!.arc(px + CELL / 2, py + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
              ctx!.fill();
            }
          }
        }
      }

      // Sidebar: Next pieces
      const sidebarX = boardPixelWidth + 20;
      ctx!.fillStyle = '#aaa';
      ctx!.font = '16px sans-serif';
      ctx!.fillText('NEXT', sidebarX, 30);

      for (let i = 0; i < Math.min(state.nextQueue.length, 3); i++) {
        const piece = state.nextQueue[i];
        const startY = 55 + i * 65;

        if (piece.type === 'tetromino') {
          ctx!.fillStyle = '#fff';
          ctx!.font = '12px monospace';
          ctx!.fillText(piece.shape, sidebarX, startY);
        } else {
          ctx!.fillStyle = '#fff';
          ctx!.font = '12px sans-serif';
          ctx!.fillText('Blob', sidebarX, startY);
        }
      }

      // Score
      ctx!.fillStyle = '#aaa';
      ctx!.font = '16px sans-serif';
      ctx!.fillText('SCORE', sidebarX, 250);
      ctx!.fillStyle = '#fff';
      ctx!.font = '20px sans-serif';
      ctx!.fillText(state.score.toString(), sidebarX, 272);

      // Level
      ctx!.fillStyle = '#aaa';
      ctx!.font = '16px sans-serif';
      ctx!.fillText('LEVEL', sidebarX, 310);
      ctx!.fillStyle = '#fff';
      ctx!.font = '20px sans-serif';
      ctx!.fillText(state.level.toString(), sidebarX, 332);

      // Status
      if (state.status === 'paused') {
        ctx!.fillStyle = '#f1c40f';
        ctx!.font = '18px sans-serif';
        ctx!.fillText('PAUSED', sidebarX, 410);
      } else if (state.status === 'gameover') {
        ctx!.fillStyle = '#e74c3c';
        ctx!.font = '18px sans-serif';
        ctx!.fillText('GAME OVER', sidebarX, 410);
      }

      // Controls help
      ctx!.fillStyle = '#444';
      ctx!.font = '10px sans-serif';
      ctx!.fillText('Arrows: Move/Rotate | Space: Hard Drop | P: Pause | R: Restart', 10, canvas.height - 10);
    },

    dispose(): void {
      // Nothing to clean up
    },
  };
}
