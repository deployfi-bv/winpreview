import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock IndexedDB interaction via getDB
const mockPut = vi.fn(() => Promise.resolve())
const mockDelete = vi.fn(() => Promise.resolve())
const mockGetAllKeys = vi.fn(() => Promise.resolve([]))
const mockOpenCursor = vi.fn(() => Promise.resolve(null))

const mockIndex = {
  getAllKeys: mockGetAllKeys,
  openCursor: mockOpenCursor,
}

const mockStore = {
  put: mockPut,
  delete: mockDelete,
  index: vi.fn(() => mockIndex),
}

const mockTx = {
  objectStore: vi.fn(() => mockStore),
  objectStoreNames: ['checkpoints'],
  store: { index: vi.fn(() => mockIndex) },
  done: Promise.resolve(),
}

const mockDB = {
  transaction: vi.fn(() => mockTx),
  clear: vi.fn(() => Promise.resolve()),
}

vi.mock('@/services/db', () => ({
  getDB: vi.fn(() => Promise.resolve(mockDB)),
}))

import {
  clearAllCheckpoints,
  loadLatestCheckpoint,
  loadPreviousCheckpoint,
  saveCheckpoint,
} from '@/services/persistence'

const sampleCheckpoint = {
  documentSessionId: 'session-1',
  filename: 'test.pdf',
  format: 'pdf',
  pages: [{ id: 'p1', originalIndex: 0, sourceId: 's1', sourceFormat: 'pdf' as const, rotation: 0 as const, flipH: false, flipV: false, width: 612, height: 792 }],
  currentPageIndex: 0,
  annotations: {},
  colorAdjustment: { exposure: 0, contrast: 0, highlights: 0, shadows: 0, saturation: 0, temperature: 0, tint: 0, sharpness: 0, sepia: 0 },
  formFields: [],
  isFormMode: false,
  zoom: 1.0,
}

describe('saveCheckpoint', () => {
  beforeEach(() => vi.clearAllMocks())

  it('saves checkpoint with generated id, version, and timestamp', async () => {
    mockGetAllKeys.mockResolvedValueOnce([])
    await saveCheckpoint(sampleCheckpoint)
    expect(mockPut).toHaveBeenCalledOnce()
    const saved = mockPut.mock.calls[0][0]
    expect(saved.id).toMatch(/^cp-/)
    expect(saved.version).toBe(2)
    expect(saved.timestamp).toBeGreaterThan(0)
    expect(saved.filename).toBe('test.pdf')
  })

  it('prunes old checkpoints beyond max', async () => {
    mockGetAllKeys.mockResolvedValueOnce(['old-1', 'old-2', 'new-1'])
    await saveCheckpoint(sampleCheckpoint)
    expect(mockDelete).toHaveBeenCalledWith('old-1')
  })

  it('does not prune when within limit', async () => {
    mockGetAllKeys.mockResolvedValueOnce(['new-1'])
    await saveCheckpoint(sampleCheckpoint)
    expect(mockDelete).not.toHaveBeenCalled()
  })
})

describe('loadLatestCheckpoint', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when no checkpoints', async () => {
    mockOpenCursor.mockResolvedValueOnce(null)
    const result = await loadLatestCheckpoint()
    expect(result).toBeNull()
  })

  it('returns checkpoint when valid', async () => {
    const checkpoint = { ...sampleCheckpoint, id: 'cp-1', version: 2, timestamp: Date.now() }
    mockOpenCursor.mockResolvedValueOnce({ value: checkpoint })
    const result = await loadLatestCheckpoint()
    expect(result).toEqual(checkpoint)
  })

  it('returns null for version mismatch', async () => {
    const checkpoint = { ...sampleCheckpoint, id: 'cp-1', version: 99, timestamp: Date.now() }
    mockOpenCursor.mockResolvedValueOnce({ value: checkpoint })
    const result = await loadLatestCheckpoint()
    expect(result).toBeNull()
  })

  it('returns null on error', async () => {
    mockDB.transaction.mockImplementationOnce(() => { throw new Error('DB crash') })
    const result = await loadLatestCheckpoint()
    expect(result).toBeNull()
  })
})

describe('loadPreviousCheckpoint', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when no checkpoints', async () => {
    mockOpenCursor.mockResolvedValueOnce(null)
    const result = await loadPreviousCheckpoint()
    expect(result).toBeNull()
  })

  it('returns null when only one checkpoint', async () => {
    mockOpenCursor.mockResolvedValueOnce({
      continue: vi.fn(() => Promise.resolve(null)),
      value: { version: 2 },
    })
    const result = await loadPreviousCheckpoint()
    expect(result).toBeNull()
  })

  it('returns second checkpoint when valid', async () => {
    const second = { ...sampleCheckpoint, id: 'cp-2', version: 2, timestamp: Date.now() - 1000 }
    mockOpenCursor.mockResolvedValueOnce({
      continue: vi.fn(() => Promise.resolve({ value: second })),
      value: { version: 2 },
    })
    const result = await loadPreviousCheckpoint()
    expect(result).toEqual(second)
  })

  it('returns null on error', async () => {
    mockDB.transaction.mockImplementationOnce(() => { throw new Error('DB crash') })
    const result = await loadPreviousCheckpoint()
    expect(result).toBeNull()
  })
})

describe('clearAllCheckpoints', () => {
  beforeEach(() => vi.clearAllMocks())

  it('clears the checkpoints store', async () => {
    await clearAllCheckpoints()
    expect(mockDB.clear).toHaveBeenCalledWith('checkpoints')
  })

  it('handles errors gracefully', async () => {
    mockDB.clear.mockRejectedValueOnce(new Error('fail'))
    await expect(clearAllCheckpoints()).resolves.toBeUndefined()
  })
})
