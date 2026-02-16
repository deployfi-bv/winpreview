// SVG overlay with cutout rectangle for mask tool

interface MaskOverlayProps {
  rect: { x: number; y: number; width: number; height: number };
  pageWidth: number;
  pageHeight: number;
}

export function MaskOverlay({ rect, pageWidth, pageHeight }: MaskOverlayProps) {
  const { x, y, width, height } = rect;

  return (
    <g className="mask-overlay">
      {/* Dim everything outside the mask rect */}
      <path
        d={`M 0 0 H ${pageWidth} V ${pageHeight} H 0 Z
            M ${x} ${y} V ${y + height} H ${x + width} V ${y} Z`}
        fill="black"
        fillOpacity={0.6}
        fillRule="evenodd"
        style={{ pointerEvents: 'none' }}
      />
      {/* Mask border */}
      <rect
        x={x} y={y} width={width} height={height}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={1.5}
        strokeDasharray="6 3"
        style={{ pointerEvents: 'none' }}
      />
    </g>
  );
}
