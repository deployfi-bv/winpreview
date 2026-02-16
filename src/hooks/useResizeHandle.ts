/** Compute updated position/size for a bounding box when a resize handle is dragged. */
export function resizeFromHandle(
  orig: { x: number; y: number; width: number; height: number },
  handleType: string,
  coords: { x: number; y: number }
): { x?: number; y?: number; width?: number; height?: number } {
  const { x, y, width, height } = orig;
  const right = x + width;
  const bottom = y + height;

  switch (handleType) {
    case 'nw': return { x: coords.x, y: coords.y, width: right - coords.x, height: bottom - coords.y };
    case 'n': return { y: coords.y, height: bottom - coords.y };
    case 'ne': return { y: coords.y, width: coords.x - x, height: bottom - coords.y };
    case 'e': return { width: coords.x - x };
    case 'se': return { width: coords.x - x, height: coords.y - y };
    case 's': return { height: coords.y - y };
    case 'sw': return { x: coords.x, width: right - coords.x, height: coords.y - y };
    case 'w': return { x: coords.x, width: right - coords.x };
    default: return {};
  }
}
