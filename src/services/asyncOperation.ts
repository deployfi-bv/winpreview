/**
 * Async operation framework with AbortController, latency simulation,
 * and transient failure injection for dev-mode testing.
 */

export interface AsyncOperationConfig {
  /** Operation name (for logs/toasts) */
  name: string;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
  /** Progress callback (0–100) */
  onProgress?: (percent: number) => void;
}

export interface SimulationConfig {
  /** Enable simulation mode */
  enabled: boolean;
  /** Base latency in ms */
  latencyMs: number;
  /** Random jitter added to latency (0–1 multiplier of latencyMs) */
  jitter: number;
  /** Probability of transient failure (0–1) */
  failureRate: number;
}

const DEFAULT_SIMULATION: SimulationConfig = {
  enabled: import.meta.env.DEV,
  latencyMs: 800,
  jitter: 0.5,
  failureRate: 0.1,
};

let simulationConfig: SimulationConfig = { ...DEFAULT_SIMULATION };

/** Update simulation settings (dev mode only). */
export function setSimulationConfig(config: Partial<SimulationConfig>): void {
  simulationConfig = { ...simulationConfig, ...config };
}

/** Get current simulation config. */
export function getSimulationConfig(): SimulationConfig {
  return { ...simulationConfig };
}

/** Simulate latency + jitter. Respects abort signal. */
async function simulateLatency(signal?: AbortSignal): Promise<void> {
  if (!simulationConfig.enabled) return;
  const jitterAmount = simulationConfig.latencyMs * simulationConfig.jitter * Math.random();
  const totalDelay = simulationConfig.latencyMs + jitterAmount;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, totalDelay);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Operation aborted', 'AbortError'));
    }, { once: true });
  });
}

/** Simulate transient failure. */
function maybeThrowFailure(): void {
  if (!simulationConfig.enabled) return;
  if (Math.random() < simulationConfig.failureRate) {
    throw new Error('Simulated transient failure');
  }
}

/** Check if an error is an AbortError. */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/**
 * Run an async operation with simulation, progress reporting, and cancellation.
 *
 * The `work` callback receives the config and should do the actual work.
 * Simulation (latency + failure) happens before `work` is called.
 */
export async function runAsyncOperation<T>(
  config: AsyncOperationConfig,
  work: () => Promise<T> | T,
): Promise<T> {
  // Check if already aborted
  if (config.signal?.aborted) {
    throw new DOMException('Operation aborted', 'AbortError');
  }

  // Simulate progress ticks
  if (config.onProgress) {
    config.onProgress(0);
  }

  // Phase 1: simulate latency (represents I/O or processing time)
  await simulateLatency(config.signal);

  if (config.onProgress) {
    config.onProgress(50);
  }

  // Phase 2: simulate failure
  maybeThrowFailure();

  // Phase 3: do actual work
  const result = await work();

  if (config.onProgress) {
    config.onProgress(100);
  }

  return result;
}

// Expose to dev console
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__setSimulation = setSimulationConfig;
  (window as unknown as Record<string, unknown>).__getSimulation = getSimulationConfig;
}
