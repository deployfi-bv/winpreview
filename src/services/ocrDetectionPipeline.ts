/**
 * OCR text detection pipeline.
 * Runs PaddleOCR detection model to find text boxes in an image.
 */

import { getDetectionSession } from '@/services/ocrModelLoader';
import { preprocessForDetection } from '@/services/ocrPreprocess';

export interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Run PaddleOCR detection model to find text boxes.
 */
export async function runDetection(imageData: ImageData): Promise<DetectionBox[]> {
  const session = getDetectionSession();
  const { data, dims, scaleX, scaleY } = preprocessForDetection(imageData);

  // Create ONNX tensor
  const ort = await import('onnxruntime-web');
  const inputTensor = new ort.Tensor('float32', data, dims);

  // Run inference — PP-OCR det models use 'x' as input name
  const feeds = { x: inputTensor };
  const results = await session.run(feeds);

  // Output is a probability map — extract boxes from it
  // PP-OCR det output is a sigmoid map of text regions
  const output = results[Object.keys(results)[0]];
  const outputData = output.data as Float32Array;
  const [, , outH, outW] = output.dims as number[];

  return extractBoxesFromHeatmap(outputData, outH, outW, scaleX, scaleY);
}

/**
 * Extract bounding boxes from detection model's probability heatmap.
 */
function extractBoxesFromHeatmap(
  data: Float32Array,
  h: number,
  w: number,
  scaleX: number,
  scaleY: number,
): DetectionBox[] {
  // Threshold the heatmap to get binary mask
  const threshold = 0.3;
  const binary = new Uint8Array(h * w);
  for (let i = 0; i < data.length; i++) {
    binary[i] = data[i] > threshold ? 1 : 0;
  }

  // Simple connected component analysis to find text boxes
  // Use bounding box of connected regions
  const visited = new Uint8Array(h * w);
  const boxes: DetectionBox[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (binary[y * w + x] === 0 || visited[y * w + x]) continue;

      // BFS to find connected component
      let minX = x,
        maxX = x,
        minY = y,
        maxY = y;
      const queue: [number, number][] = [[x, y]];
      visited[y * w + x] = 1;
      let area = 0;

      while (queue.length > 0) {
        const [cx, cy] = queue.shift()!;
        area++;
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);

        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx,
            ny = cy + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny * w + nx] && binary[ny * w + nx]) {
            visited[ny * w + nx] = 1;
            queue.push([nx, ny]);
          }
        }
      }

      // Filter out very small regions (noise)
      if (area < 50) continue;

      // Scale back to original coordinates
      boxes.push({
        x: minX * scaleX,
        y: minY * scaleY,
        width: (maxX - minX + 1) * scaleX,
        height: (maxY - minY + 1) * scaleY,
      });
    }
  }

  // Sort boxes top-to-bottom, left-to-right
  boxes.sort((a, b) => {
    const rowDiff = Math.abs(a.y - b.y);
    if (rowDiff < a.height * 0.5) return a.x - b.x; // Same row
    return a.y - b.y;
  });

  return boxes;
}
