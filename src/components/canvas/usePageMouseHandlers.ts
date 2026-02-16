/**
 * Mouse event handlers for PageRenderer — mask, crop, loupe, and annotation delegation.
 */

import { useCallback, useRef } from 'react';

import { screenToPage } from '@/lib/coordinates';

import type { Tool } from '@/types/app';

interface PageMouseOptions {
  svgRef: React.RefObject<SVGSVGElement | null>;
  activeTool: Tool;
  isCropMode: boolean;
  setMaskRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;
  setCropRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;
  setLoupePosition: (pos: { x: number; y: number } | null) => void;
  annMouseDown: (e: React.MouseEvent) => void;
  annMouseMove: (e: React.MouseEvent) => void;
  annMouseUp: () => void;
}

export function usePageMouseHandlers(opts: PageMouseOptions) {
  const {
    svgRef, activeTool, isCropMode,
    setMaskRect, setCropRect, setLoupePosition,
    annMouseDown, annMouseMove, annMouseUp,
  } = opts;

  const maskStartRef = useRef<{ x: number; y: number } | null>(null);
  const cropStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'mask' && svgRef.current) {
      const coords = screenToPage(e.clientX, e.clientY, svgRef.current);
      maskStartRef.current = coords;
      setMaskRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
      return;
    }
    if (isCropMode && svgRef.current) {
      const coords = screenToPage(e.clientX, e.clientY, svgRef.current);
      cropStartRef.current = coords;
      setCropRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
      return;
    }
    annMouseDown(e);
  }, [activeTool, isCropMode, annMouseDown, setMaskRect, setCropRect, svgRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'loupe' && svgRef.current) {
      const coords = screenToPage(e.clientX, e.clientY, svgRef.current);
      setLoupePosition(coords);
    }
    if (activeTool === 'mask' && maskStartRef.current && svgRef.current) {
      const coords = screenToPage(e.clientX, e.clientY, svgRef.current);
      const start = maskStartRef.current;
      setMaskRect({
        x: Math.min(start.x, coords.x),
        y: Math.min(start.y, coords.y),
        width: Math.abs(coords.x - start.x),
        height: Math.abs(coords.y - start.y),
      });
      return;
    }
    if (isCropMode && cropStartRef.current && svgRef.current) {
      const coords = screenToPage(e.clientX, e.clientY, svgRef.current);
      const start = cropStartRef.current;
      setCropRect({
        x: Math.min(start.x, coords.x),
        y: Math.min(start.y, coords.y),
        width: Math.abs(coords.x - start.x),
        height: Math.abs(coords.y - start.y),
      });
      return;
    }
    annMouseMove(e);
  }, [activeTool, isCropMode, annMouseMove, setLoupePosition, setMaskRect, setCropRect, svgRef]);

  const handleMouseUp = useCallback(() => {
    maskStartRef.current = null;
    cropStartRef.current = null;
    annMouseUp();
  }, [annMouseUp]);

  const handleMouseLeave = useCallback(() => {
    if (activeTool === 'loupe') {
      setLoupePosition(null);
    }
    maskStartRef.current = null;
    cropStartRef.current = null;
    annMouseUp();
  }, [activeTool, setLoupePosition, annMouseUp]);

  return { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave };
}
