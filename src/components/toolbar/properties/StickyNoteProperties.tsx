import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useAppState } from '@/hooks/useAppState';

import { cn } from '@/lib/utils';

import { STICKY_NOTE_COLORS } from '@/constants/annotations';

import { isStickyNoteAnnotation } from '@/types/annotation';

export function StickyNoteProperties() {
  const { getSelectedAnnotation, updateAnnotation } = useAppState();
  const selected = getSelectedAnnotation();
  const sticky = selected && isStickyNoteAnnotation(selected) ? selected : null;
  const currentColor = sticky?.color ?? '#FFCC00';

  return (
    <>
      <span className="text-xs text-muted-foreground">Sticky Note</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2">
            <div className="h-4 w-4 rounded-sm border" style={{ backgroundColor: currentColor }} />
            Color
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-1">
            {STICKY_NOTE_COLORS.map((c) => (
              <button
                key={c.value}
                title={c.label}
                className={cn(
                  'h-6 w-6 rounded-sm border transition-transform hover:scale-110',
                  currentColor === c.value && 'ring-2 ring-ring'
                )}
                style={{ backgroundColor: c.value }}
                onClick={() => sticky && updateAnnotation(sticky.id, { color: c.value })}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
