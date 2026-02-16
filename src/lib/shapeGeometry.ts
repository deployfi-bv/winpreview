// SVG path generators for complex shapes

/** Generate SVG path for a regular star */
export function starPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const step = Math.PI / points;
  const parts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = i * step - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    parts.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

/** Generate SVG path for a regular polygon */
export function polygonPath(cx: number, cy: number, radius: number, sides: number): string {
  const step = (Math.PI * 2) / sides;
  const parts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = i * step - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    parts.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

/** Generate SVG path for a speech balloon (rounded rect + tail) */
export function speechBalloonPath(
  x: number, y: number, width: number, height: number,
  tailDirection: 'bottom-left' | 'bottom-right'
): string {
  const r = Math.min(8, width / 4, height / 4);
  const bodyH = height * 0.8;
  const tailH = height * 0.2;
  const tailW = Math.min(20, width * 0.2);

  // Rounded rect body
  const d = [
    `M ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `L ${x + width} ${y + bodyH - r}`,
    `Q ${x + width} ${y + bodyH} ${x + width - r} ${y + bodyH}`,
  ];

  // Tail on bottom
  if (tailDirection === 'bottom-right') {
    d.push(
      `L ${x + width * 0.6 + tailW} ${y + bodyH}`,
      `L ${x + width * 0.7} ${y + bodyH + tailH}`,
      `L ${x + width * 0.6} ${y + bodyH}`,
    );
  } else {
    d.push(`L ${x + width * 0.4 + tailW} ${y + bodyH}`);
    d.push(`L ${x + width * 0.3} ${y + bodyH + tailH}`);
    d.push(`L ${x + width * 0.4} ${y + bodyH}`);
  }

  d.push(
    `L ${x + r} ${y + bodyH}`,
    `Q ${x} ${y + bodyH} ${x} ${y + bodyH - r}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    'Z',
  );

  return d.join(' ');
}
