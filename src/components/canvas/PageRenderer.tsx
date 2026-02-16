import { useEffect, useRef } from 'react';

import { useAnnotationInteraction } from '@/hooks/useAnnotationInteraction';
import { useAppState } from '@/hooks/useAppState';

import { buildCssFilter } from '@/lib/colorAdjustment';

import { AnnotationLayer } from './annotations/AnnotationLayer';
import { CropOverlay } from './CropOverlay';
import { FormFieldOverlay } from './FormFieldOverlay';
import { LinkOverlay } from './LinkOverlay';
import { LoupeOverlay } from './LoupeOverlay';
import { MaskOverlay } from './MaskOverlay';
import { TextLayer } from './TextLayer';
import { usePageMouseHandlers } from './usePageMouseHandlers';

import type { PageData } from '@/types/page';

import { getImageUrl, renderImageToCanvas } from '@/services/imageService';
import { getDoc, renderPage } from '@/services/pdfService';

interface PageRendererProps {
  page: PageData;
  zoom: number;
}

export function PageRenderer({ page, zoom }: PageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const {
    activeTool, maskRect, setMaskRect,
    loupePosition, loupeMagnification, setLoupePosition,
    colorAdjustment, isCropMode, cropRect, setCropRect,
  } = useAppState();

  const {
    drawingAnnotation, cursor,
    handleMouseDown: annMouseDown, handleMouseMove: annMouseMove, handleMouseUp: annMouseUp,
    handleAnnotationMouseDown, handleHandleMouseDown,
  } = useAnnotationInteraction(svgRef, page.id);

  const { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } =
    usePageMouseHandlers({
      svgRef, activeTool, isCropMode,
      setMaskRect, setCropRect, setLoupePosition,
      annMouseDown, annMouseMove, annMouseUp,
    });

  const pageWidth = page.width;
  const pageHeight = page.height;

  // Render content to canvas when page/zoom changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (page.sourceFormat === 'pdf' && getDoc(page.sourceId)) {
      const renderKey = `page-${page.id}`;
      renderPage(page.originalIndex + 1, canvas, zoom, renderKey, page.sourceId);
    } else if (page.sourceFormat === 'image') {
      const imageUrl = getImageUrl(page.sourceId);
      if (imageUrl) {
        renderImageToCanvas(imageUrl, canvas, pageWidth, pageHeight, zoom);
      } else {
        // Clear canvas for blank pages (e.g., File > New)
        canvas.width = pageWidth * zoom;
        canvas.height = pageHeight * zoom;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [page.id, page.originalIndex, page.sourceId, page.sourceFormat, zoom, pageWidth, pageHeight]);

  // Determine if page is rotated sideways
  const isSideways = page.rotation === 90 || page.rotation === 270;
  const displayWidth = (isSideways ? pageHeight : pageWidth) * zoom;
  const displayHeight = (isSideways ? pageWidth : pageHeight) * zoom;
  const nativeWidth = pageWidth * zoom;
  const nativeHeight = pageHeight * zoom;
  const filter = buildCssFilter(colorAdjustment);

  // Build transform for rotation and flip (applied to inner wrapper)
  const transforms: string[] = [];
  if (page.rotation !== 0) transforms.push(`rotate(${page.rotation}deg)`);
  if (page.flipH) transforms.push('scaleX(-1)');
  if (page.flipV) transforms.push('scaleY(-1)');
  const transformStyle = transforms.length > 0 ? transforms.join(' ') : undefined;

  return (
    <div
      role="img"
      aria-label={`Document page`}
      className="relative shrink-0 rounded-sm bg-white shadow-xl overflow-hidden"
      style={{ width: displayWidth, height: displayHeight }}
    >
      {/* Inner wrapper: native (unrotated) dimensions, centered, with rotation transform */}
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
        {/* PDF content canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ filter: filter !== 'none' ? filter : undefined }}
        />

        {/* SVG annotation overlay — same dimensions, captures all mouse events */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${pageWidth} ${pageHeight}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ cursor: isCropMode ? 'crosshair' : cursor }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Annotation layer */}
          <AnnotationLayer
            pageId={page.id}
            drawingAnnotation={drawingAnnotation}
            onAnnotationMouseDown={handleAnnotationMouseDown}
            onHandleMouseDown={handleHandleMouseDown}
          />

          {/* Mask overlay */}
          {maskRect && maskRect.width > 2 && maskRect.height > 2 && (
            <MaskOverlay rect={maskRect} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}

          {/* Crop overlay */}
          {isCropMode && cropRect && cropRect.width > 2 && cropRect.height > 2 && (
            <CropOverlay rect={cropRect} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}

          {/* Loupe overlay */}
          {activeTool === 'loupe' && loupePosition && (
            <LoupeOverlay position={loupePosition} magnification={loupeMagnification} />
          )}
        </svg>

        {/* Form field overlay (HTML positioned on top of SVG) */}
        <FormFieldOverlay pageId={page.id} zoom={zoom} />

        {/* Link overlay (clickable PDF links) */}
        <LinkOverlay pageId={page.id} zoom={zoom} />

        {/* Text layer (HTML positioned on top of SVG) */}
        <TextLayer
          page={page}
          zoom={zoom}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
        />
      </div>
    </div>
  );
}
