import { describe, expect, it, vi } from 'vitest';

import { BOARD_BG, BOARD_COLS, BOARD_ROWS, CELL_SIZE, PIECE_COLORS } from './constants';
import { renderBoard, renderGameOver, renderGrid, renderNextPiece, renderPiece } from './renderer';

import type { Board, Piece } from './types';

function createMockCtx(): CanvasRenderingContext2D {
  return {
    fillStyle: '', strokeStyle: '', lineWidth: 0, font: '',
    textAlign: '' as CanvasTextAlign, textBaseline: '' as CanvasTextBaseline,
    globalAlpha: 1, fillRect: vi.fn(), strokeRect: vi.fn(), clearRect: vi.fn(),
    fillText: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    stroke: vi.fn(), save: vi.fn(), restore: vi.fn(),
    canvas: { width: BOARD_COLS * CELL_SIZE, height: BOARD_ROWS * CELL_SIZE },
  } as unknown as CanvasRenderingContext2D;
}

const emptyBoard = (): Board => Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
const cellSize = CELL_SIZE - 2;

describe('renderBoard', () => {
  it('fills background with BOARD_BG', () => {
    const ctx = createMockCtx();
    renderBoard(ctx, emptyBoard());
    expect(ctx.fillStyle).toBe(BOARD_BG);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, BOARD_COLS * CELL_SIZE, BOARD_ROWS * CELL_SIZE);
  });

  it('draws non-null cells with correct positions', () => {
    const ctx = createMockCtx();
    const board = emptyBoard();
    board[0][0] = '#FF0000';
    board[1][2] = '#00FF00';
    renderBoard(ctx, board);
    expect(ctx.fillRect).toHaveBeenCalledWith(1, 1, cellSize, cellSize);
    expect(ctx.fillRect).toHaveBeenCalledWith(2 * CELL_SIZE + 1, CELL_SIZE + 1, cellSize, cellSize);
  });

  it('skips null cells', () => {
    const ctx = createMockCtx();
    renderBoard(ctx, emptyBoard());
    expect((ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.filter(c => c[2] === cellSize)).toHaveLength(0);
  });

  it('uses correct colors from board data', () => {
    const ctx = createMockCtx();
    const board = emptyBoard();
    board[0][0] = '#ABCDEF';
    renderBoard(ctx, board);
    expect(ctx.fillStyle).toBe('#ABCDEF');
  });
});

describe('renderPiece', () => {
  it('draws 4 cells for active piece', () => {
    const ctx = createMockCtx();
    const piece: Piece = { type: 'I', cells: [{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:3,y:1}], rotation: 0, pos: {x:3,y:0} };
    renderPiece(ctx, piece);
    expect((ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.filter(c => c[2] === cellSize)).toHaveLength(4);
  });

  it('uses correct piece color', () => {
    const ctx = createMockCtx();
    const piece: Piece = { type: 'T', cells: [{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}], rotation: 0, pos: {x:3,y:0} };
    renderPiece(ctx, piece);
    expect(ctx.fillStyle).toBe(PIECE_COLORS.T);
  });

  it('positions cells at absolute coordinates', () => {
    const ctx = createMockCtx();
    const piece: Piece = { type: 'O', cells: [{x:0,y:0},{x:1,y:0}], rotation: 0, pos: {x:5,y:10} };
    renderPiece(ctx, piece);
    expect(ctx.fillRect).toHaveBeenCalledWith(5 * CELL_SIZE + 1, 10 * CELL_SIZE + 1, cellSize, cellSize);
    expect(ctx.fillRect).toHaveBeenCalledWith(6 * CELL_SIZE + 1, 10 * CELL_SIZE + 1, cellSize, cellSize);
  });
});

describe('renderNextPiece', () => {
  it('clears area and draws 4 cells', () => {
    const ctx = createMockCtx();
    const piece: Piece = { type: 'S', cells: [{x:1,y:0},{x:2,y:0},{x:0,y:1},{x:1,y:1}], rotation: 0, pos: {x:0,y:0} };
    renderNextPiece(ctx, piece);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 4 * CELL_SIZE, 4 * CELL_SIZE);
    expect((ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.filter(c => c[2] === cellSize)).toHaveLength(4);
  });
});

describe('renderGrid', () => {
  it('draws vertical and horizontal lines with correct color', () => {
    const ctx = createMockCtx();
    renderGrid(ctx);
    expect(ctx.strokeStyle).toBe('rgba(255,255,255,0.05)');
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect((ctx.moveTo as ReturnType<typeof vi.fn>).mock.calls.length).toBe(BOARD_COLS + BOARD_ROWS + 2);
  });
});

describe('renderGameOver', () => {
  it('draws overlay and text messages', () => {
    const ctx = createMockCtx();
    renderGameOver(ctx);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, BOARD_COLS * CELL_SIZE, BOARD_ROWS * CELL_SIZE);
    expect(ctx.fillText).toHaveBeenCalledWith('GAME OVER', expect.any(Number), expect.any(Number));
    expect(ctx.fillText).toHaveBeenCalledWith('Press SPACE to restart', expect.any(Number), expect.any(Number));
  });
});
