// Circular magnification overlay following cursor position

interface LoupeOverlayProps {
  position: { x: number; y: number };
  magnification: number;
  size?: number;
}

export function LoupeOverlay({ position, magnification, size = 120 }: LoupeOverlayProps) {
  const radius = size / 2;
  const clipId = `loupe-clip-${position.x}-${position.y}`;

  return (
    <g className="loupe-overlay" style={{ pointerEvents: 'none' }}>
      <defs>
        <clipPath id={clipId}>
          <circle cx={position.x} cy={position.y} r={radius} />
        </clipPath>
      </defs>
      {/* Magnified content area (simulated with scaled transform) */}
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={position.x - radius}
          y={position.y - radius}
          width={size}
          height={size}
          fill="white"
          opacity={0.95}
        />
        {/* Grid lines to simulate magnified content */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={position.x - radius}
            y1={position.y - radius + (i + 1) * (size / 9)}
            x2={position.x + radius}
            y2={position.y - radius + (i + 1) * (size / 9)}
            stroke="#d4d4d8"
            strokeWidth={0.5}
          />
        ))}
        <text
          x={position.x}
          y={position.y + 4}
          textAnchor="middle"
          fontSize={10}
          fill="#71717a"
        >
          {magnification}x
        </text>
      </g>
      {/* Loupe border */}
      <circle
        cx={position.x}
        cy={position.y}
        r={radius}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
      />
      {/* Crosshair */}
      <line x1={position.x - 6} y1={position.y} x2={position.x + 6} y2={position.y}
        stroke="#3b82f6" strokeWidth={0.5} />
      <line x1={position.x} y1={position.y - 6} x2={position.x} y2={position.y + 6}
        stroke="#3b82f6" strokeWidth={0.5} />
    </g>
  );
}
