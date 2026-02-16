import { describe, expect, it } from 'vitest'

import {
  DEFAULT_DPI,
  DEFAULT_IMAGE_HEIGHT,
  DEFAULT_IMAGE_WIDTH,
  DPI_OPTIONS,
  JPEG_QUALITY_DEFAULT,
  JPEG_QUALITY_MAX,
  JPEG_QUALITY_MIN,
  UNIT_OPTIONS,
} from '@/constants/dialogs'

describe('DPI_OPTIONS', () => {
  it('has 4 options', () => expect(DPI_OPTIONS).toHaveLength(4))
  it('each has label and numeric value', () => {
    for (const opt of DPI_OPTIONS) {
      expect(typeof opt.label).toBe('string')
      expect(typeof opt.value).toBe('number')
      expect(opt.value).toBeGreaterThan(0)
    }
  })
  it('includes 300 DPI', () => {
    expect(DPI_OPTIONS.some((o) => o.value === 300)).toBe(true)
  })
})

describe('JPEG quality constants', () => {
  it('default is 85', () => expect(JPEG_QUALITY_DEFAULT).toBe(85))
  it('min is 1', () => expect(JPEG_QUALITY_MIN).toBe(1))
  it('max is 100', () => expect(JPEG_QUALITY_MAX).toBe(100))
  it('default is within range', () => {
    expect(JPEG_QUALITY_DEFAULT).toBeGreaterThanOrEqual(JPEG_QUALITY_MIN)
    expect(JPEG_QUALITY_DEFAULT).toBeLessThanOrEqual(JPEG_QUALITY_MAX)
  })
})

describe('UNIT_OPTIONS', () => {
  it('has 4 unit types', () => expect(UNIT_OPTIONS).toHaveLength(4))
  it('includes pixels', () => {
    expect(UNIT_OPTIONS.some((o) => o.value === 'px')).toBe(true)
  })
})

describe('DEFAULT dimensions', () => {
  it('DEFAULT_IMAGE_WIDTH is 1920', () => expect(DEFAULT_IMAGE_WIDTH).toBe(1920))
  it('DEFAULT_IMAGE_HEIGHT is 1080', () => expect(DEFAULT_IMAGE_HEIGHT).toBe(1080))
  it('DEFAULT_DPI is 300', () => expect(DEFAULT_DPI).toBe(300))
})
