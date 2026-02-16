import {
  BOARD_COLS,
  BOARD_ROWS,
  PIECE_COLORS,
  PIECE_SHAPES,
  SCORE_DOUBLE,
  SCORE_SINGLE,
  SCORE_TETRIS,
  SCORE_TRIPLE,
  SPEED_BASE,
  SPEED_MIN,
  SPEED_STEP,
} from './constants';

import type { Board, Cell, Piece, PieceType, Position } from './types';

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, () => null as Cell)
  );
}

export function randomPieceType(): PieceType {
  const types: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

export function createPiece(type: PieceType): Piece {
  const rotation = 0;
  const cells = PIECE_SHAPES[type][rotation];
  const pos: Position = {
    x: Math.floor((BOARD_COLS - 4) / 2),
    y: 0,
  };
  return { type, cells, rotation, pos };
}

export function getAbsoluteCells(piece: Piece): Position[] {
  return piece.cells.map((cell) => ({
    x: cell.x + piece.pos.x,
    y: cell.y + piece.pos.y,
  }));
}

export function isValidPosition(board: Board, piece: Piece): boolean {
  const absoluteCells = getAbsoluteCells(piece);
  return absoluteCells.every((cell) => {
    if (cell.x < 0 || cell.x >= BOARD_COLS) return false;
    if (cell.y < 0 || cell.y >= BOARD_ROWS) return false;
    return board[cell.y][cell.x] === null;
  });
}

export function rotatePiece(board: Board, piece: Piece): Piece {
  const nextRotation = (piece.rotation + 1) % 4;
  const nextCells = PIECE_SHAPES[piece.type][nextRotation];
  const rotated: Piece = {
    ...piece,
    rotation: nextRotation,
    cells: nextCells,
  };
  if (isValidPosition(board, rotated)) {
    return rotated;
  }
  return piece;
}

export function movePiece(
  board: Board,
  piece: Piece,
  dx: number,
  dy: number
): Piece {
  const moved: Piece = {
    ...piece,
    pos: { x: piece.pos.x + dx, y: piece.pos.y + dy },
  };
  if (isValidPosition(board, moved)) {
    return moved;
  }
  return piece;
}

export function hardDrop(board: Board, piece: Piece): Piece {
  let current = piece;
  let next = movePiece(board, current, 0, 1);
  while (next !== current) {
    current = next;
    next = movePiece(board, current, 0, 1);
  }
  return current;
}

export function lockPiece(board: Board, piece: Piece): Board {
  const newBoard = board.map((row) => [...row]);
  const color = PIECE_COLORS[piece.type];
  const absoluteCells = getAbsoluteCells(piece);
  for (const cell of absoluteCells) {
    newBoard[cell.y][cell.x] = color;
  }
  return newBoard;
}

export function clearLines(board: Board): { board: Board; linesCleared: number } {
  const fullRowIndices: number[] = [];
  for (let y = 0; y < BOARD_ROWS; y++) {
    if (board[y].every((cell) => cell !== null)) {
      fullRowIndices.push(y);
    }
  }

  if (fullRowIndices.length === 0) {
    return { board, linesCleared: 0 };
  }

  const newBoard: Board = [];
  for (let i = 0; i < fullRowIndices.length; i++) {
    newBoard.push(Array.from({ length: BOARD_COLS }, () => null as Cell));
  }

  for (let y = 0; y < BOARD_ROWS; y++) {
    if (!fullRowIndices.includes(y)) {
      newBoard.push([...board[y]]);
    }
  }

  return { board: newBoard, linesCleared: fullRowIndices.length };
}

export function isGameOver(board: Board, piece: Piece): boolean {
  return !isValidPosition(board, piece);
}

export function getDropSpeed(score: number): number {
  const speed = SPEED_BASE - Math.floor(score / 500) * SPEED_STEP;
  return Math.max(speed, SPEED_MIN);
}

export function getScoreForLines(count: number): number {
  switch (count) {
    case 0:
      return 0;
    case 1:
      return SCORE_SINGLE;
    case 2:
      return SCORE_DOUBLE;
    case 3:
      return SCORE_TRIPLE;
    case 4:
      return SCORE_TETRIS;
    default:
      return 0;
  }
}
