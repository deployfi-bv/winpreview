import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import type { AnnotationMode, PageRange } from '@/types/dialogs';

export interface PdfOptionsProps {
  annotationMode: AnnotationMode;
  onAnnotationModeChange: (mode: AnnotationMode) => void;
  isMultiSource: boolean;
}

export function PdfOptions({ annotationMode, onAnnotationModeChange, isMultiSource }: PdfOptionsProps) {
  const [pageRange, setPageRange] = useState<PageRange>('all');
  const [customRange, setCustomRange] = useState('');

  return (
    <div className="space-y-4 pt-3">
      <fieldset className="space-y-2">
        <Label>Form Fields / Annotations</Label>
        <RadioGroup
          value={isMultiSource ? 'flattened' : annotationMode}
          onValueChange={(v) => onAnnotationModeChange(v as AnnotationMode)}
          disabled={isMultiSource}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="editable" id="anno-editable" disabled={isMultiSource} />
            <Label htmlFor="anno-editable" className="font-normal">
              Editable (preserve form fields)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="flattened" id="anno-flattened" />
            <Label htmlFor="anno-flattened" className="font-normal">Flattened</Label>
          </div>
        </RadioGroup>
        {isMultiSource && (
          <p className="text-xs text-muted-foreground">
            Form fields will be flattened (multi-source document)
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <Label>Page Range</Label>
        <RadioGroup value={pageRange} onValueChange={(v) => setPageRange(v as PageRange)}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="range-all" />
            <Label htmlFor="range-all" className="font-normal">All pages</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="current" id="range-current" />
            <Label htmlFor="range-current" className="font-normal">Current page</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="custom" id="range-custom" />
            <Label htmlFor="range-custom" className="font-normal">Custom</Label>
          </div>
        </RadioGroup>
        {pageRange === 'custom' && (
          <Input
            placeholder="e.g. 1-3, 5"
            value={customRange}
            onChange={(e) => setCustomRange(e.target.value)}
            className="mt-1"
          />
        )}
      </fieldset>
    </div>
  );
}
