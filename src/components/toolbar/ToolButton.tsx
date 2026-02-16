import { Button } from '@/components/ui/button';

import { useAppState } from '@/hooks/useAppState';

import { cn } from '@/lib/utils';

import type { Tool } from '@/types/app';
import type { LucideIcon } from 'lucide-react';

interface ToolButtonProps {
  tool: Tool;
  icon: LucideIcon;
  label: string;
}

export function ToolButton({ tool, icon: Icon, label }: ToolButtonProps) {
  const { isDocumentOpen, activeTool, setActiveTool } = useAppState();

  const handleClick = () => {
    setActiveTool(tool);
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      className={cn(
        activeTool === tool && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
      )}
      title={label}
      disabled={!isDocumentOpen}
    >
      <Icon />
    </Button>
  );
}
