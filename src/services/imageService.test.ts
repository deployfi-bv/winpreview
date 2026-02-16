import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearImage,
  getCurrentImageUrl,
  getImageUrl,
  getMimeType,
  setCurrentImageUrl,
  setImageUrl,
} from '@/services/imageService'

// Mock URL.revokeObjectURL since jsdom may not track it
const revokeObjectURL = vi.fn()
vi.stubGlobal('URL', { ...URL, revokeObjectURL, createObjectURL: vi.fn(() => 'blob:mock') })

describe('getMimeType', () => {
  it('returns image/jpeg for jpg', () => expect(getMimeType('jpg')).toBe('image/jpeg'))
  it('returns image/jpeg for jpeg', () => expect(getMimeType('jpeg')).toBe('image/jpeg'))
  it('returns image/png for png', () => expect(getMimeType('png')).toBe('image/png'))
  it('returns image/gif for gif', () => expect(getMimeType('gif')).toBe('image/gif'))
  it('returns image/bmp for bmp', () => expect(getMimeType('bmp')).toBe('image/bmp'))
  it('returns image/tiff for tiff', () => expect(getMimeType('tiff')).toBe('image/tiff'))
  it('returns image/tiff for tif', () => expect(getMimeType('tif')).toBe('image/tiff'))
  it('returns image/webp for webp', () => expect(getMimeType('webp')).toBe('image/webp'))
  it('defaults to image/png for unknown', () => expect(getMimeType('xyz')).toBe('image/png'))
  it('is case insensitive', () => expect(getMimeType('JPG')).toBe('image/jpeg'))
})

describe('image cache (setImageUrl / getImageUrl / clearImage)', () => {
  beforeEach(() => {
    clearImage()
    revokeObjectURL.mockClear()
  })

  afterEach(() => {
    clearImage()
  })

  it('returns null for unknown sourceId', () => {
    expect(getImageUrl('nonexistent')).toBeNull()
  })

  it('stores and retrieves image URL', () => {
    setImageUrl('src-1', 'blob:test-url-1')
    expect(getImageUrl('src-1')).toBe('blob:test-url-1')
  })

  it('overwrites existing URL and revokes old one', () => {
    setImageUrl('src-1', 'blob:old')
    setImageUrl('src-1', 'blob:new')
    expect(getImageUrl('src-1')).toBe('blob:new')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:old')
  })

  it('clears specific sourceId', () => {
    setImageUrl('src-1', 'blob:1')
    setImageUrl('src-2', 'blob:2')
    clearImage('src-1')
    expect(getImageUrl('src-1')).toBeNull()
    expect(getImageUrl('src-2')).toBe('blob:2')
  })

  it('clears all images when no sourceId given', () => {
    setImageUrl('src-1', 'blob:1')
    setImageUrl('src-2', 'blob:2')
    clearImage()
    expect(getImageUrl('src-1')).toBeNull()
    expect(getImageUrl('src-2')).toBeNull()
  })

  it('revokes URL when clearing', () => {
    setImageUrl('src-1', 'blob:to-revoke')
    clearImage('src-1')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:to-revoke')
  })

  it('clearImage with nonexistent sourceId does nothing', () => {
    clearImage('nonexistent')
    // Should not throw
  })
})

describe('legacy compat aliases', () => {
  beforeEach(() => clearImage())
  afterEach(() => clearImage())

  it('getCurrentImageUrl returns null when empty', () => {
    expect(getCurrentImageUrl()).toBeNull()
  })

  it('getCurrentImageUrl returns first image URL', () => {
    setImageUrl('src-1', 'blob:first')
    expect(getCurrentImageUrl()).toBe('blob:first')
  })

  it('setCurrentImageUrl with null clears images', () => {
    setImageUrl('src-1', 'blob:test')
    setCurrentImageUrl(null)
    expect(getCurrentImageUrl()).toBeNull()
  })
})
