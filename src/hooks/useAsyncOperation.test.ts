import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useAsyncOperation } from '@/hooks/useAsyncOperation'

describe('useAsyncOperation', () => {
  it('starts with default state', () => {
    const { result } = renderHook(() => useAsyncOperation())
    expect(result.current.isRunning).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('sets isRunning during operation', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    let resolveWork: (v: string) => void
    const workPromise = new Promise<string>((r) => { resolveWork = r })

    let runPromise: Promise<unknown>
    act(() => {
      runPromise = result.current.run(async () => workPromise)
    })

    // Should be running
    expect(result.current.isRunning).toBe(true)

    // Complete the work
    await act(async () => {
      resolveWork!('done')
      await runPromise!
    })

    expect(result.current.isRunning).toBe(false)
  })

  it('returns result from operation', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    let returnValue: string | null = null
    await act(async () => {
      returnValue = await result.current.run(async () => 'hello')
    })

    expect(returnValue).toBe('hello')
    expect(result.current.progress).toBe(100)
  })

  it('sets error on failure', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    await act(async () => {
      await result.current.run(async () => {
        throw new Error('test error')
      })
    })

    expect(result.current.isRunning).toBe(false)
    expect(result.current.error).toBe('test error')
  })

  it('clearError resets error', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    await act(async () => {
      await result.current.run(async () => {
        throw new Error('fail')
      })
    })

    expect(result.current.error).toBe('fail')

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('cancel aborts and resets state', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    let resolveWork: () => void
    const workPromise = new Promise<void>((r) => { resolveWork = r })

    act(() => {
      result.current.run(async () => workPromise)
    })

    act(() => {
      result.current.cancel()
    })

    expect(result.current.isRunning).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBeNull()

    // Cleanup
    resolveWork!()
  })

  it('handles AbortError gracefully', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    await act(async () => {
      await result.current.run(async () => {
        throw new DOMException('aborted', 'AbortError')
      })
    })

    expect(result.current.isRunning).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('reports progress via callback', async () => {
    const { result } = renderHook(() => useAsyncOperation())
    await act(async () => {
      await result.current.run(async (_signal, onProgress) => {
        onProgress(25)
        onProgress(50)
        onProgress(75)
        return 'done'
      })
    })

    // Final state should show 100 after completion
    expect(result.current.progress).toBe(100)
  })

  it('handles unknown error type', async () => {
    const { result } = renderHook(() => useAsyncOperation())

    await act(async () => {
      await result.current.run(async () => {
        throw 'string error'
      })
    })

    expect(result.current.error).toBe('Unknown error')
  })
})
