import { describe, expect, it } from 'vitest'

import { createPage, DEFAULT_PAGE_HEIGHT, DEFAULT_PAGE_WIDTH } from '@/types/page'

describe('DEFAULT_PAGE_WIDTH / DEFAULT_PAGE_HEIGHT', () => {
  it('has US Letter width at 72 DPI', () => expect(DEFAULT_PAGE_WIDTH).toBe(612))
  it('has US Letter height at 72 DPI', () => expect(DEFAULT_PAGE_HEIGHT).toBe(792))
})

describe('createPage', () => {
  it('creates a page with required options', () => {
    const page = createPage({ originalIndex: 0, sourceId: 'src-1', sourceFormat: 'pdf' })
    expect(page.originalIndex).toBe(0)
    expect(page.sourceId).toBe('src-1')
    expect(page.sourceFormat).toBe('pdf')
    expect(page.width).toBe(DEFAULT_PAGE_WIDTH)
    expect(page.height).toBe(DEFAULT_PAGE_HEIGHT)
    expect(page.rotation).toBe(0)
    expect(page.flipH).toBe(false)
    expect(page.flipV).toBe(false)
  })

  it('uses custom width and height', () => {
    const page = createPage({ originalIndex: 1, width: 800, height: 600, sourceId: 's1', sourceFormat: 'image' })
    expect(page.width).toBe(800)
    expect(page.height).toBe(600)
  })

  it('generates unique ids', () => {
    const a = createPage({ originalIndex: 0, sourceId: 's1', sourceFormat: 'pdf' })
    const b = createPage({ originalIndex: 0, sourceId: 's1', sourceFormat: 'pdf' })
    expect(a.id).not.toBe(b.id)
  })

  it('id starts with page- prefix', () => {
    const page = createPage({ originalIndex: 3, sourceId: 's1', sourceFormat: 'pdf' })
    expect(page.id).toMatch(/^page-3-/)
  })

  it('supports image sourceFormat', () => {
    const page = createPage({ originalIndex: 0, sourceId: 'img-1', sourceFormat: 'image' })
    expect(page.sourceFormat).toBe('image')
  })
})
