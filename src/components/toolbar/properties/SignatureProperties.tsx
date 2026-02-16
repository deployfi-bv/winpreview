import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAppState } from '@/hooks/useAppState';

import { BORDER_WIDTHS } from '@/constants/annotations';

import { isSignatureAnnotation } from '@/types/annotation';

import { ColorPicker } from './ColorPicker';

export function SignatureProperties() {
  const { getSelectedAnnotation, updateAnnotation, openSignaturePadDialog } = useAppState();
  const selected = getSelectedAnnotation();
  const sig = selected && isSignatureAnnotation(selected) ? selected : null;

  return (
    <>
      <ColorPicker
        label="Color"
        value={sig?.color ?? '#000000'}
        onChange={(color) => sig && updateAnnotation(sig.id, { color })}
      />
      <Select
        value={String(sig?.width ?? 2)}
        onValueChange={(v) => sig && updateAnnotation(sig.id, { width: Number(v) })}
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
      <Button variant="outline" size="sm" onClick={openSignaturePadDialog}>
        Signature Pad…
      </Button>
    </>
  );
}
