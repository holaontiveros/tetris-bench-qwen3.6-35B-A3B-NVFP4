/**
 * Core types for the Falling Fusion game engine.
 *
 * These types are browser-independent and can be used in tests without DOM.
 */

// ── Board dimensions ────────────────────────────────────────────────
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 22; // 2 hidden spawn rows + 20 visible rows
export const VISIBLE_ROWS = 20;
export const SPAWN_ROWS = 2;

// ── Cell types ──────────────────────────────────────────────────────
export type CellType = 'empty' | 'solid' | 'blob';
export type BlobColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Cell {
  type: CellType;
  color?: BlobColor; // only used when type === 'blob'
}

// ── Coordinate ──────────────────────────────────────────────────────
export interface Position {
  x: number; // column (0..BOARD_WIDTH-1)
  y: number; // row (0..BOARD_HEIGHT-1)
}

// ── Game status ─────────────────────────────────────────────────────
export type GameStatus = 'playing' | 'paused' | 'gameover';

// ── Piece config ────────────────────────────────────────────────────
export interface PieceConfig {
  cells: Position[]; // relative positions from pivot (0, 0)
  pivot: Position;   // where the pivot is placed on the board
}

// ── Tetromino piece ─────────────────────────────────────────────────
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface TetrominoPiece {
  type: 'tetromino';
  shape: TetrominoType;
  cells: Position[]; // relative to pivot
  pivot: Position;
  rotation: number;  // 0, 1, 2, 3 (× 90°)
}

// ── Blob pair piece ─────────────────────────────────────────────────
export interface BlobPairPiece {
  type: 'blob';
  blobs: BlobCell[]; // exactly 2 blobs with positions relative to pivot
  pivot: Position;
  rotation: number;
}

export interface BlobCell {
  offset: Position; // relative to pivot
  color: BlobColor;
}

// ── Active piece (union type) ───────────────────────────────────────
export type ActivePiece = TetrominoPiece | BlobPairPiece;

// ── Board ───────────────────────────────────────────────────────────
export type Board = Cell[][];

// ── Game state ──────────────────────────────────────────────────────
export interface GameState {
  board: Board;
  activePiece: ActivePiece | null;
  nextQueue: (TetrominoPiece | BlobPairPiece)[];
  score: number;
  level: number;
  piecesLocked: number;
  status: GameStatus;
  chainCount: number;
  softDropScored: number; // cells manually soft-dropped this lock event
  hardDropped: boolean;     // whether current piece was hard-dropped
  hardDropCells: number;    // cells traveled via hard drop
}

// ── Scoring constants ───────────────────────────────────────────────
export const LINE_SCORES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export const BLOB_SCORE_MULTIPLIER = 10;

// ── Difficulty config ───────────────────────────────────────────────
export const LEVEL_INTERVAL = 10; // pieces per level
export const BASE_FALL_INTERVAL = 800; // ms at level 1
export const FALL_INTERVAL_MIN = 100; // ms minimum
export const FALL_INTERVAL_STEP = 60; // ms reduced per level

// ── Resolution result ───────────────────────────────────────────────
export interface ResolutionResult {
  linesCleared: number;
  blobsCleared: number;
  chainCount: number;
  scoreGained: number;
}

// ── RNG interface ───────────────────────────────────────────────────
export interface Rng {
  (): number;
}
