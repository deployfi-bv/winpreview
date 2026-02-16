import { describe, expect, it } from 'vitest'

import { simplifyPath } from '@/lib/pathSimplify'

describe('simplifyPath', () => {
  it('returns original for empty array', () => {
    expect(simplifyPath([])).toEqual([])
  })

  it('returns original for single point', () => {
    const points = [{ x: 0, y: 0 }]
    expect(simplifyPath(points)).toEqual(points)
  })

  it('returns original for two points', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
    expect(simplifyPath(points)).toEqual(points)
  })

  it('preserves endpoints', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 0.1 },
      { x: 10, y: 0 },
    ]
    const result = simplifyPath(points, 1)
    expect(result[0]).toEqual({ x: 0, y: 0 })
    expect(result[result.length - 1]).toEqual({ x: 10, y: 0 })
  })

  it('removes collinear points', () => {
    // Points along a straight line — middle point should be removed
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
    ]
    const result = simplifyPath(points, 1)
    expect(result).toEqual([{ x: 0, y: 0 }, { x: 10, y: 0 }])
  })

  it('preserves significant deviations', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 50 },
      { x: 10, y: 0 },
    ]
    const result = simplifyPath(points, 1)
    expect(result.length).toBe(3)
  })

  it('respects tolerance parameter', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 2 },
      { x: 10, y: 0 },
    ]
    const tight = simplifyPath(points, 0.5)
    const loose = simplifyPath(points, 5)
    expect(tight.length).toBeGreaterThanOrEqual(loose.length)
  })

  it('handles complex curve', () => {
    const points = Array.from({ length: 100 }, (_, i) => ({
      x: i,
      y: Math.sin(i / 10) * 20,
    }))
    const result = simplifyPath(points, 2)
    expect(result.length).toBeLessThan(points.length)
    expect(result.length).toBeGreaterThan(2)
  })
})
