import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { cn } from '@/lib/utils';

import { COLOR_PRESETS } from '@/constants/annotations';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  allowNoFill?: boolean;
}

export function ColorPicker({ label, value, onChange, allowNoFill }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (color: string) => {
    onChange(color);
    setOpen(false);
  };

  const handleNoFill = () => {
    onChange('none');
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" title={label}>
            {value === 'none' ? (
              <div className="size-4 rounded-sm border border-muted-foreground relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-px w-full rotate-45 bg-destructive" />
                </div>
              </div>
            ) : (
              <div className="size-4 rounded-sm border border-muted-foreground" style={{ backgroundColor: value }} />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="grid grid-cols-6 gap-1.5">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                className={cn(
                  'size-6 rounded-full border border-muted-foreground transition-transform hover:scale-110',
                  value === preset.value && 'ring-2 ring-ring ring-offset-2 ring-offset-popover'
                )}
                style={{ backgroundColor: preset.value }}
                title={preset.label}
                onClick={() => handleSelect(preset.value)}
              />
            ))}
          </div>
          {allowNoFill && (
            <button
              className={cn(
                'mt-2 flex w-full items-center gap-2 rounded-sm px-2 py-1 text-xs hover:bg-accent',
                value === 'none' && 'bg-accent'
              )}
              onClick={handleNoFill}
            >
              No Fill
            </button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
