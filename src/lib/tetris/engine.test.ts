import { describe, expect, it } from 'vitest';

import {
  BOARD_COLS,
  BOARD_ROWS,
  PIECE_COLORS,
} from './constants';
import {
  createEmptyBoard,
  createPiece,
  getAbsoluteCells,
  hardDrop,
  isValidPosition,
  lockPiece,
  movePiece,
  randomPieceType,
  rotatePiece,
} from './engine';

import type { Piece, PieceType } from './types';

describe('createEmptyBoard', () => {
  it('returns 20×10 grid', () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(20);
    expect(board[0].length).toBe(10);
  });

  it('all cells are null', () => {
    const board = createEmptyBoard();
    for (const row of board) {
      for (const cell of row) {
        expect(cell).toBeNull();
      }
    }
  });

  it('different arrays (not shared references)', () => {
    const board = createEmptyBoard();
    board[0][0] = 'red';
    expect(board[1][0]).toBeNull();
    expect(board[0][1]).toBeNull();
  });
});

describe('randomPieceType', () => {
  it('returns one of the 7 piece types', () => {
    const types: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    for (let i = 0; i < 20; i++) {
      const type = randomPieceType();
      expect(types).toContain(type);
    }
  });
});

describe('createPiece', () => {
  it('creates pieces with correct type', () => {
    expect(createPiece('I').type).toBe('I');
    expect(createPiece('O').type).toBe('O');
    expect(createPiece('T').type).toBe('T');
  });
  it('initial position is top-center', () => {
    const piece = createPiece('I');
    expect(piece.pos.x).toBe(Math.floor((BOARD_COLS - 4) / 2));
    expect(piece.pos.y).toBe(0);
  });
  it('rotation starts at 0 and has 4 cells', () => {
    const piece = createPiece('T');
    expect(piece.rotation).toBe(0);
    expect(piece.cells.length).toBe(4);
  });
});

describe('getAbsoluteCells', () => {
  it('offsets cells by piece position', () => {
    const piece1: Piece = { type: 'O', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }], rotation: 0, pos: { x: 0, y: 0 } };
    expect(getAbsoluteCells(piece1)).toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }]);
    const piece2: Piece = { type: 'O', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }], rotation: 0, pos: { x: 5, y: 10 } };
    expect(getAbsoluteCells(piece2)).toEqual([{ x: 5, y: 10 }, { x: 6, y: 10 }]);
  });
});

describe('isValidPosition', () => {
  it('valid piece in empty board returns true', () => {
    expect(isValidPosition(createEmptyBoard(), createPiece('I'))).toBe(true);
  });
  it('out of bounds returns false', () => {
    const board = createEmptyBoard();
    expect(isValidPosition(board, { type: 'I', cells: [{ x: 0, y: 0 }], rotation: 0, pos: { x: -1, y: 0 } })).toBe(false);
    expect(isValidPosition(board, { type: 'I', cells: [{ x: 0, y: 0 }], rotation: 0, pos: { x: BOARD_COLS, y: 0 } })).toBe(false);
    expect(isValidPosition(board, { type: 'I', cells: [{ x: 0, y: 0 }], rotation: 0, pos: { x: 0, y: BOARD_ROWS } })).toBe(false);
  });
  it('overlapping filled cell returns false', () => {
    const board = createEmptyBoard();
    board[5][5] = 'red';
    expect(isValidPosition(board, { type: 'I', cells: [{ x: 0, y: 0 }], rotation: 0, pos: { x: 5, y: 5 } })).toBe(false);
  });
});

describe('rotatePiece', () => {
  it('T-piece rotates from state 0 to 1', () => {
    const board = createEmptyBoard();
    const piece = createPiece('T');
    expect(piece.rotation).toBe(0);
    const rotated = rotatePiece(board, piece);
    expect(rotated.rotation).toBe(1);
  });

  it('T-piece rotates through 4 states', () => {
    const board = createEmptyBoard();
    let piece = createPiece('T');
    piece = rotatePiece(board, piece);
    expect(piece.rotation).toBe(1);
    piece = rotatePiece(board, piece);
    expect(piece.rotation).toBe(2);
    piece = rotatePiece(board, piece);
    expect(piece.rotation).toBe(3);
    piece = rotatePiece(board, piece);
    expect(piece.rotation).toBe(0);
  });

  it('O-piece rotation stays same', () => {
    const board = createEmptyBoard();
    const piece = createPiece('O');
    const rotated = rotatePiece(board, piece);
    expect(rotated.cells).toEqual(piece.cells);
  });

  it('blocked rotation returns original', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS; x++) {
      board[1][x] = 'red';
    }
    const piece: Piece = {
      type: 'I',
      cells: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
      ],
      rotation: 0,
      pos: { x: 3, y: 0 },
    };
    const rotated = rotatePiece(board, piece);
    expect(rotated).toBe(piece);
  });
});

describe('movePiece', () => {
  it('valid move returns moved piece', () => {
    const board = createEmptyBoard();
    const piece = createPiece('I');
    expect(movePiece(board, piece, -1, 0).pos.x).toBe(piece.pos.x - 1);
    expect(movePiece(board, piece, 1, 0).pos.x).toBe(piece.pos.x + 1);
    expect(movePiece(board, piece, 0, 1).pos.y).toBe(piece.pos.y + 1);
  });
  it('blocked move returns unchanged', () => {
    const board = createEmptyBoard();
    const wallPiece: Piece = { type: 'I', cells: [{ x: 0, y: 0 }], rotation: 0, pos: { x: 0, y: 5 } };
    expect(movePiece(board, wallPiece, -1, 0)).toBe(wallPiece);
    board[5][5] = 'red';
    const blockedPiece: Piece = { type: 'I', cells: [{ x: 0, y: 0 }], rotation: 0, pos: { x: 5, y: 4 } };
    expect(movePiece(board, blockedPiece, 0, 1)).toBe(blockedPiece);
  });
});

describe('hardDrop', () => {
  it('drops piece to bottom or stops above obstacle', () => {
    const piece: Piece = { type: 'O', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], rotation: 0, pos: { x: 4, y: 0 } };
    expect(hardDrop(createEmptyBoard(), piece).pos.y).toBe(BOARD_ROWS - 2);
    const board = createEmptyBoard();
    board[10][4] = 'red';
    board[10][5] = 'red';
    expect(hardDrop(board, piece).pos.y).toBe(8);
  });
});

describe('lockPiece', () => {
  it('colors board cells and does not mutate original', () => {
    const board = createEmptyBoard();
    const piece1: Piece = { type: 'I', cells: [{ x: 0, y: 0 }], rotation: 0, pos: { x: 5, y: 10 } };
    expect(lockPiece(board, piece1)[10][5]).toBe(PIECE_COLORS.I);
    const piece2: Piece = { type: 'O', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], rotation: 0, pos: { x: 4, y: 10 } };
    const locked = lockPiece(board, piece2);
    expect(locked[10][4]).toBe(PIECE_COLORS.O);
    expect(locked[10][5]).toBe(PIECE_COLORS.O);
    expect(locked[11][4]).toBe(PIECE_COLORS.O);
    expect(locked[11][5]).toBe(PIECE_COLORS.O);
    expect(board[10][4]).toBeNull();
  });
});
