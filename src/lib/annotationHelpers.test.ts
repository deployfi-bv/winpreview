import { describe, expect, it } from 'vitest'

import { createAnnotation } from '@/lib/annotationFactory'
import { clampToPage, getHandles, isPointInAnnotation } from '@/lib/annotationHelpers'

import type { Annotation } from '@/types/annotation'

describe('createAnnotation', () => {
  it('creates rectangle annotation', () => {
    const a = createAnnotation('rectangle', 10, 20, 'p1', 1)
    expect(a.type).toBe('rectangle')
    expect(a.x).toBe(10)
    expect(a.y).toBe(20)
    expect(a.pageId).toBe('p1')
    expect(a.zIndex).toBe(1)
    expect(a.id).toBeTruthy()
    if (a.type === 'rectangle') {
      expect(a.width).toBe(0)
      expect(a.height).toBe(0)
      expect(a.borderColor).toBe('#000000')
      expect(a.fillColor).toBe('none')
    }
  })

  it('creates oval annotation', () => {
    const a = createAnnotation('oval', 0, 0, 'p1', 0)
    expect(a.type).toBe('oval')
  })

  it('creates line annotation', () => {
    const a = createAnnotation('line', 5, 5, 'p1', 0)
    expect(a.type).toBe('line')
    if (a.type === 'line') {
      expect(a.endX).toBe(5)
      expect(a.endY).toBe(5)
      expect(a.arrowhead).toBe('none')
    }
  })

  it('creates arrow with end arrowhead by default', () => {
    const a = createAnnotation('arrow', 0, 0, 'p1', 0)
    if (a.type === 'arrow') {
      expect(a.arrowhead).toBe('end')
    }
  })

  it('creates text annotation with defaults', () => {
    const a = createAnnotation('text', 0, 0, 'p1', 0)
    if (a.type === 'text') {
      expect(a.content).toBe('Text')
      expect(a.fontFamily).toBe('Arial')
      expect(a.fontSize).toBe(14)
      expect(a.width).toBe(150)
      expect(a.height).toBe(30)
    }
  })

  it('creates freehand annotation', () => {
    const a = createAnnotation('freehand', 10, 20, 'p1', 0)
    if (a.type === 'freehand') {
      expect(a.points).toEqual([{ x: 10, y: 20 }])
      expect(a.color).toBe('#FF3B30')
    }
  })

  it('creates signature annotation', () => {
    const a = createAnnotation('signature', 0, 0, 'p1', 0)
    if (a.type === 'signature') {
      expect(a.points).toEqual([{ x: 0, y: 0 }])
    }
  })

  it('creates highlight with 0.3 opacity', () => {
    const a = createAnnotation('highlight', 0, 0, 'p1', 0)
    if (a.type === 'highlight') {
      expect(a.opacity).toBe(0.3)
    }
  })

  it('creates underline with 1.0 opacity', () => {
    const a = createAnnotation('underline', 0, 0, 'p1', 0)
    if (a.type === 'underline') {
      expect(a.opacity).toBe(1.0)
    }
  })

  it('creates strikethrough', () => {
    const a = createAnnotation('strikethrough', 0, 0, 'p1', 0)
    expect(a.type).toBe('strikethrough')
  })

  it('creates sticky-note', () => {
    const a = createAnnotation('sticky-note', 0, 0, 'p1', 0)
    if (a.type === 'sticky-note') {
      expect(a.content).toBe('')
      expect(a.isExpanded).toBe(false)
    }
  })

  it('creates star with default 5 points', () => {
    const a = createAnnotation('star', 0, 0, 'p1', 0)
    if (a.type === 'star') {
      expect(a.points).toBe(5)
    }
  })

  it('creates polygon with default 6 sides', () => {
    const a = createAnnotation('polygon', 0, 0, 'p1', 0)
    if (a.type === 'polygon') {
      expect(a.sides).toBe(6)
    }
  })

  it('creates speech-balloon', () => {
    const a = createAnnotation('speech-balloon', 0, 0, 'p1', 0)
    if (a.type === 'speech-balloon') {
      expect(a.content).toBe('Text')
      expect(a.tailDirection).toBe('bottom-left')
    }
  })

  it('creates redaction', () => {
    const a = createAnnotation('redaction', 0, 0, 'p1', 0)
    expect(a.type).toBe('redaction')
  })

  it('uses custom defaults', () => {
    const a = createAnnotation('rectangle', 0, 0, 'p1', 0, {
      borderColor: '#FF0000',
      fillColor: '#00FF00',
      borderWidth: 5,
    })
    if (a.type === 'rectangle') {
      expect(a.borderColor).toBe('#FF0000')
      expect(a.fillColor).toBe('#00FF00')
      expect(a.borderWidth).toBe(5)
    }
  })

  it('generates unique ids', () => {
    const a = createAnnotation('rectangle', 0, 0, 'p1', 0)
    const b = createAnnotation('rectangle', 0, 0, 'p1', 0)
    expect(a.id).not.toBe(b.id)
  })
})

describe('getHandles', () => {
  it('returns 8 handles for rectangle', () => {
    const rect: Annotation = {
      id: '1', pageId: 'p1', type: 'rectangle', x: 10, y: 20, width: 100, height: 50,
      zIndex: 0, borderColor: '#000', fillColor: 'none', borderWidth: 2, borderStyle: 'solid',
    }
    const handles = getHandles(rect)
    expect(handles).toHaveLength(8)
    expect(handles.map((h) => h.type)).toEqual(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'])
  })

  it('returns 2 handles for line', () => {
    const line: Annotation = {
      id: '1', pageId: 'p1', type: 'line', x: 0, y: 0, endX: 100, endY: 100,
      zIndex: 0, color: '#000', width: 2, style: 'solid', arrowhead: 'none',
    }
    const handles = getHandles(line)
    expect(handles).toHaveLength(2)
    expect(handles[0].type).toBe('start')
    expect(handles[1].type).toBe('end')
  })

  it('returns empty for freehand', () => {
    const fh: Annotation = {
      id: '1', pageId: 'p1', type: 'freehand', x: 0, y: 0,
      zIndex: 0, points: [{ x: 0, y: 0 }], color: '#000', width: 2,
    }
    expect(getHandles(fh)).toEqual([])
  })

  it('returns empty for sticky-note', () => {
    const sn: Annotation = {
      id: '1', pageId: 'p1', type: 'sticky-note', x: 0, y: 0,
      zIndex: 0, content: '', color: '#ff0', isExpanded: false,
    }
    expect(getHandles(sn)).toEqual([])
  })
})

describe('isPointInAnnotation', () => {
  it('detects point inside rectangle', () => {
    const rect: Annotation = {
      id: '1', pageId: 'p1', type: 'rectangle', x: 10, y: 10, width: 100, height: 50,
      zIndex: 0, borderColor: '#000', fillColor: 'none', borderWidth: 2, borderStyle: 'solid',
    }
    expect(isPointInAnnotation(50, 30, rect)).toBe(true)
  })

  it('detects point outside rectangle', () => {
    const rect: Annotation = {
      id: '1', pageId: 'p1', type: 'rectangle', x: 10, y: 10, width: 100, height: 50,
      zIndex: 0, borderColor: '#000', fillColor: 'none', borderWidth: 2, borderStyle: 'solid',
    }
    expect(isPointInAnnotation(200, 200, rect)).toBe(false)
  })

  it('detects point near line', () => {
    const line: Annotation = {
      id: '1', pageId: 'p1', type: 'line', x: 0, y: 0, endX: 100, endY: 0,
      zIndex: 0, color: '#000', width: 2, style: 'solid', arrowhead: 'none',
    }
    expect(isPointInAnnotation(50, 2, line)).toBe(true)
  })

  it('rejects point far from line', () => {
    const line: Annotation = {
      id: '1', pageId: 'p1', type: 'line', x: 0, y: 0, endX: 100, endY: 0,
      zIndex: 0, color: '#000', width: 2, style: 'solid', arrowhead: 'none',
    }
    expect(isPointInAnnotation(50, 50, line)).toBe(false)
  })

  it('handles zero-length line', () => {
    const line: Annotation = {
      id: '1', pageId: 'p1', type: 'line', x: 50, y: 50, endX: 50, endY: 50,
      zIndex: 0, color: '#000', width: 2, style: 'solid', arrowhead: 'none',
    }
    expect(isPointInAnnotation(50, 50, line)).toBe(true)
    expect(isPointInAnnotation(100, 100, line)).toBe(false)
  })

  it('detects point near freehand', () => {
    const fh: Annotation = {
      id: '1', pageId: 'p1', type: 'freehand', x: 0, y: 0,
      zIndex: 0, points: [{ x: 10, y: 10 }, { x: 20, y: 20 }, { x: 30, y: 30 }], color: '#000', width: 3,
    }
    expect(isPointInAnnotation(20, 20, fh)).toBe(true)
  })

  it('detects point in sticky-note area', () => {
    const sn: Annotation = {
      id: '1', pageId: 'p1', type: 'sticky-note', x: 100, y: 100,
      zIndex: 0, content: '', color: '#ff0', isExpanded: false,
    }
    expect(isPointInAnnotation(110, 110, sn)).toBe(true)
    expect(isPointInAnnotation(200, 200, sn)).toBe(false)
  })
})

describe('clampToPage', () => {
  it('clamps rectangle within page bounds', () => {
    const rect: Annotation = {
      id: '1', pageId: 'p1', type: 'rectangle', x: -10, y: -20, width: 100, height: 50,
      zIndex: 0, borderColor: '#000', fillColor: 'none', borderWidth: 2, borderStyle: 'solid',
    }
    const clamped = clampToPage(rect, 612, 792)
    if (clamped.type === 'rectangle') {
      expect(clamped.x).toBeGreaterThanOrEqual(0)
      expect(clamped.y).toBeGreaterThanOrEqual(0)
    }
  })

  it('clamps line endpoints within page bounds', () => {
    const line: Annotation = {
      id: '1', pageId: 'p1', type: 'line', x: -50, y: -50, endX: 700, endY: 900,
      zIndex: 0, color: '#000', width: 2, style: 'solid', arrowhead: 'none',
    }
    const clamped = clampToPage(line, 612, 792)
    if (clamped.type === 'line') {
      expect(clamped.x).toBeGreaterThanOrEqual(0)
      expect(clamped.y).toBeGreaterThanOrEqual(0)
      expect(clamped.endX).toBeLessThanOrEqual(612)
      expect(clamped.endY).toBeLessThanOrEqual(792)
    }
  })

  it('returns unchanged freehand (no clamping logic)', () => {
    const fh: Annotation = {
      id: '1', pageId: 'p1', type: 'freehand', x: -10, y: -10,
      zIndex: 0, points: [{ x: -10, y: -10 }], color: '#000', width: 2,
    }
    const result = clampToPage(fh)
    expect(result).toBe(fh)
  })
})
