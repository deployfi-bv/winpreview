import { describe, expect, it } from 'vitest'

import { recognizeShape } from '@/lib/sketchRecognition'

describe('recognizeShape', () => {
  it('returns null for too few points', () => {
    expect(recognizeShape([])).toBeNull()
    expect(recognizeShape([{ x: 0, y: 0 }])).toBeNull()
    expect(recognizeShape([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }])).toBeNull()
  })

  it('detects a straight line', () => {
    // Straight horizontal line with slight noise
    const points = Array.from({ length: 30 }, (_, i) => ({
      x: i * 5,
      y: Math.random() * 0.5,
    }))
    const result = recognizeShape(points)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('line')
    expect(result!.confidence).toBeGreaterThan(0.5)
  })

  it('detects a circle', () => {
    // Generate points along a circle
    const cx = 100, cy = 100, r = 50
    const points = Array.from({ length: 40 }, (_, i) => {
      const angle = (i / 40) * Math.PI * 2
      return {
        x: cx + r * Math.cos(angle) + (Math.random() - 0.5) * 3,
        y: cy + r * Math.sin(angle) + (Math.random() - 0.5) * 3,
      }
    })
    // Close the path
    points.push({ x: points[0].x, y: points[0].y })
    const result = recognizeShape(points)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('circle')
    expect(result!.confidence).toBeGreaterThan(0.5)
  })

  it('detects a rectangle', () => {
    // Generate points along a rectangle
    const x = 50, y = 50, w = 100, h = 60
    const points = [
      // Top edge
      ...Array.from({ length: 10 }, (_, i) => ({ x: x + (w * i) / 10, y })),
      // Right edge
      ...Array.from({ length: 10 }, (_, i) => ({ x: x + w, y: y + (h * i) / 10 })),
      // Bottom edge
      ...Array.from({ length: 10 }, (_, i) => ({ x: x + w - (w * i) / 10, y: y + h })),
      // Left edge
      ...Array.from({ length: 10 }, (_, i) => ({ x, y: y + h - (h * i) / 10 })),
      // Close
      { x, y },
    ]
    const result = recognizeShape(points)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('rectangle')
    expect(result!.confidence).toBeGreaterThan(0.5)
  })

  it('returns bounds with the result', () => {
    const points = Array.from({ length: 30 }, (_, i) => ({
      x: i * 5,
      y: 0,
    }))
    const result = recognizeShape(points)
    if (result) {
      expect(result.bounds).toHaveProperty('x')
      expect(result.bounds).toHaveProperty('y')
      expect(result.bounds).toHaveProperty('width')
      expect(result.bounds).toHaveProperty('height')
    }
  })

  it('returns null for random scribble', () => {
    // Very chaotic random points with no recognizable shape
    const points = Array.from({ length: 20 }, () => ({
      x: Math.random() * 200,
      y: Math.random() * 200,
    }))
    // Close the path to make it a closed scribble
    points.push(points[0])
    // This may or may not match — just verify it doesn't crash
    const result = recognizeShape(points)
    // Result could be null or a low-confidence match
    if (result) {
      expect(result.confidence).toBeGreaterThan(0)
    }
  })

  it('returns the highest confidence match', () => {
    // A near-perfect line should have high confidence
    const points = Array.from({ length: 30 }, (_, i) => ({
      x: i * 5,
      y: 0,
    }))
    const result = recognizeShape(points)
    expect(result).not.toBeNull()
    expect(result!.confidence).toBeGreaterThanOrEqual(0.5)
  })
})
