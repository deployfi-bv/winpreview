// Shape matching: detect circles, rectangles, lines, and triangles from freehand points

interface Point {
  x: number;
  y: number;
}

interface RecognizedShape {
  type: 'circle' | 'rectangle' | 'line' | 'triangle';
  confidence: number;
  bounds: { x: number; y: number; width: number; height: number };
}

function getBounds(points: Point[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
  };
}

function pathLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}

function isClosedPath(points: Point[], tolerance = 20): boolean {
  if (points.length < 3) return false;
  const first = points[0];
  const last = points[points.length - 1];
  return Math.hypot(first.x - last.x, first.y - last.y) < tolerance;
}

function detectCircle(points: Point[]): number {
  if (!isClosedPath(points)) return 0;
  const bounds = getBounds(points);
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  const avgR = (bounds.width + bounds.height) / 4;
  if (avgR < 10) return 0;

  // Check aspect ratio (should be close to 1:1)
  const aspect = bounds.width / bounds.height;
  if (aspect < 0.6 || aspect > 1.67) return 0;

  // Check how close points are to the ideal circle
  const distances = points.map((p) => Math.abs(Math.hypot(p.x - cx, p.y - cy) - avgR));
  const avgDeviation = distances.reduce((a, b) => a + b, 0) / distances.length;
  const normalizedDev = avgDeviation / avgR;

  return normalizedDev < 0.15 ? 0.9 - normalizedDev : normalizedDev < 0.25 ? 0.6 : 0;
}

function detectRectangle(points: Point[]): number {
  if (!isClosedPath(points)) return 0;
  const bounds = getBounds(points);
  if (bounds.width < 15 || bounds.height < 15) return 0;

  const perimeter = 2 * (bounds.width + bounds.height);
  const actual = pathLength(points);
  const ratio = actual / perimeter;

  // A perfect rectangle would have ratio close to 1.0
  if (ratio < 0.85 || ratio > 1.3) return 0;

  // Check how many points are close to the bounding box edges
  const edgeTol = Math.max(bounds.width, bounds.height) * 0.12;
  const onEdge = points.filter((p) => {
    const dx = Math.min(Math.abs(p.x - bounds.x), Math.abs(p.x - (bounds.x + bounds.width)));
    const dy = Math.min(Math.abs(p.y - bounds.y), Math.abs(p.y - (bounds.y + bounds.height)));
    return dx < edgeTol || dy < edgeTol;
  });

  const edgeRatio = onEdge.length / points.length;
  return edgeRatio > 0.7 ? 0.85 : edgeRatio > 0.5 ? 0.6 : 0;
}

function detectLine(points: Point[]): number {
  if (points.length < 2) return 0;
  if (isClosedPath(points)) return 0;

  const first = points[0];
  const last = points[points.length - 1];
  const directDist = Math.hypot(last.x - first.x, last.y - first.y);
  if (directDist < 20) return 0;

  const actual = pathLength(points);
  const ratio = directDist / actual;

  return ratio > 0.95 ? 0.9 : ratio > 0.85 ? 0.7 : ratio > 0.75 ? 0.5 : 0;
}

function detectTriangle(points: Point[]): number {
  if (!isClosedPath(points)) return 0;
  const bounds = getBounds(points);
  if (bounds.width < 15 || bounds.height < 15) return 0;

  // Simplify to few corners and check if 3 corners exist
  const corners = findCorners(points, Math.PI / 4);
  if (corners.length < 3 || corners.length > 5) return 0;

  return corners.length === 3 ? 0.8 : 0.5;
}

function findCorners(points: Point[], angleThreshold: number): Point[] {
  if (points.length < 5) return [];
  const corners: Point[] = [];
  const step = Math.max(1, Math.floor(points.length / 30));

  for (let i = step; i < points.length - step; i += step) {
    const prev = points[i - step];
    const curr = points[i];
    const next = points[i + step];
    const a1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const a2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    let diff = Math.abs(a2 - a1);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    if (diff > angleThreshold) corners.push(curr);
  }
  return corners;
}

export function recognizeShape(points: Point[]): RecognizedShape | null {
  if (points.length < 5) return null;

  const bounds = getBounds(points);
  const candidates: RecognizedShape[] = [];

  const lineConf = detectLine(points);
  if (lineConf > 0.5) candidates.push({ type: 'line', confidence: lineConf, bounds });

  const circConf = detectCircle(points);
  if (circConf > 0.5) candidates.push({ type: 'circle', confidence: circConf, bounds });

  const rectConf = detectRectangle(points);
  if (rectConf > 0.5) candidates.push({ type: 'rectangle', confidence: rectConf, bounds });

  const triConf = detectTriangle(points);
  if (triConf > 0.5) candidates.push({ type: 'triangle', confidence: triConf, bounds });

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates[0];
}
