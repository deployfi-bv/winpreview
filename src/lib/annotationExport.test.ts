import { describe, expect, it, vi } from 'vitest'

import { drawAnnotation } from '@/lib/annotationExport'

import type { Annotation } from '@/types/annotation'
import type { PDFPage } from 'pdf-lib'

function createMockPage() {
  return {
    drawRectangle: vi.fn(),
    drawEllipse: vi.fn(),
    drawLine: vi.fn(),
    drawText: vi.fn(),
    drawImage: vi.fn(),
    getSize: vi.fn().mockReturnValue({ width: 612, height: 792 }),
  } as unknown as PDFPage
}

const base = { id: '1', pageId: 'p1', x: 10, y: 20, zIndex: 0 }
const pageHeight = 792

describe('drawAnnotation', () => {
  it('draws rectangle', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'rectangle', width: 100, height: 50, borderColor: '#000000', fillColor: 'none', borderWidth: 2, borderStyle: 'solid' }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawRectangle).toHaveBeenCalledOnce()
  })

  it('draws oval as ellipse', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'oval', width: 100, height: 50, borderColor: '#000000', fillColor: '#FF0000', borderWidth: 2, borderStyle: 'solid' }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawEllipse).toHaveBeenCalledOnce()
  })

  it('draws rectangle with fill color', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'rectangle', width: 100, height: 50, borderColor: '#000000', fillColor: '#00FF00', borderWidth: 2, borderStyle: 'solid' }
    drawAnnotation(page, ann, pageHeight)
    const call = (page.drawRectangle as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call.color).toBeDefined()
  })

  it('draws line', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'line', endX: 100, endY: 100, color: '#000000', width: 2, style: 'solid', arrowhead: 'none' }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawLine).toHaveBeenCalledOnce()
  })

  it('draws text', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'text', width: 150, height: 30, content: 'Hello', fontFamily: 'Arial', fontSize: 14, color: '#000000', bold: false, italic: false, alignment: 'left' }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawText).toHaveBeenCalledOnce()
  })

  it('draws monospace text with provided font', () => {
    const page = createMockPage()
    const mockFont = { name: 'Courier', widthOfTextAtSize: (text: string, size: number) => text.length * size * 0.6 } as never
    const ann: Annotation = { ...base, type: 'text', width: 150, height: 30, content: 'Code', fontFamily: 'Arial', fontSize: 14, color: '#000000', bold: false, italic: false, alignment: 'monospace' }
    drawAnnotation(page, ann, pageHeight, { monospace: mockFont })
    expect(page.drawText).toHaveBeenCalledOnce()
    const call = (page.drawText as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(call[1].font).toBe(mockFont)
  })

  it('draws monospace text without font when fonts not provided', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'text', width: 150, height: 30, content: 'Code', fontFamily: 'Arial', fontSize: 14, color: '#000000', bold: false, italic: false, alignment: 'monospace' }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawText).toHaveBeenCalledOnce()
    const call = (page.drawText as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(call[1].font).toBeUndefined()
  })

  it('draws freehand as line segments', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'freehand', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 5 }], color: '#FF0000', width: 3 }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawLine).toHaveBeenCalledTimes(2)
  })

  it('skips freehand with less than 2 points', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'freehand', points: [{ x: 0, y: 0 }], color: '#FF0000', width: 3 }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawLine).not.toHaveBeenCalled()
  })

  it('draws signature as line segments', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'signature', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }], color: '#000000', width: 2 }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawLine).toHaveBeenCalledOnce()
  })

  it('draws highlight as rectangle', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'highlight', width: 100, height: 20, color: '#FFCC00', opacity: 0.3 }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawRectangle).toHaveBeenCalledOnce()
  })

  it('draws underline as line', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'underline', width: 100, height: 20, color: '#000000', opacity: 1.0 }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawLine).toHaveBeenCalledOnce()
  })

  it('draws strikethrough as line at midpoint', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'strikethrough', width: 100, height: 20, color: '#000000', opacity: 1.0 }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawLine).toHaveBeenCalledOnce()
  })

  it('draws redaction as black rectangle', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'redaction', width: 100, height: 20 }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawRectangle).toHaveBeenCalledOnce()
  })

  it('draws star as rectangle approximation', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'star', width: 50, height: 50, points: 5, borderColor: '#000000', fillColor: '#FFCC00', borderWidth: 2, borderStyle: 'solid' }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawRectangle).toHaveBeenCalledOnce()
  })

  it('draws polygon as rectangle approximation', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'polygon', width: 50, height: 50, sides: 6, borderColor: '#000000', fillColor: 'none', borderWidth: 2, borderStyle: 'solid' }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawRectangle).toHaveBeenCalledOnce()
  })

  it('draws speech-balloon as rectangle + text', () => {
    const page = createMockPage()
    const ann: Annotation = { ...base, type: 'speech-balloon', width: 120, height: 80, content: 'Hi', tailDirection: 'bottom-left', borderColor: '#000000', fillColor: '#FFFFFF', borderWidth: 2, fontSize: 14 }
    drawAnnotation(page, ann, pageHeight)
    expect(page.drawRectangle).toHaveBeenCalledOnce()
    expect(page.drawText).toHaveBeenCalledOnce()
  })
})
