import type { DpiOption } from '@/types/dialogs';

export const DPI_OPTIONS: DpiOption[] = [
  { label: '72 DPI (Screen)', value: 72 },
  { label: '150 DPI (Draft)', value: 150 },
  { label: '300 DPI (Print)', value: 300 },
  { label: '600 DPI (High Quality)', value: 600 },
];

export const JPEG_QUALITY_DEFAULT = 85;
export const JPEG_QUALITY_MIN = 1;
export const JPEG_QUALITY_MAX = 100;

export const UNIT_OPTIONS = [
  { label: 'Pixels', value: 'px' },
  { label: 'Percent', value: 'percent' },
  { label: 'Inches', value: 'in' },
  { label: 'Centimeters', value: 'cm' },
] as const;

export const DEFAULT_IMAGE_WIDTH = 1920;
export const DEFAULT_IMAGE_HEIGHT = 1080;
export const DEFAULT_DPI = 300;
