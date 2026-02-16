import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAppState } from '@/hooks/useAppState';

import { cn } from '@/lib/utils';

import { getToolDefinition,getToolsByGroup } from '@/constants/tools';

import { ToolButton } from './ToolButton';

import type { ToolDefinition } from '@/constants/tools';
import type { Tool } from '@/types/app';

const INDIVIDUAL_TOOLS: Tool[] = ['selection', 'text', 'freehand', 'signature'];

interface ToolDropdownProps {
  label: string;
  tools: ToolDefinition[];
}

function ToolDropdown({ label, tools }: ToolDropdownProps) {
  const { isDocumentOpen, activeTool, setActiveTool } = useAppState();

  // Show the active tool's icon as trigger if it's in this group, otherwise first tool
  const activeInGroup = tools.find((t) => t.id === activeTool);
  const triggerTool = activeInGroup ?? tools[0];
  const TriggerIcon = triggerTool.icon;
  const isGroupActive = !!activeInGroup;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            'gap-0 pr-0.5',
            isGroupActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
          )}
          title={label}
          disabled={!isDocumentOpen}
        >
          <TriggerIcon className="h-4 w-4" />
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <DropdownMenuItem
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id);
              }}
              className={cn(activeTool === tool.id && 'bg-accent')}
            >
              <Icon className="mr-2 h-4 w-4" />
              {tool.label}
              {tool.shortcut && (
                <span className="ml-auto text-xs text-muted-foreground">{tool.shortcut}</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ToolsGroup() {
  const shapesTools = getToolsByGroup('shapes');
  const linesTools = getToolsByGroup('lines');
  const markupTools = getToolsByGroup('markup');
  const specialTools = getToolsByGroup('special');

  return (
    <>
      {INDIVIDUAL_TOOLS.map((toolId) => {
        const def = getToolDefinition(toolId);
        if (!def) return null;
        return <ToolButton key={def.id} tool={def.id} icon={def.icon} label={def.label} />;
      })}
      <ToolDropdown label="Shapes" tools={shapesTools} />
      <ToolDropdown label="Lines" tools={linesTools} />
      <ToolDropdown label="Markup" tools={markupTools} />
      <ToolDropdown label="Special" tools={specialTools} />
    </>
  );
}
