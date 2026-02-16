export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: PieceType;
  cells: Position[];  // relative cell positions for current rotation
  rotation: number;   // 0-3
  pos: Position;      // board position (top-left anchor)
}

export type Cell = string | null;  // color string or empty
export type Board = Cell[][];      // [row][col], 20 rows × 10 cols
