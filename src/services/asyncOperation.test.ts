import { beforeEach, describe, expect, it } from 'vitest'

import {
  getSimulationConfig,
  isAbortError,
  runAsyncOperation,
  setSimulationConfig,
} from '@/services/asyncOperation'

describe('isAbortError', () => {
  it('returns true for DOMException with AbortError name', () => {
    const err = new DOMException('Operation aborted', 'AbortError')
    expect(isAbortError(err)).toBe(true)
  })

  it('returns false for regular Error', () => {
    expect(isAbortError(new Error('test'))).toBe(false)
  })

  it('returns false for null', () => {
    expect(isAbortError(null)).toBe(false)
  })

  it('returns false for string', () => {
    expect(isAbortError('AbortError')).toBe(false)
  })

  it('returns false for DOMException with other name', () => {
    const err = new DOMException('test', 'NotFoundError')
    expect(isAbortError(err)).toBe(false)
  })
})

describe('setSimulationConfig / getSimulationConfig', () => {
  beforeEach(() => {
    setSimulationConfig({ enabled: false, latencyMs: 0, jitter: 0, failureRate: 0 })
  })

  it('returns current config', () => {
    const config = getSimulationConfig()
    expect(config).toHaveProperty('enabled')
    expect(config).toHaveProperty('latencyMs')
    expect(config).toHaveProperty('jitter')
    expect(config).toHaveProperty('failureRate')
  })

  it('updates config partially', () => {
    setSimulationConfig({ latencyMs: 500 })
    expect(getSimulationConfig().latencyMs).toBe(500)
  })

  it('returns a copy (not a reference)', () => {
    const a = getSimulationConfig()
    const b = getSimulationConfig()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('runAsyncOperation', () => {
  beforeEach(() => {
    setSimulationConfig({ enabled: false, latencyMs: 0, jitter: 0, failureRate: 0 })
  })

  it('executes work function and returns result', async () => {
    const result = await runAsyncOperation(
      { name: 'test' },
      () => Promise.resolve(42),
    )
    expect(result).toBe(42)
  })

  it('calls onProgress callbacks', async () => {
    const progress: number[] = []
    await runAsyncOperation(
      { name: 'test', onProgress: (p) => progress.push(p) },
      () => Promise.resolve('done'),
    )
    expect(progress).toContain(0)
    expect(progress).toContain(50)
    expect(progress).toContain(100)
  })

  it('throws if already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(
      runAsyncOperation(
        { name: 'test', signal: controller.signal },
        () => Promise.resolve(),
      ),
    ).rejects.toThrow('Operation aborted')
  })

  it('propagates work errors', async () => {
    await expect(
      runAsyncOperation(
        { name: 'test' },
        () => { throw new Error('work failed') },
      ),
    ).rejects.toThrow('work failed')
  })

  it('supports synchronous work function', async () => {
    const result = await runAsyncOperation(
      { name: 'test' },
      () => 'sync result',
    )
    expect(result).toBe('sync result')
  })

  it('simulates latency when enabled', async () => {
    setSimulationConfig({ enabled: true, latencyMs: 50, jitter: 0, failureRate: 0 })
    const start = Date.now()
    await runAsyncOperation({ name: 'test' }, () => 'ok')
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(40)
  })

  it('can be aborted during simulation latency', async () => {
    setSimulationConfig({ enabled: true, latencyMs: 5000, jitter: 0, failureRate: 0 })
    const controller = new AbortController()
    const promise = runAsyncOperation(
      { name: 'test', signal: controller.signal },
      () => 'should not reach',
    )
    // Abort after a brief delay
    setTimeout(() => controller.abort(), 50)
    await expect(promise).rejects.toThrow()
  })

  it('simulates failure when configured', async () => {
    setSimulationConfig({ enabled: true, latencyMs: 0, jitter: 0, failureRate: 1.0 })
    // With 100% failure rate, should always throw
    await expect(
      runAsyncOperation({ name: 'test' }, () => 'ok'),
    ).rejects.toThrow('Simulated transient failure')
  })

  it('works without onProgress', async () => {
    const result = await runAsyncOperation(
      { name: 'test' },
      () => 'no progress',
    )
    expect(result).toBe('no progress')
  })
})
