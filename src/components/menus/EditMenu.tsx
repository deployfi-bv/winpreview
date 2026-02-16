import { toast } from 'sonner';

import {
MenubarContent, MenubarItem,
  MenubarMenu,   MenubarSeparator, MenubarShortcut,
MenubarTrigger, } from '@/components/ui/menubar';

import { useAppState } from '@/hooks/useAppState';

import { triggerFileDialog } from '@/lib/fileDialog';

export function EditMenu() {
  const {
    isDocumentOpen, currentPageIndex, undoStack, redoStack, selectedAnnotationId,
    undo, redo, cutAnnotation, copyAnnotation, pasteAnnotation, deleteSelectedAnnotations,
    insertPageAfter, insertPagesFromFile, flipPage, setCropMode, selectAllAnnotations,
  } = useAppState();

  const handleInsertFromFile = async () => {
    const file = await triggerFileDialog();
    if (!file) return;
    try {
      await insertPagesFromFile(currentPageIndex, file);
    } catch (err) {
      toast.error(`Failed to insert: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <MenubarMenu>
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={undo} disabled={!isDocumentOpen || undoStack.length === 0}>
          Undo<MenubarShortcut>Ctrl+Z</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={redo} disabled={!isDocumentOpen || redoStack.length === 0}>
          Redo<MenubarShortcut>Ctrl+Shift+Z</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={cutAnnotation} disabled={!selectedAnnotationId}>
          Cut<MenubarShortcut>Ctrl+X</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={copyAnnotation} disabled={!selectedAnnotationId}>
          Copy<MenubarShortcut>Ctrl+C</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={pasteAnnotation} disabled={!isDocumentOpen}>
          Paste<MenubarShortcut>Ctrl+V</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={selectAllAnnotations} disabled={!isDocumentOpen}>
          Select All<MenubarShortcut>Ctrl+A</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={deleteSelectedAnnotations} disabled={!selectedAnnotationId}>
          Delete<MenubarShortcut>Del</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleInsertFromFile} disabled={!isDocumentOpen}>
          Insert Page from File…
        </MenubarItem>
        <MenubarItem onClick={() => insertPageAfter(currentPageIndex)} disabled={!isDocumentOpen}>
          Insert Blank Page
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={() => setCropMode(true)} disabled={!isDocumentOpen}>
          Crop<MenubarShortcut>Ctrl+K</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => flipPage(currentPageIndex, 'horizontal')} disabled={!isDocumentOpen}>
          Flip Horizontal
        </MenubarItem>
        <MenubarItem onClick={() => flipPage(currentPageIndex, 'vertical')} disabled={!isDocumentOpen}>
          Flip Vertical
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
