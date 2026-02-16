import { describe, expect, it } from 'vitest'

import { polygonPath, speechBalloonPath, starPath } from '@/lib/shapeGeometry'

describe('starPath', () => {
  it('returns SVG path starting with M and ending with Z', () => {
    const path = starPath(50, 50, 40, 20, 5)
    expect(path).toMatch(/^M /)
    expect(path).toMatch(/ Z$/)
  })

  it('has correct number of L commands for 5-point star', () => {
    const path = starPath(50, 50, 40, 20, 5)
    const segments = path.split(' L ')
    // 5 points * 2 = 10 vertices, first is M, so 9 L segments + Z
    expect(segments.length).toBe(10)
  })

  it('has correct number of L commands for 3-point star', () => {
    const path = starPath(50, 50, 40, 20, 3)
    const segments = path.split(' L ')
    expect(segments.length).toBe(6)
  })

  it('produces different paths for different point counts', () => {
    const p5 = starPath(50, 50, 40, 20, 5)
    const p8 = starPath(50, 50, 40, 20, 8)
    expect(p5).not.toBe(p8)
  })
})

describe('polygonPath', () => {
  it('returns SVG path starting with M and ending with Z', () => {
    const path = polygonPath(50, 50, 40, 6)
    expect(path).toMatch(/^M /)
    expect(path).toMatch(/ Z$/)
  })

  it('has correct number of vertices for hexagon', () => {
    const path = polygonPath(50, 50, 40, 6)
    const segments = path.split(' L ')
    expect(segments.length).toBe(6)
  })

  it('has correct number of vertices for triangle', () => {
    const path = polygonPath(50, 50, 40, 3)
    const segments = path.split(' L ')
    expect(segments.length).toBe(3)
  })

  it('has correct number of vertices for square', () => {
    const path = polygonPath(50, 50, 40, 4)
    const segments = path.split(' L ')
    expect(segments.length).toBe(4)
  })
})

describe('speechBalloonPath', () => {
  it('returns SVG path starting with M and ending with Z', () => {
    const path = speechBalloonPath(10, 10, 200, 100, 'bottom-left')
    expect(path).toMatch(/^M /)
    expect(path).toMatch(/Z$/)
  })

  it('produces different paths for different tail directions', () => {
    const left = speechBalloonPath(10, 10, 200, 100, 'bottom-left')
    const right = speechBalloonPath(10, 10, 200, 100, 'bottom-right')
    expect(left).not.toBe(right)
  })

  it('includes Q commands for rounded corners', () => {
    const path = speechBalloonPath(0, 0, 200, 100, 'bottom-left')
    expect(path).toContain('Q ')
  })

  it('handles small dimensions without errors', () => {
    const path = speechBalloonPath(0, 0, 20, 20, 'bottom-right')
    expect(path).toMatch(/^M /)
    expect(path).toMatch(/Z$/)
  })
})
