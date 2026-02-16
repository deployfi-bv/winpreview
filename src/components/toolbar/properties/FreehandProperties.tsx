import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { useAppState } from '@/hooks/useAppState';

import { BORDER_WIDTHS } from '@/constants/annotations';

import { isFreehandAnnotation } from '@/types/annotation';

import { ColorPicker } from './ColorPicker';

export function FreehandProperties() {
  const { getSelectedAnnotation, updateAnnotation } = useAppState();
  const selected = getSelectedAnnotation();
  const freehand = selected && isFreehandAnnotation(selected) ? selected : null;

  const strokeColor = freehand?.color ?? '#FF3B30';
  const strokeWidth = String(freehand?.width ?? 3);

  const handleColorChange = (value: string) => {
    if (freehand) updateAnnotation(freehand.id, { color: value });
  };

  const handleWidthChange = (value: string) => {
    if (freehand) updateAnnotation(freehand.id, { width: Number(value) });
  };

  return (
    <>
      <ColorPicker label="Stroke" value={strokeColor} onChange={handleColorChange} />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Select value={strokeWidth} onValueChange={handleWidthChange}>
        <SelectTrigger size="sm" className="h-7 w-[4.5rem]" title="Stroke Width">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BORDER_WIDTHS.map((w) => (
            <SelectItem key={w} value={String(w)}>{w}px</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
