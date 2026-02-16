import { describe, expect, it } from 'vitest'

import { isValidCheckpoint } from '@/services/persistence'

describe('isValidCheckpoint', () => {
  const validCheckpoint = {
    id: 'cp-1',
    version: 2,
    timestamp: Date.now(),
    documentSessionId: 'session-1',
    filename: 'test.pdf',
    format: 'pdf',
    pages: [{ id: 'p1', originalIndex: 0, sourceId: 's1', sourceFormat: 'pdf', rotation: 0, flipH: false, flipV: false, width: 612, height: 792 }],
    currentPageIndex: 0,
    annotations: {},
    colorAdjustment: { exposure: 0, contrast: 0, highlights: 0, shadows: 0, saturation: 0, temperature: 0, tint: 0, sharpness: 0, sepia: 0 },
    formFields: [],
    isFormMode: false,
    zoom: 1.0,
  }

  it('returns true for valid checkpoint', () => {
    expect(isValidCheckpoint(validCheckpoint)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isValidCheckpoint(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isValidCheckpoint(undefined)).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isValidCheckpoint('string')).toBe(false)
    expect(isValidCheckpoint(42)).toBe(false)
    expect(isValidCheckpoint(true)).toBe(false)
  })

  it('returns false when filename is missing', () => {
    const { filename: _fn, ...rest } = validCheckpoint
    void _fn
    expect(isValidCheckpoint(rest)).toBe(false)
  })

  it('returns false when filename is not a string', () => {
    expect(isValidCheckpoint({ ...validCheckpoint, filename: 42 })).toBe(false)
  })

  it('returns false when format is missing', () => {
    const { format: _fmt, ...rest } = validCheckpoint
    void _fmt
    expect(isValidCheckpoint(rest)).toBe(false)
  })

  it('returns false when pages is not an array', () => {
    expect(isValidCheckpoint({ ...validCheckpoint, pages: 'not-array' })).toBe(false)
  })

  it('returns false when pages is empty', () => {
    expect(isValidCheckpoint({ ...validCheckpoint, pages: [] })).toBe(false)
  })

  it('returns false when currentPageIndex is missing', () => {
    const { currentPageIndex: _cpi, ...rest } = validCheckpoint
    void _cpi
    expect(isValidCheckpoint(rest)).toBe(false)
  })

  it('returns false when currentPageIndex is not a number', () => {
    expect(isValidCheckpoint({ ...validCheckpoint, currentPageIndex: 'zero' })).toBe(false)
  })

  it('returns false when annotations is missing', () => {
    const { annotations: _ann, ...rest } = validCheckpoint
    void _ann
    expect(isValidCheckpoint(rest)).toBe(false)
  })

  it('returns false when annotations is null', () => {
    expect(isValidCheckpoint({ ...validCheckpoint, annotations: null })).toBe(false)
  })

  it('returns false when version is missing', () => {
    const { version: _ver, ...rest } = validCheckpoint
    void _ver
    expect(isValidCheckpoint(rest)).toBe(false)
  })

  it('returns false when version is not a number', () => {
    expect(isValidCheckpoint({ ...validCheckpoint, version: 'v2' })).toBe(false)
  })
})
