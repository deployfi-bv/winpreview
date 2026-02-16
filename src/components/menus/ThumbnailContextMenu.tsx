import { FileDown, FileInput, FilePlus, Replace, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut,
  ContextMenuSub, ContextMenuSubContent,
ContextMenuSubTrigger, } from '@/components/ui/context-menu';

import { useAppState } from '@/hooks/useAppState';

import { triggerFileDialog } from '@/lib/fileDialog';

interface ThumbnailContextMenuProps {
  pageIndex: number;
  pageCount: number;
  selectedCount: number;
}

export function ThumbnailContextMenu({ pageIndex, pageCount, selectedCount }: ThumbnailContextMenuProps) {
  const {
    rotatePage, deletePage, insertPageAfter, openExportDialog,
    deleteSelectedPages, rotateSelectedPages,
    replacePageWithFile, insertPagesFromFile,
  } = useAppState();

  const isMulti = selectedCount > 1;

  const handleReplaceFile = async () => {
    const file = await triggerFileDialog();
    if (!file) return;
    try {
      await replacePageWithFile(pageIndex, file);
    } catch (err) {
      toast.error(`Failed to replace: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleInsertFile = async () => {
    const file = await triggerFileDialog();
    if (!file) return;
    try {
      await insertPagesFromFile(pageIndex, file);
    } catch (err) {
      toast.error(`Failed to insert: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <ContextMenuContent>
      {isMulti ? (
        <>
          <ContextMenuItem onClick={() => rotateSelectedPages('left')}>
            <RotateCcw />Rotate {selectedCount} Pages Left
          </ContextMenuItem>
          <ContextMenuItem onClick={() => rotateSelectedPages('right')}>
            <RotateCw />Rotate {selectedCount} Pages Right
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={deleteSelectedPages}
            variant="destructive"
            disabled={selectedCount >= pageCount}
          >
            <Trash2 />Delete {selectedCount} Pages
          </ContextMenuItem>
        </>
      ) : (
        <>
          <ContextMenuItem onClick={() => rotatePage(pageIndex, 'left')}>
            <RotateCcw />Rotate Left<ContextMenuShortcut>Ctrl+L</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => rotatePage(pageIndex, 'right')}>
            <RotateCw />Rotate Right<ContextMenuShortcut>Ctrl+R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => deletePage(pageIndex)}
            variant="destructive"
            disabled={pageCount <= 1}
          >
            <Trash2 />Delete Page<ContextMenuShortcut>Del</ContextMenuShortcut>
          </ContextMenuItem>
        </>
      )}
      <ContextMenuSeparator />
      <ContextMenuItem onClick={handleReplaceFile}>
        <Replace />Replace with File...
      </ContextMenuItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <FilePlus className="mr-2 h-4 w-4" />Insert Page After
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onClick={() => insertPageAfter(pageIndex)}>
            Blank Page
          </ContextMenuItem>
          <ContextMenuItem onClick={handleInsertFile}>
            <FileInput />From File...
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={openExportDialog}>
        <FileDown />Export Selected Pages
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
