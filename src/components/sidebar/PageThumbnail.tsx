import { useEffect, useRef, useState } from 'react';

import { useAppState } from '@/hooks/useAppState';

import { renderThumbnailAnnotation } from './ThumbnailAnnotationRenderer';

import type { PageData } from '@/types/page';

import { getImageUrl, renderImageToCanvas } from '@/services/imageService';
import { getDoc, renderThumbnail } from '@/services/pdfService';

interface PageThumbnailProps {
  page: PageData;
  pageIndex: number;
  pageCount: number;
  isSelected?: boolean;
}

const THUMB_MAX_WIDTH = 120;

export function PageThumbnail({ page, pageIndex, pageCount, isSelected = false }: PageThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const retryCountRef = useRef(0);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const { annotations } = useAppState();

  // IntersectionObserver — one-shot lazy load
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Render canvas once visible
  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (page.sourceFormat === 'pdf') {
      const doc = getDoc(page.sourceId);
      if (doc) {
        const renderKey = `thumb-${page.id}`;
        renderThumbnail(page.originalIndex + 1, canvas, THUMB_MAX_WIDTH, renderKey, page.sourceId);
        retryCountRef.current = 0; // Reset retry count on successful render
      } else {
        // PDF not loaded yet — schedule retry
        if (retryCountRef.current < 5) {
          retryCountRef.current++;
          setTimeout(() => {
            setRetryTrigger((prev) => prev + 1);
          }, 500);
        }
      }
    } else if (page.sourceFormat === 'image') {
      const imageUrl = getImageUrl(page.sourceId);
      if (imageUrl) {
        const scale = THUMB_MAX_WIDTH / page.width;
        renderImageToCanvas(imageUrl, canvas, page.width, page.height, scale);
      }
    }
  }, [isVisible, page.id, page.originalIndex, page.sourceId, page.sourceFormat, page.width, page.height, retryTrigger]);

  // Compute aspect ratio for container sizing
  const ratio = page.height / page.width;
  const isSideways = page.rotation === 90 || page.rotation === 270;
  const displayWidth = isSideways ? THUMB_MAX_WIDTH * ratio : THUMB_MAX_WIDTH;
  const displayHeight = isSideways ? THUMB_MAX_WIDTH : THUMB_MAX_WIDTH * ratio;
  const nativeWidth = THUMB_MAX_WIDTH;
  const nativeHeight = THUMB_MAX_WIDTH * ratio;

  // Build transforms for rotation and flip (applied to inner wrapper)
  const transforms: string[] = [];
  if (page.rotation !== 0) transforms.push(`rotate(${page.rotation}deg)`);
  if (page.flipH) transforms.push('scaleX(-1)');
  if (page.flipV) transforms.push('scaleY(-1)');
  const transformStyle = transforms.length > 0 ? transforms.join(' ') : undefined;

  const displayNumber = pageIndex + 1;
  const pageAnnotations = annotations[page.id] ?? [];
  const sortedAnnotations = [...pageAnnotations].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-1"
      role="option"
      aria-selected={isSelected}
      aria-label={`Page ${displayNumber} of ${pageCount}`}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-sm bg-white shadow-md"
        style={{ width: displayWidth, height: displayHeight }}
      >
        {isVisible ? (
          <div
            className="absolute"
            style={{
              width: nativeWidth,
              height: nativeHeight,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%)${transformStyle ? ` ${transformStyle}` : ''}`,
            }}
          >
            {/* Base canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full"
            />

            {/* SVG annotation overlay */}
            <svg
              viewBox={`0 0 ${page.width} ${page.height}`}
              className="absolute inset-0 h-full w-full pointer-events-none"
              preserveAspectRatio="xMidYMid meet"
            >
              {sortedAnnotations.map(renderThumbnailAnnotation)}
            </svg>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">{displayNumber}</span>
          </div>
        )}
        {/* Page number badge — top-left corner */}
        <span className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[10px] leading-none text-white">
          {displayNumber}
        </span>
      </div>
    </div>
  );
}
