/**
 * OCR model loader service.
 * Manages ONNX model loading with WebGPU acceleration fallback to WASM.
 * Singleton cache pattern — models loaded lazily on first request.
 */

import type { OcrLanguage } from '@/types/ocr';
import type { InferenceSession } from 'onnxruntime-web';

// Model paths (served from public/models/ocr/)
const MODEL_PATHS = {
  detection: '/models/ocr/det.bin',
  recognition: {
    latin: '/models/ocr/languages/latin/rec.bin',
    eslav: '/models/ocr/languages/eslav/rec.bin',
  },
  dictionary: {
    latin: '/models/ocr/languages/latin/dict.txt',
    eslav: '/models/ocr/languages/eslav/dict.txt',
  },
} as const;

// Singleton cache for loaded models
let detSession: InferenceSession | null = null;
const recSessions = new Map<OcrLanguage, InferenceSession>();
const dictionaries = new Map<OcrLanguage, string[]>();

/** Check if WebGPU is available */
function hasWebGPU(): boolean {
  return 'gpu' in navigator;
}

/** Configure WASM paths so onnxruntime-web finds .wasm files in public/ */
let wasmConfigured = false;

/** Create an ONNX inference session with WebGPU fallback to WASM */
async function createSession(modelPath: string): Promise<InferenceSession> {
  // Dynamic import to enable code splitting
  const ort = await import('onnxruntime-web');

  // Configure WASM paths once — files served from public/ root
  if (!wasmConfigured) {
    // In production, WASM files are in dist/ root (copied from public/)
    // In dev, let onnxruntime-web resolve from node_modules (Vite serves via /@fs/)
    if (import.meta.env.PROD) {
      ort.env.wasm.wasmPaths = '/';
    }
    wasmConfigured = true;
  }

  // Try WebGPU first if available, fall back to WASM
  const providers = hasWebGPU() ? ['webgpu', 'wasm'] : ['wasm'];

  try {
    return await ort.InferenceSession.create(modelPath, {
      executionProviders: providers,
    });
  } catch (err) {
    // If WebGPU fails, retry with WASM only
    if (providers.includes('webgpu')) {
      return await ort.InferenceSession.create(modelPath, {
        executionProviders: ['wasm'],
      });
    }
    throw err;
  }
}

/** Load detection model (shared across languages) */
export async function loadDetectionModel(): Promise<InferenceSession> {
  if (detSession) return detSession;
  detSession = await createSession(MODEL_PATHS.detection);
  return detSession;
}

/** Load recognition model for a specific language */
export async function loadRecognitionModel(lang: OcrLanguage): Promise<InferenceSession> {
  const cached = recSessions.get(lang);
  if (cached) return cached;
  const session = await createSession(MODEL_PATHS.recognition[lang]);
  recSessions.set(lang, session);
  return session;
}

/** Load character dictionary for a specific language */
export async function loadDictionary(lang: OcrLanguage): Promise<string[]> {
  const cached = dictionaries.get(lang);
  if (cached) return cached;
  const resp = await fetch(MODEL_PATHS.dictionary[lang]);
  if (!resp.ok) {
    throw new Error(`Failed to load dictionary for ${lang}: ${resp.statusText}`);
  }
  const text = await resp.text();
  const chars = text.split('\n').filter((line) => line.length > 0);
  dictionaries.set(lang, chars);
  return chars;
}

/** Check if models are loaded for a language */
export function isModelLoaded(lang: OcrLanguage): boolean {
  return detSession !== null && recSessions.has(lang) && dictionaries.has(lang);
}

/** Load all models needed for OCR in a specific language */
export async function ensureModelsLoaded(lang: OcrLanguage): Promise<void> {
  await Promise.all([loadDetectionModel(), loadRecognitionModel(lang), loadDictionary(lang)]);
}

/** Get loaded sessions (throws if not loaded) */
export function getDetectionSession(): InferenceSession {
  if (!detSession) throw new Error('Detection model not loaded. Call ensureModelsLoaded first.');
  return detSession;
}

export function getRecognitionSession(lang: OcrLanguage): InferenceSession {
  const session = recSessions.get(lang);
  if (!session) throw new Error(`Recognition model for ${lang} not loaded.`);
  return session;
}

export function getDictionary(lang: OcrLanguage): string[] {
  const dict = dictionaries.get(lang);
  if (!dict) throw new Error(`Dictionary for ${lang} not loaded.`);
  return dict;
}
