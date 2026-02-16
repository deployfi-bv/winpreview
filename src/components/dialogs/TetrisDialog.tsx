import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { useAppState } from '@/hooks/useAppState';
import { useTetrisGame } from '@/hooks/useTetrisGame';

import { BOARD_COLS, BOARD_ROWS, CELL_SIZE } from '@/lib/tetris/constants';

export function TetrisDialog() {
  const { isTetrisDialogOpen, closeTetrisDialog } = useAppState();
  const {
    canvasRef,
    nextCanvasRef,
    score,
    highScore,
    gameOver,
    isPlaying,
    startGame,
    resetGame,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    drop,
  } = useTetrisGame();
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying) {
        if (e.code === 'Space') {
          e.preventDefault();
          startGame();
        }
        return;
      }
      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case 'Space':
          e.preventDefault();
          drop();
          break;
      }
    },
    [isPlaying, startGame, moveLeft, moveRight, moveDown, rotate, drop]
  );

  // Effect 1: Reset game state when dialog opens
  useEffect(() => {
    if (isTetrisDialogOpen) {
      resetGame();
    }
  }, [isTetrisDialogOpen, resetGame]);

  // Effect 2: Keyboard listener (separate from reset)
  useEffect(() => {
    if (!isTetrisDialogOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTetrisDialogOpen, handleKeyDown]);

  return (
    <Dialog
      open={isTetrisDialogOpen}
      onOpenChange={(open) => {
        if (!open) closeTetrisDialog();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tetris</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4">
          <canvas
            ref={canvasRef}
            width={BOARD_COLS * CELL_SIZE}
            height={BOARD_ROWS * CELL_SIZE}
            className="rounded border border-border"
          />
          <div className="flex flex-col gap-3 min-w-[120px]">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Next</p>
              <canvas
                ref={nextCanvasRef}
                width={4 * CELL_SIZE}
                height={4 * CELL_SIZE}
                className="rounded border border-border"
              />
            </div>
            <div className="text-sm">
              <p>
                Score: <span className="font-mono font-bold">{score}</span>
              </p>
              <p>
                High: <span className="font-mono font-bold">{highScore}</span>
              </p>
            </div>
            {!isPlaying && (
              <Button onClick={startGame} size="sm">
                {gameOver ? 'Play Again' : 'Start'}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowHelp(!showHelp)}>
              ?
            </Button>
          </div>
        </div>
        {showHelp && (
          <div className="mt-3 rounded border border-border bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-bold text-foreground mb-2">Tetris Rules</p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Move pieces left/right with Arrow Keys</li>
              <li>Rotate with Up Arrow</li>
              <li>Soft drop with Down Arrow</li>
              <li>Hard drop with Space</li>
              <li>Complete a full horizontal row to clear it</li>
              <li>Cleared rows disappear, blocks above shift down</li>
              <li>1 line = 100 pts, 2 = 300, 3 = 500, 4 = 800</li>
              <li>Speed increases as your score grows</li>
              <li>Game ends when pieces reach the top</li>
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
