import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';

import { useAppState } from '@/hooks/useAppState';

import { ADJUSTMENT_SLIDERS } from '@/lib/colorAdjustment';

import type { ColorAdjustment } from '@/types/app';

export function ColorAdjustmentPanel() {
  const {
    isColorAdjustmentPanelOpen, colorAdjustment,
    setColorAdjustment, resetColorAdjustment, toggleColorAdjustmentPanel,
  } = useAppState();

  if (!isColorAdjustmentPanelOpen) return null;

  return (
    <div className="flex w-64 flex-col border-l bg-card">
      <div className="flex h-10 items-center justify-between border-b px-3">
        <span className="text-sm font-medium">Color Adjustments</span>
        <Button variant="ghost" size="icon-sm" onClick={toggleColorAdjustmentPanel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-3">
          {ADJUSTMENT_SLIDERS.map((slider) => (
            <div key={slider.key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{slider.label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {colorAdjustment[slider.key]}
                </span>
              </div>
              <Slider
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={[colorAdjustment[slider.key]]}
                onValueChange={([value]) => {
                  setColorAdjustment({ [slider.key]: value } as Partial<ColorAdjustment>);
                }}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-3">
        <Button variant="outline" size="sm" className="w-full" onClick={resetColorAdjustment}>
          Reset All
        </Button>
      </div>
    </div>
  );
}
