import { describe, expect, it } from 'vitest'

import { formatZoom, ZOOM_DEFAULT, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP, zoomIn, zoomOut } from '@/constants/zoom'

describe('zoom constants', () => {
  it('ZOOM_MIN is 0.1', () => expect(ZOOM_MIN).toBe(0.1))
  it('ZOOM_MAX is 5.0', () => expect(ZOOM_MAX).toBe(5.0))
  it('ZOOM_STEP is 0.25', () => expect(ZOOM_STEP).toBe(0.25))
  it('ZOOM_DEFAULT is 1.0', () => expect(ZOOM_DEFAULT).toBe(1.0))
})

describe('zoomIn', () => {
  it('increases by ZOOM_STEP', () => {
    expect(zoomIn(1.0)).toBe(1.25)
  })

  it('caps at ZOOM_MAX', () => {
    expect(zoomIn(ZOOM_MAX)).toBe(ZOOM_MAX)
    expect(zoomIn(4.9)).toBe(ZOOM_MAX)
  })

  it('handles sub-step values', () => {
    expect(zoomIn(0.5)).toBe(0.75)
  })
})

describe('zoomOut', () => {
  it('decreases by ZOOM_STEP', () => {
    expect(zoomOut(1.0)).toBe(0.75)
  })

  it('floors at ZOOM_MIN', () => {
    expect(zoomOut(ZOOM_MIN)).toBe(ZOOM_MIN)
    expect(zoomOut(0.2)).toBe(ZOOM_MIN)
  })

  it('handles normal value', () => {
    expect(zoomOut(2.0)).toBe(1.75)
  })
})

describe('formatZoom', () => {
  it('formats 1.0 as 100%', () => expect(formatZoom(1.0)).toBe('100%'))
  it('formats 0.5 as 50%', () => expect(formatZoom(0.5)).toBe('50%'))
  it('formats 2.0 as 200%', () => expect(formatZoom(2.0)).toBe('200%'))
  it('formats 0.1 as 10%', () => expect(formatZoom(0.1)).toBe('10%'))
  it('rounds to nearest integer', () => expect(formatZoom(0.333)).toBe('33%'))
})
