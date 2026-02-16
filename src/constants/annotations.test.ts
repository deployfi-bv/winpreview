import { describe, expect, it } from 'vitest'

import {
  ARROWHEAD_OPTIONS,
  BORDER_STYLES,
  BORDER_WIDTHS,
  COLOR_PRESETS,
  FONT_FAMILIES,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  POLYGON_SIDES_OPTIONS,
  STAR_POINTS_OPTIONS,
  STICKY_NOTE_COLORS,
  TEXT_ALIGNMENTS,
} from '@/constants/annotations'

describe('COLOR_PRESETS', () => {
  it('has 6 presets', () => expect(COLOR_PRESETS).toHaveLength(6))
  it('each has label and hex value', () => {
    for (const c of COLOR_PRESETS) {
      expect(c.label).toBeTruthy()
      expect(c.value).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

describe('BORDER_WIDTHS', () => {
  it('has expected widths', () => {
    expect(BORDER_WIDTHS).toEqual([1, 2, 3, 5, 8, 10])
  })
})

describe('BORDER_STYLES', () => {
  it('has solid, dashed, dotted', () => {
    expect([...BORDER_STYLES]).toEqual(['solid', 'dashed', 'dotted'])
  })
})

describe('ARROWHEAD_OPTIONS', () => {
  it('has none, start, end, both', () => {
    expect([...ARROWHEAD_OPTIONS]).toEqual(['none', 'start', 'end', 'both'])
  })
})

describe('FONT_FAMILIES', () => {
  it('has at least 3 fonts', () => {
    expect(FONT_FAMILIES.length).toBeGreaterThanOrEqual(3)
  })
  it('includes Arial', () => {
    expect([...FONT_FAMILIES]).toContain('Arial')
  })
})

describe('FONT_SIZES', () => {
  it('has multiple sizes', () => {
    expect(FONT_SIZES.length).toBeGreaterThan(5)
  })
  it('is sorted ascending', () => {
    for (let i = 1; i < FONT_SIZES.length; i++) {
      expect(FONT_SIZES[i]).toBeGreaterThan(FONT_SIZES[i - 1])
    }
  })
})

describe('TEXT_ALIGNMENTS', () => {
  it('has left, center, right, monospace', () => {
    expect([...TEXT_ALIGNMENTS]).toEqual(['left', 'center', 'right', 'monospace'])
  })
})

describe('HIGHLIGHT_COLORS', () => {
  it('has 6 colors', () => expect(HIGHLIGHT_COLORS).toHaveLength(6))
})

describe('STICKY_NOTE_COLORS', () => {
  it('has 6 colors', () => expect(STICKY_NOTE_COLORS).toHaveLength(6))
})

describe('STAR_POINTS_OPTIONS', () => {
  it('has expected values', () => {
    expect([...STAR_POINTS_OPTIONS]).toEqual([3, 4, 5, 6, 8])
  })
})

describe('POLYGON_SIDES_OPTIONS', () => {
  it('has expected values', () => {
    expect([...POLYGON_SIDES_OPTIONS]).toEqual([3, 4, 5, 6, 8, 10, 12])
  })
})
