import { describe, expect, it, vi } from 'vitest'

// Mock pdf-lib
const mockPdfDocSave = vi.fn(() => Promise.resolve(new Uint8Array([80, 68, 70])))
const mockDrawRectangle = vi.fn()
const mockDrawLine = vi.fn()
const mockDrawText = vi.fn()
const mockDrawImage = vi.fn()
const mockGetSize = vi.fn(() => ({ width: 612, height: 792 }))
const mockGetPageCount = vi.fn(() => 5)
const mockSetRotation = vi.fn()

const mockCopiedPage = {
  drawRectangle: mockDrawRectangle,
  drawLine: mockDrawLine,
  drawText: mockDrawText,
  drawImage: mockDrawImage,
  getSize: mockGetSize,
  setRotation: mockSetRotation,
}

const mockAddPage = vi.fn(() => mockCopiedPage)

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn(() => Promise.resolve({
      addPage: mockAddPage,
      copyPages: vi.fn(() => Promise.resolve([mockCopiedPage])),
      save: mockPdfDocSave,
      embedPng: vi.fn(() => Promise.resolve({ width: 200, height: 150 })),
      embedJpg: vi.fn(() => Promise.resolve({ width: 200, height: 150 })),
    })),
    load: vi.fn(() => Promise.resolve({
      getPageCount: mockGetPageCount,
      getPage: vi.fn(() => mockCopiedPage),
      getForm: vi.fn(() => ({
        getTextField: vi.fn(() => ({ setText: vi.fn() })),
        getCheckBox: vi.fn(() => ({ check: vi.fn(), uncheck: vi.fn() })),
      })),
      save: mockPdfDocSave,
      addPage: mockAddPage,
      copyPages: vi.fn(() => Promise.resolve([mockCopiedPage])),
      embedPng: vi.fn(() => Promise.resolve({ width: 200, height: 150 })),
      embedJpg: vi.fn(() => Promise.resolve({ width: 200, height: 150 })),
    })),
  },
  rgb: (r: number, g: number, b: number) => ({ r, g, b }),
  LineCapStyle: { Round: 1 },
}))

// Mock pdfBinaryStore
const mockLoadPdfBinary = vi.fn()
vi.mock('@/services/pdfBinaryStore', () => ({
  loadPdfBinary: (...args: unknown[]) => mockLoadPdfBinary(...args),
}))

// Mock annotationExport
vi.mock('@/lib/annotationExport', () => ({
  drawAnnotation: vi.fn(),
}))

import type { ExportOptions } from '@/services/pdfExportService'

import { downloadBlob, exportFlattenedPdf } from '@/services/pdfExportService'

describe('downloadBlob', () => {
  it('creates and clicks a download link', () => {
    const createObjectURL = vi.fn(() => 'blob:test-url')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })

    const clickSpy = vi.fn()
    const appendSpy = vi.fn()
    const removeSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValueOnce({
      set href(v: string) { /* noop */ },
      set download(v: string) { /* noop */ },
      click: clickSpy,
    } as unknown as HTMLAnchorElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation(appendSpy)
    vi.spyOn(document.body, 'removeChild').mockImplementation(removeSpy)

    downloadBlob(new Uint8Array([1, 2, 3]), 'output.pdf', 'application/pdf')

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-url')

    vi.restoreAllMocks()
  })
})

describe('exportFlattenedPdf', () => {
  const basePage = { id: 'p1', originalIndex: 0, sourceId: 's1', sourceFormat: 'pdf' as const, rotation: 0 as const, flipH: false, flipV: false, width: 612, height: 792 }

  it('exports single-source image document as raw binary', async () => {
    const imageData = new Uint8Array([0x89, 0x50]) // PNG header
    mockLoadPdfBinary.mockResolvedValueOnce(imageData)

    const options: ExportOptions = {
      pages: [{ ...basePage, sourceFormat: 'image' }],
      annotations: {},
      documentSessionId: 'session-1',
      filename: 'photo.png',
      format: 'png',
    }

    const result = await exportFlattenedPdf(options)
    expect(result).toBe(imageData)
  })

  it('falls back to session ID for single image', async () => {
    const imageData = new Uint8Array([0xFF, 0xD8]) // JPG header
    mockLoadPdfBinary.mockResolvedValueOnce(null) // sourceId not found
    mockLoadPdfBinary.mockResolvedValueOnce(imageData) // fallback to sessionId

    const options: ExportOptions = {
      pages: [{ ...basePage, sourceFormat: 'image' }],
      annotations: {},
      documentSessionId: 'session-1',
      filename: 'photo.jpg',
      format: 'jpg',
    }

    const result = await exportFlattenedPdf(options)
    expect(result).toBe(imageData)
  })

  it('throws when image binary not found', async () => {
    mockLoadPdfBinary.mockResolvedValue(null)

    const options: ExportOptions = {
      pages: [{ ...basePage, sourceFormat: 'image' }],
      annotations: {},
      documentSessionId: 'session-1',
      filename: 'photo.jpg',
      format: 'jpg',
    }

    await expect(exportFlattenedPdf(options)).rejects.toThrow('Image binary not found')
  })

  it('exports multi-source PDF', async () => {
    const pdfBytes = new Uint8Array([1, 2, 3])
    mockLoadPdfBinary.mockResolvedValue(pdfBytes)

    const options: ExportOptions = {
      pages: [basePage],
      annotations: {},
      documentSessionId: 'session-1',
      filename: 'doc.pdf',
      format: 'pdf',
      flatten: true,
    }

    const result = await exportFlattenedPdf(options)
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('exports with form fields preserved (single source)', async () => {
    const pdfBytes = new Uint8Array([1, 2, 3])
    mockLoadPdfBinary.mockResolvedValue(pdfBytes)

    const options: ExportOptions = {
      pages: [basePage],
      annotations: {},
      documentSessionId: 'session-1',
      filename: 'form.pdf',
      format: 'pdf',
      flatten: false,
      formFields: [
        { id: 'f1', pageId: 'p1', type: 'text', label: 'Name', fieldName: 'name', x: 0, y: 0, width: 100, height: 20, value: 'John' },
        { id: 'f2', pageId: 'p1', type: 'checkbox', label: 'Agree', fieldName: 'agree', x: 0, y: 0, width: 20, height: 20, value: 'true' },
      ],
    }

    const result = await exportFlattenedPdf(options)
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('handles multi-source pages from different sourceIds', async () => {
    const pdfBytes = new Uint8Array([1, 2, 3])
    mockLoadPdfBinary.mockResolvedValue(pdfBytes)

    const options: ExportOptions = {
      pages: [
        basePage,
        { ...basePage, id: 'p2', originalIndex: 0, sourceId: 's2' },
      ],
      annotations: {},
      documentSessionId: 'session-1',
      filename: 'multi.pdf',
      format: 'pdf',
    }

    const result = await exportFlattenedPdf(options)
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('handles image source pages in multi-source export', async () => {
    const imgBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47]) // PNG magic
    mockLoadPdfBinary.mockResolvedValue(imgBytes)

    const options: ExportOptions = {
      pages: [{ ...basePage, sourceFormat: 'image' }],
      annotations: {},
      documentSessionId: 'session-1',
      filename: 'mixed.pdf',
      format: 'pdf',
      flatten: true,
    }

    const result = await exportFlattenedPdf(options)
    expect(result).toBeInstanceOf(Uint8Array)
  })
})
