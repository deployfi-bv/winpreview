/**
 * Hook for managing async operation UI state: loading, error, progress, cancel.
 *
 * Provides a `run` function that wraps any async operation with:
 * - AbortController for cancellation
 * - Progress tracking (0–100)
 * - Error state with retry support
 * - Stale-result prevention (late results after cancel are ignored)
 */

import { useCallback,useRef, useState } from 'react';

import { isAbortError } from '@/services/asyncOperation';

export interface OperationState {
  isRunning: boolean;
  progress: number;
  error: string | null;
}

export function useAsyncOperation() {
  const [opState, setOpState] = useState<OperationState>({
    isRunning: false,
    progress: 0,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);

  /** Cancel the current in-flight operation. */
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setOpState({ isRunning: false, progress: 0, error: null });
  }, []);

  /** Run an async operation with cancellation and progress tracking. */
  const run = useCallback(async <T>(
    operation: (signal: AbortSignal, onProgress: (pct: number) => void) => Promise<T>,
  ): Promise<T | null> => {
    // Cancel any previous operation
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    const generation = ++generationRef.current;

    setOpState({ isRunning: true, progress: 0, error: null });

    try {
      const result = await operation(
        controller.signal,
        (pct) => {
          // Ignore stale progress updates
          if (generationRef.current !== generation) return;
          setOpState((prev) => ({ ...prev, progress: pct }));
        },
      );

      // Ignore stale results
      if (generationRef.current !== generation) return null;

      setOpState({ isRunning: false, progress: 100, error: null });
      return result;
    } catch (err) {
      // Ignore stale errors
      if (generationRef.current !== generation) return null;

      if (isAbortError(err)) {
        setOpState({ isRunning: false, progress: 0, error: null });
        return null;
      }

      const message = err instanceof Error ? err.message : 'Unknown error';
      setOpState({ isRunning: false, progress: 0, error: message });
      return null;
    }
  }, []);

  /** Clear error state (e.g. before retry). */
  const clearError = useCallback(() => {
    setOpState((prev) => ({ ...prev, error: null }));
  }, []);

  return { ...opState, run, cancel, clearError };
}
