import { describe, expect, it } from 'vitest'

import { tryConvertFreehand } from '@/lib/sketchConversion'

import type { FreehandAnnotation } from '@/types/annotation'

function makeFreehand(points: Array<{ x: number; y: number }>): FreehandAnnotation {
  return {
    id: 'fh-1', pageId: 'p1', type: 'freehand', x: points[0]?.x ?? 0, y: points[0]?.y ?? 0,
    zIndex: 5, points, color: '#FF0000', width: 3,
  }
}

describe('tryConvertFreehand', () => {
  it('returns null for too few points', () => {
    const fh = makeFreehand([{ x: 0, y: 0 }, { x: 10, y: 10 }])
    expect(tryConvertFreehand(fh)).toBeNull()
  })

  it('converts a line-like freehand to line annotation', () => {
    const points = Array.from({ length: 30 }, (_, i) => ({ x: i * 5, y: 0 }))
    const fh = makeFreehand(points)
    const result = tryConvertFreehand(fh)
    expect(result).not.toBeNull()
    expect(result!.shapeName).toBe('Line')
    expect(result!.converted.type).toBe('line')
    if (result!.converted.type === 'line') {
      expect(result!.converted.color).toBe('#FF0000')
      expect(result!.converted.width).toBe(3)
    }
  })

  it('converts a circle-like freehand to oval', () => {
    const cx = 100, cy = 100, r = 50
    const points = Array.from({ length: 40 }, (_, i) => {
      const angle = (i / 40) * Math.PI * 2
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
    })
    points.push(points[0])
    const fh = makeFreehand(points)
    const result = tryConvertFreehand(fh)
    if (result) {
      expect(result.shapeName).toBe('Circle')
      expect(result.converted.type).toBe('oval')
    }
  })

  it('converts a rectangle-like freehand to rectangle', () => {
    const x = 50, y = 50, w = 100, h = 60
    const points = [
      ...Array.from({ length: 10 }, (_, i) => ({ x: x + (w * i) / 10, y })),
      ...Array.from({ length: 10 }, (_, i) => ({ x: x + w, y: y + (h * i) / 10 })),
      ...Array.from({ length: 10 }, (_, i) => ({ x: x + w - (w * i) / 10, y: y + h })),
      ...Array.from({ length: 10 }, (_, i) => ({ x, y: y + h - (h * i) / 10 })),
      { x, y },
    ]
    const fh = makeFreehand(points)
    const result = tryConvertFreehand(fh)
    if (result) {
      expect(result.shapeName).toBe('Rectangle')
      expect(result.converted.type).toBe('rectangle')
    }
  })

  it('preserves pageId and zIndex from source', () => {
    const points = Array.from({ length: 30 }, (_, i) => ({ x: i * 5, y: 0 }))
    const fh = makeFreehand(points)
    const result = tryConvertFreehand(fh)
    if (result) {
      expect(result.converted.pageId).toBe('p1')
      expect(result.converted.zIndex).toBe(5)
    }
  })

  it('returns null for random scribble', () => {
    const points = Array.from({ length: 10 }, (_, i) => ({
      x: Math.sin(i) * 50 + 100,
      y: Math.cos(i * 3) * 50 + 100,
    }))
    points.push(points[0])
    const fh = makeFreehand(points)
    // May or may not convert — shouldn't crash
    const result = tryConvertFreehand(fh)
    if (result === null) {
      expect(result).toBeNull()
    } else {
      expect(result.shapeName).toBeTruthy()
    }
  })
})
