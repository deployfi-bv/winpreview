import { describe, expect, it } from 'vitest'

import { CHECKPOINT_VERSION } from '@/types/checkpoint'

describe('CHECKPOINT_VERSION', () => {
  it('is 2', () => {
    expect(CHECKPOINT_VERSION).toBe(2)
  })

  it('is a number', () => {
    expect(typeof CHECKPOINT_VERSION).toBe('number')
  })
})
