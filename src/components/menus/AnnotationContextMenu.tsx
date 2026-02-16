import { ArrowDownToLine, ArrowUpToLine, Copy, Scissors, Settings2,Trash2 } from 'lucide-react';

import {
  ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut,
} from '@/components/ui/context-menu';

import { useAppState } from '@/hooks/useAppState';

export function AnnotationContextMenu({ annotationId }: { annotationId: string }) {
  const { deleteAnnotation, bringToFront, sendToBack, copyAnnotation, cutAnnotation, selectAnnotation } = useAppState();

  const handleProperties = () => {
    // Select the annotation to show its properties in the properties bar
    selectAnnotation(annotationId);
  };

  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={cutAnnotation}>
        <Scissors />Cut<ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={copyAnnotation}>
        <Copy />Copy<ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => deleteAnnotation(annotationId)} variant="destructive">
        <Trash2 />Delete<ContextMenuShortcut>Del</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => bringToFront(annotationId)}>
        <ArrowUpToLine />Bring to Front
      </ContextMenuItem>
      <ContextMenuItem onClick={() => sendToBack(annotationId)}>
        <ArrowDownToLine />Send to Back
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={handleProperties}>
        <Settings2 />Properties
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
