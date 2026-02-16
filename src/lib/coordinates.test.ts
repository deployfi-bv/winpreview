import { describe, expect, it } from 'vitest'

import { screenToPage } from '@/lib/coordinates'

describe('screenToPage', () => {
  it('transforms coordinates using identity matrix', () => {
    const mockSvg = {
      getScreenCTM: () => ({
        inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
      }),
    } as unknown as SVGSVGElement

    const result = screenToPage(100, 200, mockSvg)
    expect(result.x).toBe(100)
    expect(result.y).toBe(200)
  })

  it('applies translation offset', () => {
    const mockSvg = {
      getScreenCTM: () => ({
        inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: -50, f: -100 }),
      }),
    } as unknown as SVGSVGElement

    const result = screenToPage(100, 200, mockSvg)
    expect(result.x).toBe(50)
    expect(result.y).toBe(100)
  })

  it('applies scaling', () => {
    const mockSvg = {
      getScreenCTM: () => ({
        inverse: () => ({ a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 }),
      }),
    } as unknown as SVGSVGElement

    const result = screenToPage(100, 200, mockSvg)
    expect(result.x).toBe(200)
    expect(result.y).toBe(400)
  })

  it('returns origin when getScreenCTM returns null', () => {
    const mockSvg = {
      getScreenCTM: () => null,
    } as unknown as SVGSVGElement

    const result = screenToPage(100, 200, mockSvg)
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })
})
