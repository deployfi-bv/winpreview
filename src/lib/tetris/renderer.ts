import { BOARD_BG, BOARD_COLS, BOARD_ROWS, CELL_SIZE, PIECE_COLORS } from './constants';

import type { Board, Piece } from './types';

export function renderBoard(ctx: CanvasRenderingContext2D, board: Board): void {
  ctx.fillStyle = BOARD_BG;
  ctx.fillRect(0, 0, BOARD_COLS * CELL_SIZE, BOARD_ROWS * CELL_SIZE);
  renderGrid(ctx);

  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const cell = board[row][col];
      if (cell) {
        ctx.fillStyle = cell;
        ctx.fillRect(col * CELL_SIZE + 1, row * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }
  }
}

export function renderPiece(ctx: CanvasRenderingContext2D, piece: Piece): void {
  ctx.fillStyle = PIECE_COLORS[piece.type];
  for (const cell of piece.cells) {
    const x = cell.x + piece.pos.x;
    const y = cell.y + piece.pos.y;
    ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  }
}

export function renderNextPiece(ctx: CanvasRenderingContext2D, piece: Piece): void {
  ctx.clearRect(0, 0, 4 * CELL_SIZE, 4 * CELL_SIZE);

  const xs = piece.cells.map(c => c.x);
  const ys = piece.cells.map(c => c.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const pieceWidth = maxX - minX + 1;
  const pieceHeight = maxY - minY + 1;
  const offsetX = (4 - pieceWidth) / 2 - minX;
  const offsetY = (4 - pieceHeight) / 2 - minY;

  ctx.fillStyle = PIECE_COLORS[piece.type];
  for (const cell of piece.cells) {
    const x = cell.x + offsetX;
    const y = cell.y + offsetY;
    ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  }
}

export function renderGrid(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();

  for (let col = 0; col <= BOARD_COLS; col++) {
    const x = col * CELL_SIZE;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, BOARD_ROWS * CELL_SIZE);
  }

  for (let row = 0; row <= BOARD_ROWS; row++) {
    const y = row * CELL_SIZE;
    ctx.moveTo(0, y);
    ctx.lineTo(BOARD_COLS * CELL_SIZE, y);
  }

  ctx.stroke();
}

export function renderGameOver(ctx: CanvasRenderingContext2D): void {
  const width = BOARD_COLS * CELL_SIZE;
  const height = BOARD_ROWS * CELL_SIZE;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', width / 2, height / 2 - 20);

  ctx.font = '18px sans-serif';
  ctx.fillText('Press SPACE to restart', width / 2, height / 2 + 20);
}
