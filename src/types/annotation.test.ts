import { describe, expect, it } from 'vitest'

import {
  hasBoundingBox,
  isFreehandAnnotation,
  isLineAnnotation,
  isPolygonAnnotation,
  isRedactionAnnotation,
  isShapeAnnotation,
  isSignatureAnnotation,
  isSpeechBalloonAnnotation,
  isStarAnnotation,
  isStickyNoteAnnotation,
  isTextAnnotation,
  isTextMarkupAnnotation,
} from '@/types/annotation'

import type { Annotation } from '@/types/annotation'

const base = { id: '1', pageId: 'p1', x: 0, y: 0, zIndex: 0 }

const rect: Annotation = { ...base, type: 'rectangle', width: 100, height: 50, borderColor: '#000', fillColor: 'none', borderWidth: 2, borderStyle: 'solid' }
const oval: Annotation = { ...base, type: 'oval', width: 100, height: 50, borderColor: '#000', fillColor: 'none', borderWidth: 2, borderStyle: 'solid' }
const line: Annotation = { ...base, type: 'line', endX: 100, endY: 100, color: '#000', width: 2, style: 'solid', arrowhead: 'none' }
const arrow: Annotation = { ...base, type: 'arrow', endX: 100, endY: 100, color: '#000', width: 2, style: 'solid', arrowhead: 'end' }
const text: Annotation = { ...base, type: 'text', width: 150, height: 30, content: 'Hello', fontFamily: 'Arial', fontSize: 14, color: '#000', bold: false, italic: false, alignment: 'left' }
const freehand: Annotation = { ...base, type: 'freehand', points: [{ x: 0, y: 0 }], color: '#f00', width: 3 }
const signature: Annotation = { ...base, type: 'signature', points: [{ x: 0, y: 0 }], color: '#000', width: 2 }
const highlight: Annotation = { ...base, type: 'highlight', width: 100, height: 20, color: '#ff0', opacity: 0.3 }
const underline: Annotation = { ...base, type: 'underline', width: 100, height: 20, color: '#ff0', opacity: 1.0 }
const strikethrough: Annotation = { ...base, type: 'strikethrough', width: 100, height: 20, color: '#ff0', opacity: 1.0 }
const stickyNote: Annotation = { ...base, type: 'sticky-note', content: '', color: '#ff0', isExpanded: false }
const star: Annotation = { ...base, type: 'star', width: 50, height: 50, points: 5, borderColor: '#000', fillColor: '#ff0', borderWidth: 2, borderStyle: 'solid' }
const polygon: Annotation = { ...base, type: 'polygon', width: 50, height: 50, sides: 6, borderColor: '#000', fillColor: 'none', borderWidth: 2, borderStyle: 'solid' }
const speechBalloon: Annotation = { ...base, type: 'speech-balloon', width: 120, height: 80, content: 'Hi', tailDirection: 'bottom-left', borderColor: '#000', fillColor: '#fff', borderWidth: 2, fontSize: 14 }
const redaction: Annotation = { ...base, type: 'redaction', width: 100, height: 20 }

describe('isShapeAnnotation', () => {
  it('returns true for rectangle', () => expect(isShapeAnnotation(rect)).toBe(true))
  it('returns true for oval', () => expect(isShapeAnnotation(oval)).toBe(true))
  it('returns false for line', () => expect(isShapeAnnotation(line)).toBe(false))
  it('returns false for text', () => expect(isShapeAnnotation(text)).toBe(false))
  it('returns false for freehand', () => expect(isShapeAnnotation(freehand)).toBe(false))
})

describe('isLineAnnotation', () => {
  it('returns true for line', () => expect(isLineAnnotation(line)).toBe(true))
  it('returns true for arrow', () => expect(isLineAnnotation(arrow)).toBe(true))
  it('returns false for rectangle', () => expect(isLineAnnotation(rect)).toBe(false))
  it('returns false for text', () => expect(isLineAnnotation(text)).toBe(false))
})

describe('isTextAnnotation', () => {
  it('returns true for text', () => expect(isTextAnnotation(text)).toBe(true))
  it('returns false for rectangle', () => expect(isTextAnnotation(rect)).toBe(false))
})

describe('isFreehandAnnotation', () => {
  it('returns true for freehand', () => expect(isFreehandAnnotation(freehand)).toBe(true))
  it('returns false for signature', () => expect(isFreehandAnnotation(signature)).toBe(false))
})

describe('isSignatureAnnotation', () => {
  it('returns true for signature', () => expect(isSignatureAnnotation(signature)).toBe(true))
  it('returns false for freehand', () => expect(isSignatureAnnotation(freehand)).toBe(false))
})

describe('isTextMarkupAnnotation', () => {
  it('returns true for highlight', () => expect(isTextMarkupAnnotation(highlight)).toBe(true))
  it('returns true for underline', () => expect(isTextMarkupAnnotation(underline)).toBe(true))
  it('returns true for strikethrough', () => expect(isTextMarkupAnnotation(strikethrough)).toBe(true))
  it('returns false for text', () => expect(isTextMarkupAnnotation(text)).toBe(false))
})

describe('isStickyNoteAnnotation', () => {
  it('returns true for sticky-note', () => expect(isStickyNoteAnnotation(stickyNote)).toBe(true))
  it('returns false for text', () => expect(isStickyNoteAnnotation(text)).toBe(false))
})

describe('isStarAnnotation', () => {
  it('returns true for star', () => expect(isStarAnnotation(star)).toBe(true))
  it('returns false for polygon', () => expect(isStarAnnotation(polygon)).toBe(false))
})

describe('isPolygonAnnotation', () => {
  it('returns true for polygon', () => expect(isPolygonAnnotation(polygon)).toBe(true))
  it('returns false for star', () => expect(isPolygonAnnotation(star)).toBe(false))
})

describe('isSpeechBalloonAnnotation', () => {
  it('returns true for speech-balloon', () => expect(isSpeechBalloonAnnotation(speechBalloon)).toBe(true))
  it('returns false for rectangle', () => expect(isSpeechBalloonAnnotation(rect)).toBe(false))
})

describe('isRedactionAnnotation', () => {
  it('returns true for redaction', () => expect(isRedactionAnnotation(redaction)).toBe(true))
  it('returns false for rectangle', () => expect(isRedactionAnnotation(rect)).toBe(false))
})

describe('hasBoundingBox', () => {
  it('returns true for rectangle', () => expect(hasBoundingBox(rect)).toBe(true))
  it('returns true for oval', () => expect(hasBoundingBox(oval)).toBe(true))
  it('returns true for text', () => expect(hasBoundingBox(text)).toBe(true))
  it('returns true for highlight', () => expect(hasBoundingBox(highlight)).toBe(true))
  it('returns true for star', () => expect(hasBoundingBox(star)).toBe(true))
  it('returns true for polygon', () => expect(hasBoundingBox(polygon)).toBe(true))
  it('returns true for speech-balloon', () => expect(hasBoundingBox(speechBalloon)).toBe(true))
  it('returns true for redaction', () => expect(hasBoundingBox(redaction)).toBe(true))
  it('returns false for line', () => expect(hasBoundingBox(line)).toBe(false))
  it('returns false for arrow', () => expect(hasBoundingBox(arrow)).toBe(false))
  it('returns false for freehand', () => expect(hasBoundingBox(freehand)).toBe(false))
  it('returns false for signature', () => expect(hasBoundingBox(signature)).toBe(false))
  it('returns false for sticky-note', () => expect(hasBoundingBox(stickyNote)).toBe(false))
})
