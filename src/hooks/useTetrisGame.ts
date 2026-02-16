import { useCallback, useEffect, useRef, useState } from 'react';

import { type AudioManager,createAudioManager } from '@/lib/tetris/audio';
import {
  clearLines,
  createEmptyBoard,
  createPiece,
  getDropSpeed,
  getScoreForLines,
  hardDrop,
  isGameOver,
  lockPiece,
  movePiece,
  randomPieceType,
  rotatePiece,
} from '@/lib/tetris/engine';
import { renderBoard, renderGameOver, renderNextPiece, renderPiece } from '@/lib/tetris/renderer';

import type { Board, Piece } from '@/lib/tetris/types';

import { getHighScore, saveHighScore } from '@/services/tetrisHighScoreStore';

export function useTetrisGame() {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [piece, setPiece] = useState<Piece>(() => createPiece(randomPieceType()));
  const [nextPiece, setNextPiece] = useState<Piece>(() => createPiece(randomPieceType()));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioManager | null>(null);
  const speed = getDropSpeed(score);
  useEffect(() => { getHighScore().then(setHighScore); audioRef.current = createAudioManager(); return () => audioRef.current?.dispose(); }, []);
  useEffect(() => { const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return; renderBoard(ctx, board); renderPiece(ctx, piece); if (gameOver) renderGameOver(ctx); }, [board, piece, gameOver]);
  useEffect(() => { const ctx = nextCanvasRef.current?.getContext('2d'); if (!ctx) return; renderNextPiece(ctx, nextPiece); }, [nextPiece]);
  function lockAndAdvance() {
    const locked = lockPiece(board, piece);
    const { board: cleared, linesCleared } = clearLines(locked);
    if (linesCleared > 0) {
      audioRef.current?.playLineClear();
      const earned = getScoreForLines(linesCleared);
      const newScore = score + earned;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        saveHighScore(newScore);
      }
    }
    setBoard(cleared);
    const incoming = nextPiece;
    if (isGameOver(cleared, incoming)) {
      setGameOver(true);
      setIsPlaying(false);
      audioRef.current?.playGameOver();
      if (score > highScore) saveHighScore(score);
      return;
    }
    setPiece(incoming);
    setNextPiece(createPiece(randomPieceType()));
  }
  function gameLoop() {
    if (gameOver || !isPlaying) return;
    const moved = movePiece(board, piece, 0, 1);
    if (moved === piece) {
      lockAndAdvance();
    } else {
      setPiece(moved);
    }
  }
  const gameLoopRef = useRef(gameLoop);
  useEffect(() => { gameLoopRef.current = gameLoop; });
  useEffect(() => { if (gameOver || !isPlaying) return; const id = setInterval(() => gameLoopRef.current(), speed); return () => clearInterval(id); }, [speed, gameOver, isPlaying]);
  const tryMove = useCallback((dx: number, dy: number) => { if (gameOver || !isPlaying) return; const moved = movePiece(board, piece, dx, dy); if (moved !== piece) { setPiece(moved); audioRef.current?.playMove(); } }, [board, piece, gameOver, isPlaying]);
  const moveLeft = useCallback(() => tryMove(-1, 0), [tryMove]);
  const moveRight = useCallback(() => tryMove(1, 0), [tryMove]);
  const moveDown = useCallback(() => tryMove(0, 1), [tryMove]);
  const rotate = useCallback(() => { if (gameOver || !isPlaying) return; const rotated = rotatePiece(board, piece); if (rotated !== piece) { setPiece(rotated); audioRef.current?.playRotate(); } }, [board, piece, gameOver, isPlaying]);
  const drop = useCallback(() => {
    if (gameOver || !isPlaying) return;
    const dropped = hardDrop(board, piece);
    audioRef.current?.playDrop();
    setPiece(dropped);
    const locked = lockPiece(board, dropped);
    const { board: cleared, linesCleared } = clearLines(locked);
    if (linesCleared > 0) {
      audioRef.current?.playLineClear();
      const earned = getScoreForLines(linesCleared);
      const newScore = score + earned;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        saveHighScore(newScore);
      }
    }
    setBoard(cleared);
    const incoming = nextPiece;
    if (isGameOver(cleared, incoming)) {
      setGameOver(true);
      setIsPlaying(false);
      audioRef.current?.playGameOver();
      if (score > highScore) saveHighScore(score);
      return;
    }
    setPiece(incoming);
    setNextPiece(createPiece(randomPieceType()));
  }, [board, piece, nextPiece, score, highScore, gameOver, isPlaying]);
  const startGame = useCallback(() => { setBoard(createEmptyBoard()); setPiece(createPiece(randomPieceType())); setNextPiece(createPiece(randomPieceType())); setScore(0); setGameOver(false); setIsPlaying(true); }, []);
  const resetGame = useCallback(() => { setBoard(createEmptyBoard()); setPiece(createPiece(randomPieceType())); setNextPiece(createPiece(randomPieceType())); setScore(0); setGameOver(false); setIsPlaying(false); }, []);
  return { canvasRef, nextCanvasRef, score, highScore, gameOver, isPlaying, startGame, resetGame, moveLeft, moveRight, moveDown, rotate, drop };
}
