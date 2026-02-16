import { describe, expect, it } from 'vitest';

import {
  BOARD_COLS,
  BOARD_ROWS,
  SCORE_DOUBLE,
  SCORE_SINGLE,
  SCORE_TETRIS,
  SCORE_TRIPLE,
} from './constants';
import {
  clearLines,
  createEmptyBoard,
  createPiece,
  getDropSpeed,
  getScoreForLines,
  isGameOver,
} from './engine';

describe('clearLines', () => {
  it('empty board returns no change, 0 lines', () => {
    const board = createEmptyBoard();
    const result = clearLines(board);
    expect(result.linesCleared).toBe(0);
    expect(result.board).toBe(board);
  });

  it('no full rows returns no change, 0 lines', () => {
    const board = createEmptyBoard();
    board[19][0] = 'red';
    board[19][1] = 'red';
    const result = clearLines(board);
    expect(result.linesCleared).toBe(0);
    expect(result.board).toBe(board);
  });

  it('one full row at bottom is removed, empty row added at top, 1 line', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS; x++) {
      board[19][x] = 'red';
    }
    const result = clearLines(board);
    expect(result.linesCleared).toBe(1);
    expect(result.board.length).toBe(BOARD_ROWS);
    expect(result.board[0].every((cell) => cell === null)).toBe(true);
    expect(result.board[19].every((cell) => cell === null)).toBe(true);
  });

  it('one full row in middle is removed, rows above shift down, rows below unchanged', () => {
    const board = createEmptyBoard();
    board[5][0] = 'blue';
    for (let x = 0; x < BOARD_COLS; x++) {
      board[10][x] = 'red';
    }
    board[15][0] = 'green';
    const result = clearLines(board);
    expect(result.linesCleared).toBe(1);
    expect(result.board[6][0]).toBe('blue');
    expect(result.board[15][0]).toBe('green');
  });

  it('two adjacent full rows are both removed, 2 lines', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS; x++) {
      board[18][x] = 'red';
      board[19][x] = 'blue';
    }
    const result = clearLines(board);
    expect(result.linesCleared).toBe(2);
    expect(result.board.length).toBe(BOARD_ROWS);
    expect(result.board[0].every((cell) => cell === null)).toBe(true);
    expect(result.board[1].every((cell) => cell === null)).toBe(true);
  });

  it('two non-adjacent full rows are both removed, 2 lines', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS; x++) {
      board[10][x] = 'red';
      board[15][x] = 'blue';
    }
    const result = clearLines(board);
    expect(result.linesCleared).toBe(2);
    expect(result.board.length).toBe(BOARD_ROWS);
  });

  it('three full rows are all removed, 3 lines', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS; x++) {
      board[17][x] = 'red';
      board[18][x] = 'blue';
      board[19][x] = 'green';
    }
    const result = clearLines(board);
    expect(result.linesCleared).toBe(3);
    expect(result.board.length).toBe(BOARD_ROWS);
  });

  it('four full rows (Tetris) are all removed, 4 lines', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS; x++) {
      board[16][x] = 'red';
      board[17][x] = 'blue';
      board[18][x] = 'green';
      board[19][x] = 'yellow';
    }
    const result = clearLines(board);
    expect(result.linesCleared).toBe(4);
    expect(result.board.length).toBe(BOARD_ROWS);
  });

  it('partial row is NOT removed', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS - 1; x++) {
      board[19][x] = 'red';
    }
    const result = clearLines(board);
    expect(result.linesCleared).toBe(0);
  });

  it('board with mixed full and partial rows: only full removed', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS - 1; x++) {
      board[18][x] = 'blue';
    }
    for (let x = 0; x < BOARD_COLS; x++) {
      board[19][x] = 'red';
    }
    const result = clearLines(board);
    expect(result.linesCleared).toBe(1);
    expect(result.board[19][0]).toBe('blue');
    expect(result.board[19][9]).toBeNull();
  });

  it('after clear: board still 20 rows × 10 cols', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS; x++) {
      board[19][x] = 'red';
    }
    const result = clearLines(board);
    expect(result.board.length).toBe(BOARD_ROWS);
    expect(result.board[0].length).toBe(BOARD_COLS);
  });

  it('does NOT mutate original board', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS; x++) {
      board[19][x] = 'red';
    }
    clearLines(board);
    expect(board[19][0]).toBe('red');
  });
});

describe('isGameOver', () => {
  it('new piece fits returns false', () => {
    const board = createEmptyBoard();
    const piece = createPiece('I');
    expect(isGameOver(board, piece)).toBe(false);
  });

  it('new piece blocked returns true', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_COLS; x++) {
      board[0][x] = 'red';
      board[1][x] = 'red';
    }
    const piece = createPiece('I');
    expect(isGameOver(board, piece)).toBe(true);
  });
});

describe('getDropSpeed', () => {
  it('score 0 returns 800', () => {
    expect(getDropSpeed(0)).toBe(800);
  });

  it('score 499 returns 800', () => {
    expect(getDropSpeed(499)).toBe(800);
  });

  it('score 500 returns 750', () => {
    expect(getDropSpeed(500)).toBe(750);
  });

  it('score 2500 returns 550', () => {
    expect(getDropSpeed(2500)).toBe(550);
  });

  it('score 100000 returns 200 (capped at min)', () => {
    expect(getDropSpeed(100000)).toBe(200);
  });
});

describe('getScoreForLines', () => {
  it('0 lines returns 0', () => {
    expect(getScoreForLines(0)).toBe(0);
  });

  it('1 line returns 100', () => {
    expect(getScoreForLines(1)).toBe(SCORE_SINGLE);
  });

  it('2 lines returns 300', () => {
    expect(getScoreForLines(2)).toBe(SCORE_DOUBLE);
  });

  it('3 lines returns 500', () => {
    expect(getScoreForLines(3)).toBe(SCORE_TRIPLE);
  });

  it('4 lines returns 800', () => {
    expect(getScoreForLines(4)).toBe(SCORE_TETRIS);
  });
});
