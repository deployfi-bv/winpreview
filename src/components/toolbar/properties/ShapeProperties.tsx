import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useAppState } from '@/hooks/useAppState';

import { BORDER_STYLES,BORDER_WIDTHS } from '@/constants/annotations';

import { isShapeAnnotation } from '@/types/annotation';

import { ColorPicker } from './ColorPicker';

import type { BorderStyle } from '@/constants/annotations';

export function ShapeProperties() {
  const { getSelectedAnnotation, updateAnnotation } = useAppState();
  const selected = getSelectedAnnotation();
  const shape = selected && isShapeAnnotation(selected) ? selected : null;

  const borderColor = shape?.borderColor ?? '#000000';
  const fillColor = shape?.fillColor ?? 'none';
  const borderWidth = String(shape?.borderWidth ?? 2);
  const borderStyle: BorderStyle = shape?.borderStyle ?? 'solid';

  const handleBorderColorChange = (value: string) => {
    if (shape) updateAnnotation(shape.id, { borderColor: value });
  };

  const handleFillColorChange = (value: string) => {
    if (shape) updateAnnotation(shape.id, { fillColor: value });
  };

  const handleWidthChange = (value: string) => {
    if (shape) updateAnnotation(shape.id, { borderWidth: Number(value) });
  };

  const handleStyleChange = (value: string) => {
    if (value && shape) updateAnnotation(shape.id, { borderStyle: value as BorderStyle });
  };

  return (
    <>
      <ColorPicker label="Border" value={borderColor} onChange={handleBorderColorChange} />
      <ColorPicker label="Fill" value={fillColor} onChange={handleFillColorChange} allowNoFill />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Select value={borderWidth} onValueChange={handleWidthChange}>
        <SelectTrigger size="sm" className="h-7 w-[4.5rem]" title="Border Width">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BORDER_WIDTHS.map((w) => (
            <SelectItem key={w} value={String(w)}>{w}px</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ToggleGroup type="single" variant="outline" size="sm" value={borderStyle} onValueChange={handleStyleChange}>
        {BORDER_STYLES.map((style) => (
          <ToggleGroupItem key={style} value={style} className="h-7 px-2 text-xs" title={style}>
            {style}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </>
  );
}
