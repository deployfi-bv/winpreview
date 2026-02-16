// Dialog-specific types

export type ExportFormat = 'pdf' | 'jpeg' | 'png';

export type AnnotationMode = 'editable' | 'flattened';

export type PageRange = 'all' | 'current' | 'custom';

export type SizeUnit = 'px' | 'percent' | 'in' | 'cm';

export interface DpiOption {
  label: string;
  value: number;
}
