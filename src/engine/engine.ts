import type {
  Board,
  GameState,
  ActivePiece,
  ResolutionResult,
  BlobColor,
  Cell,
  Position,
} from './types';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  VISIBLE_ROWS,
  SPAWN_ROWS,
  LINE_SCORES,
  BLOB_SCORE_MULTIPLIER,
  BASE_FALL_INTERVAL,
  FALL_INTERVAL_MIN,
  FALL_INTERVAL_STEP,
  LEVEL_INTERVAL,
} from './types';
import {
  createEmptyBoard,
  isValidPosition,
  getFullRows,
  removeRow,
  getPieceCells,
  wouldCollide,
  placeCells,
} from './board';
import { rotateTetromino } from './pieces/tetromino';
import { rotateBlobPair } from './pieces/blobPair';
import { createRng, type Rng, rngInt } from './random/prng';
import { PieceQueue } from './random/sequence';

// ── Board helpers for resolution ────────────────────────────────────

/** Get connected blob groups using BFS (orthogonal connectivity). */
function getBlobGroups(board: Board): { color: BlobColor; cells: Position[] }[] {
  const visited = new Set<string>();
  const groups: { color: BlobColor; cells: Position[] }[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = board[y][x];
      if (cell.type === 'blob' && !visited.has(`${x},${y}`)) {
        // BFS to find connected group of same color
        const color = cell.color!;
        const cells: Position[] = [];
        const queue: Position[] = [{ x, y }];
        visited.add(`${x},${y}`);

        while (queue.length > 0) {
          const current = queue.shift()!;
          cells.push(current);

          for (const neighbor of getOrthogonalNeighbors(current)) {
            const key = `${neighbor.x},${neighbor.y}`;
            if (
              !visited.has(key) &&
              isValidPosition(board, neighbor) &&
              board[neighbor.y][neighbor.x].type === 'blob' &&
              board[neighbor.y][neighbor.x].color === color
            ) {
              visited.add(key);
              queue.push(neighbor);
            }
          }
        }

        groups.push({ color, cells });
      }
    }
  }

  return groups;
}

function getOrthogonalNeighbors(pos: Position): Position[] {
  return [
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x - 1, y: pos.y },
    { x: pos.x + 1, y: pos.y },
  ];
}

/** Clear blob cells from the board. */
function clearBlobCells(board: Board, cells: Position[]): void {
  for (const { x, y } of cells) {
    board[y][x] = { type: 'empty' };
  }
}

/**
 * Apply gravity: unsupported cells fall down until they hit the bottom
 * or another occupied cell.
 */
function applyGravity(board: Board): void {
  // Process each column independently, bottom-up
  for (let x = 0; x < BOARD_WIDTH; x++) {
    let writeRow = BOARD_HEIGHT - 1;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (board[y][x].type !== 'empty') {
        if (writeRow !== y) {
          board[writeRow][x] = board[y][x];
          board[y][x] = { type: 'empty' };
        }
        writeRow--;
      }
    }
  }
}

// ── Scoring ─────────────────────────────────────────────────────────

export function calculateLineScore(lines: number): number {
  if (lines > 4) {
    return 200 * lines;
  }
  return LINE_SCORES[lines] ?? 200 * lines;
}

export function calculateBlobScore(blobs: number, chain: number): number {
  return BLOB_SCORE_MULTIPLIER * blobs * chain;
}

export function calculateFallInterval(level: number): number {
  return Math.max(FALL_INTERVAL_MIN, BASE_FALL_INTERVAL - (level - 1) * FALL_INTERVAL_STEP);
}

// ── Game creation ───────────────────────────────────────────────────

export function createGame(seed?: number): GameEngine {
  const rng = createRng(seed ?? Date.now());
  const pieceQueue = new PieceQueue(rng);

  const state: GameState = {
    board: createEmptyBoard(),
    activePiece: null,
    nextQueue: pieceQueue.getPreview(3),
    score: 0,
    level: 1,
    piecesLocked: 0,
    status: 'playing',
    chainCount: 0,
    softDropScored: 0,
    hardDropped: false,
    hardDropCells: 0,
  };

  // Spawn the first piece
  const firstPiece = pieceQueue.next();
  state.activePiece = firstPiece;

  return { state, pieceQueue, rng };
}

// ── Movement ────────────────────────────────────────────────────────

export function moveLeft(engine: GameEngine): boolean {
  if (engine.state.status !== 'playing' || !engine.state.activePiece) return false;

  const cells = getPieceCells(engine.state.activePiece, getPieceBoardX(engine.state), getPieceBoardY(engine.state));
  const moved = cells.map(c => ({ x: c.x - 1, y: c.y }));

  if (!wouldCollide(engine.state.board, moved)) {
    setPiecePosition(engine, engine.state.activePiece, getPieceBoardX(engine.state) - 1, getPieceBoardY(engine.state));
    return true;
  }
  return false;
}

export function moveRight(engine: GameEngine): boolean {
  if (engine.state.status !== 'playing' || !engine.state.activePiece) return false;

  const cells = getPieceCells(engine.state.activePiece, getPieceBoardX(engine.state), getPieceBoardY(engine.state));
  const moved = cells.map(c => ({ x: c.x + 1, y: c.y }));

  if (!wouldCollide(engine.state.board, moved)) {
    setPiecePosition(engine, engine.state.activePiece, getPieceBoardX(engine.state) + 1, getPieceBoardY(engine.state));
    return true;
  }
  return false;
}

export function softDrop(engine: GameEngine): boolean {
  if (engine.state.status !== 'playing' || !engine.state.activePiece) return false;

  const cells = getPieceCells(engine.state.activePiece, getPieceBoardX(engine.state), getPieceBoardY(engine.state));
  const moved = cells.map(c => ({ x: c.x, y: c.y + 1 }));

  if (!wouldCollide(engine.state.board, moved)) {
    setPiecePosition(engine, engine.state.activePiece, getPieceBoardX(engine.state), getPieceBoardY(engine.state) + 1);
    engine.state.softDropScored++;
    return true;
  }
  return false;
}

/**
 * Attempt a gravity step (move active piece down 1 cell, no score).
 * Returns true if the piece moved, false if it couldn't move down.
 */
export function gravityStep(engine: GameEngine): boolean {
  if (engine.state.status !== 'playing' || !engine.state.activePiece) return false;

  const cells = getPieceCells(engine.state.activePiece, getPieceBoardX(engine.state), getPieceBoardY(engine.state));
  const moved = cells.map(c => ({ x: c.x, y: c.y + 1 }));

  if (!wouldCollide(engine.state.board, moved)) {
    setPiecePosition(engine, engine.state.activePiece, getPieceBoardX(engine.state), getPieceBoardY(engine.state) + 1);
    return true;
  }
  return false;
}

export function hardDrop(engine: GameEngine): number {
  if (engine.state.status !== 'playing' || !engine.state.activePiece) return 0;

  let dropDistance = 0;
  while (true) {
    const cells = getPieceCells(engine.state.activePiece, getPieceBoardX(engine.state), getPieceBoardY(engine.state));
    const moved = cells.map(c => ({ x: c.x, y: c.y + 1 }));

    if (wouldCollide(engine.state.board, moved)) break;

    setPiecePosition(engine, engine.state.activePiece, getPieceBoardX(engine.state), getPieceBoardY(engine.state) + 1);
    dropDistance++;
  }

  engine.state.hardDropped = true;
  engine.state.hardDropCells = dropDistance;
  return dropDistance;
}

export function rotateCW(engine: GameEngine): boolean {
  if (engine.state.status !== 'playing' || !engine.state.activePiece) return false;

  return attemptRotate(engine, engine.state.activePiece, 1);
}

export function rotateCCW(engine: GameEngine): boolean {
  if (engine.state.status !== 'playing' || !engine.state.activePiece) return false;

  return attemptRotate(engine, engine.state.activePiece, -1);
}

function attemptRotate(
  engine: GameEngine,
  piece: ActivePiece,
  direction: 1 | -1
): boolean {
  const boardX = getPieceBoardX(engine.state);
  const boardY = getPieceBoardY(engine.state);

  let newPiece: ActivePiece;
  if (piece.type === 'tetromino') {
    newPiece = rotateTetromino(piece, direction);
  } else {
    newPiece = rotateBlobPair(piece, direction);
  }

  const newCells = getPieceCells(newPiece, boardX, boardY);

  // Try: no offset, then wall kicks
  const kicks = [
    { dx: 0, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -2, dy: 0 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
  ];

  for (const kick of kicks) {
    const testCells = newCells.map(c => ({ x: c.x + kick.dx, y: c.y + kick.dy }));
    if (!wouldCollide(engine.state.board, testCells)) {
      setPiecePosition(
        engine,
        newPiece,
        boardX + kick.dx,
        boardY + kick.dy
      );
      engine.state.activePiece = newPiece;
      return true;
    }
  }

  return false;
}

// ── Locking and resolution ──────────────────────────────────────────

export function lockPiece(engine: GameEngine): ResolutionResult {
  if (!engine.state.activePiece) {
    return { linesCleared: 0, blobsCleared: 0, chainCount: 0, scoreGained: 0 };
  }

  // Place the piece on the board
  const boardX = getPieceBoardX(engine.state);
  const boardY = getPieceBoardY(engine.state);
  const cells = getPieceCells(engine.state.activePiece, boardX, boardY);

  const placedCells: (Position & { cell: Cell })[] = [];

  if (engine.state.activePiece.type === 'tetromino') {
    for (const cell of cells) {
      placedCells.push({ ...cell, cell: { type: 'solid' } });
    }
  } else {
    for (const blob of engine.state.activePiece.blobs) {
      const pos = {
        x: boardX + blob.offset.x,
        y: boardY + blob.offset.y,
      };
      placedCells.push({ ...pos, cell: { type: 'blob', color: blob.color } });
    }
  }

  placeCells(engine.state.board, placedCells);

  // Reset drop scoring for next piece
  const dropScore = calculateDropScore(engine.state);

  // Board resolution
  const result = resolveBoard(engine);

  // Add drop score + resolution score
  engine.state.score += dropScore + result.scoreGained;

  // Update piece count and level
  engine.state.piecesLocked++;
  const newLevel = Math.floor(engine.state.piecesLocked / LEVEL_INTERVAL) + 1;
  if (newLevel > engine.state.level) {
    engine.state.level = newLevel;
  }

  // Spawn next piece
  engine.state.activePiece = engine.pieceQueue.next();
  engine.state.nextQueue = engine.pieceQueue.getPreview(3);

  // Check game over
  if (wouldCollide(engine.state.board, getPieceCells(engine.state.activePiece, getPieceBoardX(engine.state), getPieceBoardY(engine.state)))) {
    engine.state.status = 'gameover';
  }

  return result;
}

function calculateDropScore(state: GameState): number {
  let score = 0;
  if (state.hardDropped) {
    score += 2 * state.hardDropCells;
  } else {
    score += state.softDropScored;
  }
  return score;
}

export function resolveBoard(engine: GameEngine): ResolutionResult {
  let { board } = engine.state;
  let totalLinesCleared = 0;
  let totalBlobsCleared = 0;
  let totalScore = 0;

  // Phase 1: Row detection and clearing
  let fullRows = getFullRows(board);
  while (fullRows.length > 0) {
    for (const row of fullRows) {
      removeRow(board, row);
    }
    totalLinesCleared += fullRows.length;
    fullRows = getFullRows(board);
  }

  // Phase 2 + 3: Blob group detection and gravity
  engine.state.chainCount = 1;
  let chainActive = true;

  while (chainActive) {
    const groups = getBlobGroups(board);
    const qualifying = groups.filter(g => g.cells.length >= 4);

    if (qualifying.length === 0) {
      chainActive = false;
      break;
    }

    // Clear all qualifying groups simultaneously
    let blobsInThisChain = 0;
    for (const group of qualifying) {
      clearBlobCells(board, group.cells);
      blobsInThisChain += group.cells.length;
    }
    totalBlobsCleared += blobsInThisChain;

    // Apply gravity
    applyGravity(board);

    // Calculate chain score
    totalScore += calculateBlobScore(blobsInThisChain, engine.state.chainCount);

    engine.state.chainCount++;
  }

  // Apply gravity one more time to settle everything after row clears
  applyGravity(board);

  // Calculate line score
  totalScore += calculateLineScore(totalLinesCleared);

  return {
    linesCleared: totalLinesCleared,
    blobsCleared: totalBlobsCleared,
    chainCount: engine.state.chainCount,
    scoreGained: totalScore,
  };
}

// ── Game state management ───────────────────────────────────────────

export function pauseGame(engine: GameEngine): boolean {
  if (engine.state.status !== 'playing') return false;
  engine.state.status = 'paused';
  return true;
}

export function resumeGame(engine: GameEngine): boolean {
  if (engine.state.status !== 'paused') return false;
  engine.state.status = 'playing';
  return true;
}

export function restartGame(engine: GameEngine, seed?: number): void {
  const newRng = createRng(seed ?? Date.now());
  const newQueue = new PieceQueue(newRng);

  engine.rng = newRng;
  engine.pieceQueue = newQueue;

  engine.state.board = createEmptyBoard();
  engine.state.activePiece = newQueue.next();
  engine.state.nextQueue = newQueue.getPreview(3);
  engine.state.score = 0;
  engine.state.level = 1;
  engine.state.piecesLocked = 0;
  engine.state.status = 'playing';
  engine.state.chainCount = 1;
  engine.state.softDropScored = 0;
  engine.state.hardDropped = false;
  engine.state.hardDropCells = 0;
}

// ── Helpers ─────────────────────────────────────────────────────────

function getPieceBoardX(state: GameState): number {
  if (!state.activePiece) return 0;
  return state.activePiece.pivot.x;
}

function getPieceBoardY(state: GameState): number {
  if (!state.activePiece) return 0;
  return state.activePiece.pivot.y;
}

function setPiecePosition(
  engine: GameEngine,
  piece: ActivePiece,
  x: number,
  y: number
): void {
  if (piece.type === 'tetromino') {
    piece.pivot = { x, y };
  } else {
    piece.pivot = { x, y };
  }
  engine.state.activePiece = piece;
}

// ── Public API ──────────────────────────────────────────────────────

export interface GameEngine {
  state: GameState;
  pieceQueue: PieceQueue;
  rng: Rng;
}
