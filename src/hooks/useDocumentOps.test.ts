import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const { mockSaveDocument, mockExportDocument, mockToast, mockSetPrintMode } = vi.hoisted(() => ({
  mockSaveDocument: vi.fn(() => Promise.resolve({ success: true, timestamp: Date.now() })),
  mockExportDocument: vi.fn(() => Promise.resolve({ success: true, filename: 'test_exported.pdf', format: 'pdf', sizeBytes: 1000 })),
  mockToast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
  mockSetPrintMode: vi.fn(),
}))

vi.mock('@/hooks/useAppState', () => ({
  useAppState: vi.fn(() => ({
    filename: 'test.pdf',
    pages: [
      { id: 'p1', sourceId: 's1', sourceFormat: 'pdf', originalIndex: 0, rotation: 0, flipH: false, flipV: false, width: 612, height: 792 },
    ],
    annotations: {},
    documentSessionId: 'session-1',
    format: 'pdf',
    formFields: [],
    setPrintMode: mockSetPrintMode,
  })),
}))

vi.mock('sonner', () => ({ toast: mockToast }))

vi.mock('@/services/documentService', () => ({
  saveDocument: (...args: unknown[]) => mockSaveDocument(...args),
  exportDocument: (...args: unknown[]) => mockExportDocument(...args),
}))

vi.mock('@/services/asyncOperation', () => ({
  isAbortError: (err: unknown) => err instanceof DOMException && (err as DOMException).name === 'AbortError',
}))

import { useAppState } from '@/hooks/useAppState'
import { useDocumentOps } from '@/hooks/useDocumentOps'

describe('useDocumentOps', () => {
  it('returns save, doExport, print functions', () => {
    const { result } = renderHook(() => useDocumentOps())
    expect(typeof result.current.save).toBe('function')
    expect(typeof result.current.doExport).toBe('function')
    expect(typeof result.current.print).toBe('function')
  })

  it('returns saveState and exportState', () => {
    const { result } = renderHook(() => useDocumentOps())
    expect(result.current.saveState).toHaveProperty('isRunning')
    expect(result.current.saveState).toHaveProperty('progress')
    expect(result.current.saveState).toHaveProperty('error')
    expect(result.current.exportState).toHaveProperty('isRunning')
    expect(result.current.exportState).toHaveProperty('cancel')
    expect(result.current.exportState).toHaveProperty('clearError')
  })

  it('save calls saveDocument and shows success toast', async () => {
    mockSaveDocument.mockClear()
    mockToast.success.mockClear()

    const { result } = renderHook(() => useDocumentOps())

    await act(async () => {
      await result.current.save()
    })

    expect(mockSaveDocument).toHaveBeenCalled()
    expect(mockToast.success).toHaveBeenCalledWith('Document saved')
  })

  it('doExport calls exportDocument and shows success toast', async () => {
    mockExportDocument.mockClear()
    mockToast.success.mockClear()

    const { result } = renderHook(() => useDocumentOps())

    await act(async () => {
      await result.current.doExport('pdf', 'flattened')
    })

    expect(mockExportDocument).toHaveBeenCalled()
    expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('Exported'))
  })

  it('doExport returns null when no documentSessionId', async () => {
    mockToast.error.mockClear()
    ;(useAppState as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      filename: 'test.pdf',
      pages: [],
      annotations: {},
      documentSessionId: null,
      format: 'pdf',
      formFields: [],
      setPrintMode: mockSetPrintMode,
    })

    const { result } = renderHook(() => useDocumentOps())

    await act(async () => {
      await result.current.doExport('pdf')
    })

    expect(mockToast.error).toHaveBeenCalledWith('No document session to export')
  })

  it('print sets and unsets print mode', async () => {
    mockSetPrintMode.mockClear()
    vi.stubGlobal('print', vi.fn())

    const { result } = renderHook(() => useDocumentOps())

    await act(async () => {
      await result.current.print()
    })

    expect(mockSetPrintMode).toHaveBeenCalledWith(true)
    expect(mockSetPrintMode).toHaveBeenCalledWith(false)
  })
})
