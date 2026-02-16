// Annotation tool property constants

export interface ColorPreset {
  label: string;
  value: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { label: 'Black', value: '#000000' },
  { label: 'Red', value: '#FF3B30' },
  { label: 'Blue', value: '#007AFF' },
  { label: 'Green', value: '#34C759' },
  { label: 'Yellow', value: '#FFCC00' },
  { label: 'White', value: '#FFFFFF' },
];

export const BORDER_WIDTHS = [1, 2, 3, 5, 8, 10] as const;

export const BORDER_STYLES = ['solid', 'dashed', 'dotted'] as const;
export type BorderStyle = (typeof BORDER_STYLES)[number];

export const ARROWHEAD_OPTIONS = ['none', 'start', 'end', 'both'] as const;
export type ArrowheadOption = (typeof ARROWHEAD_OPTIONS)[number];

export const FONT_FAMILIES = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
] as const;

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72] as const;

export const TEXT_ALIGNMENTS = ['left', 'center', 'right', 'monospace'] as const;
export type TextAlignment = (typeof TEXT_ALIGNMENTS)[number];

// Highlight colors (translucent)
export const HIGHLIGHT_COLORS: ColorPreset[] = [
  { label: 'Yellow', value: '#FFCC00' },
  { label: 'Green', value: '#34C759' },
  { label: 'Blue', value: '#007AFF' },
  { label: 'Pink', value: '#FF2D55' },
  { label: 'Purple', value: '#AF52DE' },
  { label: 'Orange', value: '#FF9500' },
];

// Sticky note colors
export const STICKY_NOTE_COLORS: ColorPreset[] = [
  { label: 'Yellow', value: '#FFCC00' },
  { label: 'Green', value: '#34C759' },
  { label: 'Blue', value: '#007AFF' },
  { label: 'Pink', value: '#FF2D55' },
  { label: 'Purple', value: '#AF52DE' },
  { label: 'Gray', value: '#8E8E93' },
];

// Star points options
export const STAR_POINTS_OPTIONS = [3, 4, 5, 6, 8] as const;

// Polygon sides options
export const POLYGON_SIDES_OPTIONS = [3, 4, 5, 6, 8, 10, 12] as const;
