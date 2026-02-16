import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useAppState } from '@/hooks/useAppState';

import { BORDER_STYLES, BORDER_WIDTHS, STAR_POINTS_OPTIONS } from '@/constants/annotations';

import { isStarAnnotation } from '@/types/annotation';

import { ColorPicker } from './ColorPicker';

export function StarProperties() {
  const { getSelectedAnnotation, updateAnnotation } = useAppState();
  const selected = getSelectedAnnotation();
  const star = selected && isStarAnnotation(selected) ? selected : null;

  return (
    <>
      <ColorPicker
        label="Border"
        value={star?.borderColor ?? '#000000'}
        onChange={(borderColor) => star && updateAnnotation(star.id, { borderColor })}
      />
      <ColorPicker
        label="Fill"
        value={star?.fillColor ?? '#FFCC00'}
        onChange={(fillColor) => star && updateAnnotation(star.id, { fillColor })}
        allowNoFill
      />
      <Select
        value={String(star?.borderWidth ?? 2)}
        onValueChange={(v) => star && updateAnnotation(star.id, { borderWidth: Number(v) })}
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
        value={star?.borderStyle ?? 'solid'}
        onValueChange={(v) => v && star && updateAnnotation(star.id, { borderStyle: v as 'solid' | 'dashed' | 'dotted' })}
      >
        {BORDER_STYLES.map((s) => (
          <ToggleGroupItem key={s} value={s} className="h-7 px-2 text-xs">{s}</ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Select
        value={String(star?.points ?? 5)}
        onValueChange={(v) => star && updateAnnotation(star.id, { points: Number(v) })}
      >
        <SelectTrigger className="h-7 w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STAR_POINTS_OPTIONS.map((p) => (
            <SelectItem key={p} value={String(p)}>{p} points</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
