import { useState } from 'react';
import { Link2, Link2Off } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent,   DialogDescription, DialogFooter,
DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';

import { useAppState } from '@/hooks/useAppState';

import { DEFAULT_DPI,DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_WIDTH, UNIT_OPTIONS } from '@/constants/dialogs';

import type { SizeUnit } from '@/types/dialogs';

export function ResizeDialog() {
  const { isResizeDialogOpen, closeResizeDialog, format } = useAppState();
  const [width, setWidth] = useState(String(DEFAULT_IMAGE_WIDTH));
  const [height, setHeight] = useState(String(DEFAULT_IMAGE_HEIGHT));
  const [unit, setUnit] = useState<SizeUnit>('px');
  const [proportional, setProportional] = useState(true);
  const [resample, setResample] = useState(true);
  const [dpi, setDpi] = useState(String(DEFAULT_DPI));

  const isPdf = format === 'pdf';
  const aspectRatio = DEFAULT_IMAGE_WIDTH / DEFAULT_IMAGE_HEIGHT;

  const handleWidthChange = (val: string) => {
    setWidth(val);
    if (proportional && val) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setHeight(String(Math.round(num / aspectRatio)));
      }
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    if (proportional && val) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setWidth(String(Math.round(num * aspectRatio)));
      }
    }
  };

  const handleSubmit = () => {
    toast(`Resize: ${width}×${height} ${unit} @ ${dpi} DPI`);
    closeResizeDialog();
  };

  return (
    <Dialog open={isResizeDialogOpen} onOpenChange={(open) => { if (!open) closeResizeDialog(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust Size</DialogTitle>
          <DialogDescription>
            {isPdf ? 'Resize is only available for image formats.' : 'Resize the current image.'}
          </DialogDescription>
        </DialogHeader>

        <fieldset disabled={isPdf} className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="resize-width">Width</Label>
              <Input
                id="resize-width"
                type="number"
                min={1}
                value={width}
                onChange={(e) => handleWidthChange(e.target.value)}
              />
            </div>

            <Toggle
              pressed={proportional}
              onPressedChange={setProportional}
              size="sm"
              title="Scale proportionally"
              className="mb-0.5"
            >
              {proportional ? <Link2 className="size-4" /> : <Link2Off className="size-4" />}
            </Toggle>

            <div className="flex-1 space-y-1">
              <Label htmlFor="resize-height">Height</Label>
              <Input
                id="resize-height"
                type="number"
                min={1}
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as SizeUnit)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="resize-dpi">Resolution (DPI)</Label>
            <Input
              id="resize-dpi"
              type="number"
              min={1}
              max={2400}
              value={dpi}
              onChange={(e) => setDpi(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="resample"
              checked={resample}
              onCheckedChange={(v) => setResample(v === true)}
            />
            <Label htmlFor="resample" className="font-normal">Resample image</Label>
          </div>

          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            Estimated size: ~3.2 MB
          </div>
        </fieldset>

        <DialogFooter>
          <Button variant="outline" onClick={closeResizeDialog}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPdf}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
