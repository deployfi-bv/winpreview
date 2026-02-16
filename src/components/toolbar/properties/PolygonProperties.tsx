import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useAppState } from '@/hooks/useAppState';

import { BORDER_STYLES, BORDER_WIDTHS, POLYGON_SIDES_OPTIONS } from '@/constants/annotations';

import { isPolygonAnnotation } from '@/types/annotation';

import { ColorPicker } from './ColorPicker';

export function PolygonProperties() {
  const { getSelectedAnnotation, updateAnnotation } = useAppState();
  const selected = getSelectedAnnotation();
  const poly = selected && isPolygonAnnotation(selected) ? selected : null;

  return (
    <>
      <ColorPicker
        label="Border"
        value={poly?.borderColor ?? '#000000'}
        onChange={(borderColor) => poly && updateAnnotation(poly.id, { borderColor })}
      />
      <ColorPicker
        label="Fill"
        value={poly?.fillColor ?? 'none'}
        onChange={(fillColor) => poly && updateAnnotation(poly.id, { fillColor })}
        allowNoFill
      />
      <Select
        value={String(poly?.borderWidth ?? 2)}
        onValueChange={(v) => poly && updateAnnotation(poly.id, { borderWidth: Number(v) })}
      >
        <SelectTrigger className="h-7 w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BORDER_WIDTHS.map((w) => (
            <SelectItem key={w} value={String(w)}>{w}px</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ToggleGroup
        type="single"
        value={poly?.borderStyle ?? 'solid'}
        onValueChange={(v) => v && poly && updateAnnotation(poly.id, { borderStyle: v as 'solid' | 'dashed' | 'dotted' })}
      >
        {BORDER_STYLES.map((s) => (
          <ToggleGroupItem key={s} value={s} className="h-7 px-2 text-xs">{s}</ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Select
        value={String(poly?.sides ?? 6)}
        onValueChange={(v) => poly && updateAnnotation(poly.id, { sides: Number(v) })}
      >
        <SelectTrigger className="h-7 w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {POLYGON_SIDES_OPTIONS.map((s) => (
            <SelectItem key={s} value={String(s)}>{s} sides</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
