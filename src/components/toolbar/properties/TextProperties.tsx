import { AlignCenter, AlignLeft, AlignRight, Bold, Code, Italic } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useAppState } from '@/hooks/useAppState';

import { FONT_FAMILIES, FONT_SIZES, TEXT_ALIGNMENTS } from '@/constants/annotations';

import { isTextAnnotation } from '@/types/annotation';

import { ColorPicker } from './ColorPicker';

import type { TextAlignment } from '@/constants/annotations';

const ALIGNMENT_ICONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  monospace: Code,
} as const;

export function TextProperties() {
  const { getSelectedAnnotation, updateAnnotation } = useAppState();
  const selected = getSelectedAnnotation();
  const text = selected && isTextAnnotation(selected) ? selected : null;

  const fontFamily = text?.fontFamily ?? 'Arial';
  const fontSize = String(text?.fontSize ?? 14);
  const color = text?.color ?? '#000000';
  const isBold = text?.bold ?? false;
  const isItalic = text?.italic ?? false;
  const alignment: TextAlignment = text?.alignment ?? 'left';

  const handleFontFamilyChange = (value: string) => {
    if (text) updateAnnotation(text.id, { fontFamily: value });
  };

  const handleFontSizeChange = (value: string) => {
    if (text) updateAnnotation(text.id, { fontSize: Number(value) });
  };

  const handleBoldToggle = (pressed: boolean) => {
    if (text) updateAnnotation(text.id, { bold: pressed });
  };

  const handleItalicToggle = (pressed: boolean) => {
    if (text) updateAnnotation(text.id, { italic: pressed });
  };

  const handleAlignmentChange = (value: string) => {
    if (value && text) updateAnnotation(text.id, { alignment: value as TextAlignment });
  };

  const handleColorChange = (value: string) => {
    if (text) updateAnnotation(text.id, { color: value });
  };

  return (
    <>
      <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
        <SelectTrigger size="sm" className="h-7 w-32" title="Font Family">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font} value={font}>{font}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={fontSize} onValueChange={handleFontSizeChange}>
        <SelectTrigger size="sm" className="h-7 w-16" title="Font Size">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)}>{size}pt</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ColorPicker label="Color" value={color} onChange={handleColorChange} />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Toggle size="sm" pressed={isBold} onPressedChange={handleBoldToggle} className="h-7" title="Bold">
        <Bold className="size-3.5" />
      </Toggle>
      <Toggle size="sm" pressed={isItalic} onPressedChange={handleItalicToggle} className="h-7" title="Italic">
        <Italic className="size-3.5" />
      </Toggle>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <ToggleGroup type="single" variant="outline" size="sm" value={alignment} onValueChange={handleAlignmentChange}>
        {TEXT_ALIGNMENTS.map((align) => {
          const Icon = ALIGNMENT_ICONS[align];
          return (
            <ToggleGroupItem key={align} value={align} className="h-7" title={`Align ${align}`}>
              <Icon className="size-3.5" />
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </>
  );
}
