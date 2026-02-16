import type { PieceType, Position } from './types';

export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;
export const CELL_SIZE = 28;
export const BOARD_BG = '#1a1a2e';

export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#00F5FF', // cyan
  O: '#FFE500', // yellow
  T: '#BF00FF', // purple
  S: '#00FF66', // green
  Z: '#FF3355', // red
  J: '#3377FF', // blue
  L: '#FF8800', // orange
};

// Scoring
export const SCORE_SINGLE = 100;
export const SCORE_DOUBLE = 300;
export const SCORE_TRIPLE = 500;
export const SCORE_TETRIS = 800;

// Speed
export const SPEED_BASE = 800;  // ms
export const SPEED_MIN = 200;   // ms
export const SPEED_STEP = 50;   // ms decrease per 500 points

// Piece shapes: 4 rotation states per piece, each state = array of 4 Position offsets
export const PIECE_SHAPES: Record<PieceType, Position[][]> = {
  I: [
    [{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:3,y:1}],  // horizontal
    [{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3}],  // vertical
    [{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2}],  // horizontal (180)
    [{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:1,y:3}],  // vertical (270)
  ],
  O: [
    [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}],
    [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}],
    [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}],
    [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}],
  ],
  T: [
    [{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}],
    [{x:1,y:0},{x:1,y:1},{x:2,y:1},{x:1,y:2}],
    [{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:1,y:2}],
    [{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:1,y:2}],
  ],
  S: [
    [{x:1,y:0},{x:2,y:0},{x:0,y:1},{x:1,y:1}],
    [{x:1,y:0},{x:1,y:1},{x:2,y:1},{x:2,y:2}],
    [{x:1,y:1},{x:2,y:1},{x:0,y:2},{x:1,y:2}],
    [{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:1,y:2}],
  ],
  Z: [
    [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:2,y:1}],
    [{x:2,y:0},{x:1,y:1},{x:2,y:1},{x:1,y:2}],
    [{x:0,y:1},{x:1,y:1},{x:1,y:2},{x:2,y:2}],
    [{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:0,y:2}],
  ],
  J: [
    [{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}],
    [{x:1,y:0},{x:2,y:0},{x:1,y:1},{x:1,y:2}],
    [{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:2,y:2}],
    [{x:1,y:0},{x:1,y:1},{x:0,y:2},{x:1,y:2}],
  ],
  L: [
    [{x:2,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}],
    [{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:2,y:2}],
    [{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:0,y:2}],
    [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:1,y:2}],
  ],
};
