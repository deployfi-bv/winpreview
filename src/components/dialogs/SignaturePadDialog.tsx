import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter,
DialogHeader, DialogTitle, } from '@/components/ui/dialog';

import { useAppState } from '@/hooks/useAppState';

const PAD_WIDTH = 400;
const PAD_HEIGHT = 200;

export function SignaturePadDialog() {
  const { isSignaturePadOpen, closeSignaturePadDialog } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return ctx;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = getContext();
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasContent(true);
  }, [getContext]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = getContext();
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }, [isDrawing, getContext]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, PAD_WIDTH, PAD_HEIGHT);
    setHasContent(false);
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSavedSignature(dataUrl);
    toast.success('Signature saved');
  }, [hasContent]);

  const handleDone = useCallback(() => {
    toast.success('Signature placed on document');
    closeSignaturePadDialog();
  }, [closeSignaturePadDialog]);

  const handleUseSaved = useCallback(() => {
    if (!savedSignature) return;
    toast.success('Saved signature placed on document');
    closeSignaturePadDialog();
  }, [savedSignature, closeSignaturePadDialog]);

  return (
    <Dialog open={isSignaturePadOpen} onOpenChange={(open) => !open && closeSignaturePadDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Signature</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          <canvas
            ref={canvasRef}
            width={PAD_WIDTH}
            height={PAD_HEIGHT}
            className="rounded border bg-white"
            style={{ cursor: 'crosshair' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <p className="text-xs text-muted-foreground">Draw your signature above</p>
        </div>
        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>Clear</Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={!hasContent}>
              Save
            </Button>
            {savedSignature && (
              <Button variant="outline" size="sm" onClick={handleUseSaved}>
                Use Saved
              </Button>
            )}
          </div>
          <Button size="sm" onClick={handleDone} disabled={!hasContent && !savedSignature}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
