import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockPut = vi.fn(() => Promise.resolve())
const mockGet = vi.fn(() => Promise.resolve(undefined))
const mockDelete = vi.fn(() => Promise.resolve())
const mockClear = vi.fn(() => Promise.resolve())

const mockDB = {
  put: mockPut,
  get: mockGet,
  delete: mockDelete,
  clear: mockClear,
}

vi.mock('@/services/db', () => ({
  getDB: vi.fn(() => Promise.resolve(mockDB)),
}))

import {
  clearAllPdfBinaries,
  clearPdfBinary,
  loadPdfBinary,
  storePdfBinary,
} from '@/services/pdfBinaryStore'

describe('storePdfBinary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stores binary data in IndexedDB', async () => {
    const data = new Uint8Array([1, 2, 3])
    await storePdfBinary('session-1', data, 'test.pdf')
    expect(mockPut).toHaveBeenCalledWith(
      'pdf-binaries',
      expect.objectContaining({
        sessionId: 'session-1',
        data,
        filename: 'test.pdf',
      }),
    )
  })

  it('includes timestamp in record', async () => {
    const before = Date.now()
    await storePdfBinary('s1', new Uint8Array(), 'f.pdf')
    const record = mockPut.mock.calls[0][1]
    expect(record.timestamp).toBeGreaterThanOrEqual(before)
  })
})

describe('loadPdfBinary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns data when record exists', async () => {
    const data = new Uint8Array([1, 2, 3])
    mockGet.mockResolvedValueOnce({ sessionId: 's1', data, filename: 'test.pdf', timestamp: 1 })
    const result = await loadPdfBinary('s1')
    expect(result).toBe(data)
  })

  it('returns null when record does not exist', async () => {
    mockGet.mockResolvedValueOnce(undefined)
    const result = await loadPdfBinary('nonexistent')
    expect(result).toBeNull()
  })

  it('returns null on error', async () => {
    mockGet.mockRejectedValueOnce(new Error('DB error'))
    const result = await loadPdfBinary('s1')
    expect(result).toBeNull()
  })
})

describe('clearPdfBinary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes specific session', async () => {
    await clearPdfBinary('s1')
    expect(mockDelete).toHaveBeenCalledWith('pdf-binaries', 's1')
  })

  it('handles errors gracefully', async () => {
    mockDelete.mockRejectedValueOnce(new Error('fail'))
    await expect(clearPdfBinary('s1')).resolves.toBeUndefined()
  })
})

describe('clearAllPdfBinaries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('clears all records', async () => {
    await clearAllPdfBinaries()
    expect(mockClear).toHaveBeenCalledWith('pdf-binaries')
  })

  it('handles errors gracefully', async () => {
    mockClear.mockRejectedValueOnce(new Error('fail'))
    await expect(clearAllPdfBinaries()).resolves.toBeUndefined()
  })
})
