interface CropOverlayProps {
  rect: { x: number; y: number; width: number; height: number };
  pageWidth: number;
  pageHeight: number;
}

export function CropOverlay({ rect, pageWidth, pageHeight }: CropOverlayProps) {
  return (
    <g className="crop-overlay">
      {/* Dim area outside crop */}
      <path
        d={`M0,0 H${pageWidth} V${pageHeight} H0 Z M${rect.x},${rect.y} v${rect.height} h${rect.width} v${-rect.height} Z`}
        fill="rgba(0,0,0,0.5)"
        fillRule="evenodd"
      />
      {/* Crop border */}
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
        strokeDasharray="6 3"
      />
      {/* Corner handles */}
      {[
        { cx: rect.x, cy: rect.y },
        { cx: rect.x + rect.width, cy: rect.y },
        { cx: rect.x, cy: rect.y + rect.height },
        { cx: rect.x + rect.width, cy: rect.y + rect.height },
      ].map((pos, i) => (
        <circle
          key={i}
          cx={pos.cx}
          cy={pos.cy}
          r={5}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1.5}
        />
      ))}
    </g>
  );
}
