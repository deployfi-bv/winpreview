import { describe, expect, it } from 'vitest'

import { calculateFitPage, calculateFitWidth, clampZoom } from '@/lib/zoom'

import { ZOOM_MAX, ZOOM_MIN } from '@/constants/zoom'

import { DEFAULT_PAGE_HEIGHT, DEFAULT_PAGE_WIDTH } from '@/types/page'

describe('clampZoom', () => {
  it('returns value within range', () => {
    expect(clampZoom(1.0)).toBe(1.0)
  })

  it('clamps to ZOOM_MIN', () => {
    expect(clampZoom(0.01)).toBe(ZOOM_MIN)
  })

  it('clamps to ZOOM_MAX', () => {
    expect(clampZoom(10)).toBe(ZOOM_MAX)
  })

  it('rounds to 2 decimal places', () => {
    expect(clampZoom(1.555)).toBe(1.56)
    expect(clampZoom(0.333)).toBe(0.33)
  })

  it('handles exact boundaries', () => {
    expect(clampZoom(ZOOM_MIN)).toBe(ZOOM_MIN)
    expect(clampZoom(ZOOM_MAX)).toBe(ZOOM_MAX)
  })

  it('handles negative values by clamping to min', () => {
    expect(clampZoom(-1)).toBe(ZOOM_MIN)
  })
})

describe('calculateFitWidth', () => {
  it('calculates zoom to fit page width in viewport', () => {
    // viewport = 1000, padding = 48*2 = 96, available = 904
    // zoom = 904 / 612 ≈ 1.477
    const result = calculateFitWidth(1000)
    expect(result).toBeGreaterThan(1)
    expect(result).toBeLessThan(2)
  })

  it('uses custom page width', () => {
    const result = calculateFitWidth(1000, 400)
    // available = 1000 - 96 = 904, zoom = 904/400 = 2.26
    expect(result).toBeGreaterThan(2)
  })

  it('uses default page width when not specified', () => {
    const a = calculateFitWidth(1000)
    const b = calculateFitWidth(1000, DEFAULT_PAGE_WIDTH)
    expect(a).toBe(b)
  })

  it('clamps result', () => {
    // Very narrow viewport
    const result = calculateFitWidth(50)
    expect(result).toBeGreaterThanOrEqual(ZOOM_MIN)
  })
})

describe('calculateFitPage', () => {
  it('fits page in viewport (width-limited)', () => {
    // Narrow viewport: width limited
    const result = calculateFitPage(600, 2000)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(2)
  })

  it('fits page in viewport (height-limited)', () => {
    // Short viewport: height limited
    const result = calculateFitPage(2000, 600)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it('uses custom dimensions', () => {
    const result = calculateFitPage(1000, 1000, 400, 300)
    // available = 904x904, zoomW=904/400=2.26, zoomH=904/300=3.01 → min = 2.26
    expect(result).toBeGreaterThan(2)
  })

  it('uses default dimensions', () => {
    const a = calculateFitPage(1000, 800)
    const b = calculateFitPage(1000, 800, DEFAULT_PAGE_WIDTH, DEFAULT_PAGE_HEIGHT)
    expect(a).toBe(b)
  })

  it('clamps result', () => {
    const result = calculateFitPage(50, 50)
    expect(result).toBeGreaterThanOrEqual(ZOOM_MIN)
  })
})
