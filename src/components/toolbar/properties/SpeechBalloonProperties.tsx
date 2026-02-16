import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAppState } from '@/hooks/useAppState';

import { BORDER_WIDTHS, FONT_SIZES } from '@/constants/annotations';

import { isSpeechBalloonAnnotation } from '@/types/annotation';

import { ColorPicker } from './ColorPicker';

export function SpeechBalloonProperties() {
  const { getSelectedAnnotation, updateAnnotation } = useAppState();
  const selected = getSelectedAnnotation();
  const balloon = selected && isSpeechBalloonAnnotation(selected) ? selected : null;

  return (
    <>
      <ColorPicker
        label="Border"
        value={balloon?.borderColor ?? '#000000'}
        onChange={(borderColor) => balloon && updateAnnotation(balloon.id, { borderColor })}
      />
      <ColorPicker
        label="Fill"
        value={balloon?.fillColor ?? '#FFFFFF'}
        onChange={(fillColor) => balloon && updateAnnotation(balloon.id, { fillColor })}
        allowNoFill
      />
      <Select
        value={String(balloon?.borderWidth ?? 2)}
        onValueChange={(v) => balloon && updateAnnotation(balloon.id, { borderWidth: Number(v) })}
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
      <Select
        value={String(balloon?.fontSize ?? 14)}
        onValueChange={(v) => balloon && updateAnnotation(balloon.id, { fontSize: Number(v) })}
      >
        <SelectTrigger className="h-7 w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((s) => (
            <SelectItem key={s} value={String(s)}>{s}pt</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
