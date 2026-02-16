import { describe, expect, it } from 'vitest'

import { ADJUSTMENT_SLIDERS, buildCssFilter, DEFAULT_COLOR_ADJUSTMENT } from '@/lib/colorAdjustment'

describe('DEFAULT_COLOR_ADJUSTMENT', () => {
  it('has all values at zero', () => {
    const keys = Object.keys(DEFAULT_COLOR_ADJUSTMENT)
    for (const key of keys) {
      expect(DEFAULT_COLOR_ADJUSTMENT[key as keyof typeof DEFAULT_COLOR_ADJUSTMENT]).toBe(0)
    }
  })

  it('has 9 properties', () => {
    expect(Object.keys(DEFAULT_COLOR_ADJUSTMENT)).toHaveLength(9)
  })
})

describe('ADJUSTMENT_SLIDERS', () => {
  it('has 9 sliders', () => {
    expect(ADJUSTMENT_SLIDERS).toHaveLength(9)
  })

  it('each slider has required fields', () => {
    for (const slider of ADJUSTMENT_SLIDERS) {
      expect(slider).toHaveProperty('key')
      expect(slider).toHaveProperty('label')
      expect(slider).toHaveProperty('min')
      expect(slider).toHaveProperty('max')
      expect(slider).toHaveProperty('step')
      expect(typeof slider.label).toBe('string')
      expect(slider.max).toBeGreaterThan(slider.min)
    }
  })

  it('keys match DEFAULT_COLOR_ADJUSTMENT keys', () => {
    const sliderKeys = ADJUSTMENT_SLIDERS.map((s) => s.key).sort()
    const adjKeys = Object.keys(DEFAULT_COLOR_ADJUSTMENT).sort()
    expect(sliderKeys).toEqual(adjKeys)
  })
})

describe('buildCssFilter', () => {
  it('returns none for default values', () => {
    expect(buildCssFilter(DEFAULT_COLOR_ADJUSTMENT)).toBe('none')
  })

  it('returns brightness filter for exposure', () => {
    const result = buildCssFilter({ ...DEFAULT_COLOR_ADJUSTMENT, exposure: 50 })
    expect(result).toBe('brightness(150%)')
  })

  it('returns contrast filter', () => {
    const result = buildCssFilter({ ...DEFAULT_COLOR_ADJUSTMENT, contrast: -30 })
    expect(result).toBe('contrast(70%)')
  })

  it('returns saturate filter', () => {
    const result = buildCssFilter({ ...DEFAULT_COLOR_ADJUSTMENT, saturation: 25 })
    expect(result).toBe('saturate(125%)')
  })

  it('returns hue-rotate for temperature', () => {
    const result = buildCssFilter({ ...DEFAULT_COLOR_ADJUSTMENT, temperature: 100 })
    expect(result).toBe('hue-rotate(30deg)')
  })

  it('returns sepia filter', () => {
    const result = buildCssFilter({ ...DEFAULT_COLOR_ADJUSTMENT, sepia: 50 })
    expect(result).toBe('sepia(50%)')
  })

  it('combines multiple filters', () => {
    const result = buildCssFilter({ ...DEFAULT_COLOR_ADJUSTMENT, exposure: 10, contrast: 20 })
    expect(result).toBe('brightness(110%) contrast(120%)')
  })

  it('ignores zero values', () => {
    const result = buildCssFilter({ ...DEFAULT_COLOR_ADJUSTMENT, exposure: 0, contrast: 50 })
    expect(result).toBe('contrast(150%)')
    expect(result).not.toContain('brightness')
  })
})
