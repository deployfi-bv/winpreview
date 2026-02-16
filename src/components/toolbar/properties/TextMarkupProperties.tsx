import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useAppState } from '@/hooks/useAppState';

import { cn } from '@/lib/utils';

import { HIGHLIGHT_COLORS } from '@/constants/annotations';

import { isTextMarkupAnnotation } from '@/types/annotation';

export function TextMarkupProperties() {
  const { getSelectedAnnotation, updateAnnotation, activeTool } = useAppState();
  const selected = getSelectedAnnotation();
  const markup = selected && isTextMarkupAnnotation(selected) ? selected : null;
  const currentColor = markup?.color ?? '#FFCC00';

  const toolLabel = activeTool === 'highlight' ? 'Highlight' : activeTool === 'underline' ? 'Underline' : 'Strikethrough';

  return (
    <>
      <span className="text-xs text-muted-foreground">{toolLabel}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2">
            <div className="h-4 w-4 rounded-sm border" style={{ backgroundColor: currentColor }} />
            Color
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.value}
                title={c.label}
                className={cn(
                  'h-6 w-6 rounded-sm border transition-transform hover:scale-110',
                  currentColor === c.value && 'ring-2 ring-ring'
                )}
                style={{ backgroundColor: c.value }}
                onClick={() => markup && updateAnnotation(markup.id, { color: c.value })}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
