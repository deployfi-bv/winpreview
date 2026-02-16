import {
ArrowRight, Circle, EyeOff, Hexagon, Highlighter, MessageSquare, Minus,   MousePointer, Pencil,
  PenTool, Scan, Search,
Square,   Star, StickyNote,
Strikethrough, Type, Underline, } from 'lucide-react';

import type { Tool } from '@/types/app';
import type { LucideIcon } from 'lucide-react';

export interface ToolDefinition {
  id: Tool;
  label: string;
  icon: LucideIcon;
  shortcut: string;
  group?: 'individual' | 'shapes' | 'lines' | 'markup' | 'special';
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // Individual buttons
  { id: 'selection', label: 'Selection', icon: MousePointer, shortcut: 'V', group: 'individual' },
  { id: 'text', label: 'Text', icon: Type, shortcut: 'T', group: 'individual' },
  { id: 'freehand', label: 'Freehand', icon: Pencil, shortcut: 'D', group: 'individual' },
  { id: 'signature', label: 'Signature', icon: PenTool, shortcut: 'S', group: 'individual' },

  // Shapes dropdown
  { id: 'rectangle', label: 'Rectangle', icon: Square, shortcut: 'R', group: 'shapes' },
  { id: 'oval', label: 'Oval', icon: Circle, shortcut: 'O', group: 'shapes' },
  { id: 'star', label: 'Star', icon: Star, shortcut: '', group: 'shapes' },
  { id: 'polygon', label: 'Polygon', icon: Hexagon, shortcut: '', group: 'shapes' },
  { id: 'speech-balloon', label: 'Speech Balloon', icon: MessageSquare, shortcut: '', group: 'shapes' },

  // Lines dropdown
  { id: 'line', label: 'Line', icon: Minus, shortcut: 'L', group: 'lines' },
  { id: 'arrow', label: 'Arrow', icon: ArrowRight, shortcut: 'A', group: 'lines' },

  // Markup dropdown
  { id: 'highlight', label: 'Highlight', icon: Highlighter, shortcut: 'H', group: 'markup' },
  { id: 'underline', label: 'Underline', icon: Underline, shortcut: 'U', group: 'markup' },
  { id: 'strikethrough', label: 'Strikethrough', icon: Strikethrough, shortcut: 'K', group: 'markup' },

  // Special dropdown
  { id: 'sticky-note', label: 'Sticky Note', icon: StickyNote, shortcut: 'N', group: 'special' },
  { id: 'redaction', label: 'Redaction', icon: EyeOff, shortcut: '', group: 'special' },
  { id: 'mask', label: 'Mask', icon: Scan, shortcut: 'M', group: 'special' },
  { id: 'loupe', label: 'Loupe', icon: Search, shortcut: '', group: 'special' },
];

export function getToolsByGroup(group: string): ToolDefinition[] {
  return TOOL_DEFINITIONS.filter((t) => t.group === group);
}

export function getToolDefinition(id: Tool): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.id === id);
}
