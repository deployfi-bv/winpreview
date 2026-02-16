import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useAppState } from '@/hooks/useAppState';

import { ARROWHEAD_OPTIONS,BORDER_STYLES, BORDER_WIDTHS } from '@/constants/annotations';

import { isLineAnnotation } from '@/types/annotation';

import { ColorPicker } from './ColorPicker';

import type { ArrowheadOption,BorderStyle } from '@/constants/annotations';

interface LinePropertiesProps {
  showArrowheads?: boolean;
}

export function LineProperties({ showArrowheads }: LinePropertiesProps) {
  const { getSelectedAnnotation, updateAnnotation } = useAppState();
  const selected = getSelectedAnnotation();
  const line = selected && isLineAnnotation(selected) ? selected : null;

  const color = line?.color ?? '#000000';
  const width = String(line?.width ?? 2);
  const style: BorderStyle = line?.style ?? 'solid';
  const arrowhead: ArrowheadOption = line?.arrowhead ?? (showArrowheads ? 'end' : 'none');

  const handleColorChange = (value: string) => {
    if (line) updateAnnotation(line.id, { color: value });
  };

  const handleWidthChange = (value: string) => {
    if (line) updateAnnotation(line.id, { width: Number(value) });
  };

  const handleStyleChange = (value: string) => {
    if (value && line) updateAnnotation(line.id, { style: value as BorderStyle });
  };

  const handleArrowheadChange = (value: string) => {
    if (value && line) updateAnnotation(line.id, { arrowhead: value as ArrowheadOption });
  };

  return (
    <>
      <ColorPicker label="Color" value={color} onChange={handleColorChange} />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Select value={width} onValueChange={handleWidthChange}>
        <SelectTrigger size="sm" className="h-7 w-[4.5rem]" title="Line Width">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BORDER_WIDTHS.map((w) => (
            <SelectItem key={w} value={String(w)}>{w}px</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ToggleGroup type="single" variant="outline" size="sm" value={style} onValueChange={handleStyleChange}>
        {BORDER_STYLES.map((s) => (
          <ToggleGroupItem key={s} value={s} className="h-7 px-2 text-xs" title={s}>
            {s}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {showArrowheads && (
        <>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToggleGroup type="single" variant="outline" size="sm" value={arrowhead} onValueChange={handleArrowheadChange}>
            {ARROWHEAD_OPTIONS.map((opt) => (
              <ToggleGroupItem key={opt} value={opt} className="h-7 px-2 text-xs" title={`Arrowhead: ${opt}`}>
                {opt}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </>
      )}
    </>
  );
}
