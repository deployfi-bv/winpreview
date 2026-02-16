import { describe, expect, it, vi } from 'vitest'

import { saveDocument } from '@/services/documentService'

vi.mock('@/services/pdfExportService', () => ({
  exportFlattenedPdf: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
  downloadBlob: vi.fn(),
}))

describe('saveDocument', () => {
  it('returns success with timestamp', async () => {
    const before = Date.now()
    const result = await saveDocument()
    const after = Date.now()
    expect(result.success).toBe(true)
    expect(result.timestamp).toBeGreaterThanOrEqual(before)
    expect(result.timestamp).toBeLessThanOrEqual(after)
  })
})
