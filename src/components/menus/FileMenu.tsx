import { toast } from 'sonner';

import {
MenubarContent, MenubarItem,
  MenubarMenu,   MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent,
MenubarSubTrigger, MenubarTrigger, } from '@/components/ui/menubar';

import { useAppState } from '@/hooks/useAppState';
import { useDocumentOps } from '@/hooks/useDocumentOps';

import { triggerFileDialog } from '@/lib/fileDialog';

export function FileMenu() {
  const { isDocumentOpen, openDocument, closeDocument, newDocument, openExportDialog, openPasswordDialog, currentPageIndex, insertPagesFromFile } = useAppState();
  const { save, print, saveState } = useDocumentOps();

  const handleOpen = async () => {
    const file = await triggerFileDialog();
    if (!file) return;
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const format = ext === 'pdf' ? 'pdf' : 'image';
      const buffer = await file.arrayBuffer();
      await openDocument(file.name, format, new Uint8Array(buffer));
      toast(`Opened: ${file.name}`);
    } catch (err) {
      toast.error(`Failed to open: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleNew = () => {
    newDocument();
    toast('Created new blank document');
  };

  const handleSave = () => {
    if (!saveState.isRunning) save();
  };

  const handleSaveAs = () => {
    openExportDialog();
  };

  const handleInsertFromFile = async () => {
    const file = await triggerFileDialog();
    if (!file) return;
    try {
      await insertPagesFromFile(currentPageIndex, file);
    } catch (err) {
      toast.error(`Failed to insert: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handlePrint = () => {
    print();
  };

  return (
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleNew}>
          New
          <MenubarShortcut>Ctrl+N</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleOpen}>
          Open…
          <MenubarShortcut>Ctrl+O</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={closeDocument} disabled={!isDocumentOpen}>
          Close
          <MenubarShortcut>Ctrl+W</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleSave} disabled={!isDocumentOpen}>
          Save
          <MenubarShortcut>Ctrl+S</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleSaveAs} disabled={!isDocumentOpen}>
          Save As…
          <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger disabled={!isDocumentOpen}>Export</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={openExportDialog}>PDF…</MenubarItem>
            <MenubarItem onClick={openExportDialog}>JPEG…</MenubarItem>
            <MenubarItem onClick={openExportDialog}>PNG…</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarItem onClick={handleInsertFromFile} disabled={!isDocumentOpen}>
          Insert Pages from File…
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={openPasswordDialog} disabled={!isDocumentOpen}>
          Password Protection…
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handlePrint} disabled={!isDocumentOpen}>
          Print…
          <MenubarShortcut>Ctrl+P</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
