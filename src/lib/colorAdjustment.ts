// Builds CSS filter string from color adjustment values

import type { ColorAdjustment } from '@/types/app';

export function buildCssFilter(adj: ColorAdjustment): string {
  const filters: string[] = [];

  // exposure → brightness (0 = 100%, range -100..+100 maps to 0%..200%)
  if (adj.exposure !== 0) {
    filters.push(`brightness(${100 + adj.exposure}%)`);
  }

  // contrast (0 = 100%, range -100..+100 maps to 0%..200%)
  if (adj.contrast !== 0) {
    filters.push(`contrast(${100 + adj.contrast}%)`);
  }

  // saturation (0 = 100%, range -100..+100 maps to 0%..200%)
  if (adj.saturation !== 0) {
    filters.push(`saturate(${100 + adj.saturation}%)`);
  }

  // temperature → hue-rotate (range -100..+100 maps to -30deg..+30deg)
  if (adj.temperature !== 0) {
    filters.push(`hue-rotate(${adj.temperature * 0.3}deg)`);
  }

  // sepia (range 0..100 maps to 0%..100%)
  if (adj.sepia !== 0) {
    filters.push(`sepia(${adj.sepia}%)`);
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
}

export const DEFAULT_COLOR_ADJUSTMENT: ColorAdjustment = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  sharpness: 0,
  sepia: 0,
};

export interface AdjustmentSliderConfig {
  key: keyof ColorAdjustment;
  label: string;
  min: number;
  max: number;
  step: number;
}

export const ADJUSTMENT_SLIDERS: AdjustmentSliderConfig[] = [
  { key: 'exposure', label: 'Exposure', min: -100, max: 100, step: 1 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1 },
  { key: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1 },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100, step: 1 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1 },
  { key: 'temperature', label: 'Temperature', min: -100, max: 100, step: 1 },
  { key: 'tint', label: 'Tint', min: -100, max: 100, step: 1 },
  { key: 'sharpness', label: 'Sharpness', min: 0, max: 100, step: 1 },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1 },
];
