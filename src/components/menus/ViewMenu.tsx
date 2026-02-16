import {
MenubarCheckboxItem,
MenubarContent, MenubarItem,
  MenubarMenu,   MenubarSeparator, MenubarShortcut, MenubarTrigger, } from '@/components/ui/menubar';

import { useAppState } from '@/hooks/useAppState';

import { ZOOM_DEFAULT,zoomIn, zoomOut } from '@/constants/zoom';

export function ViewMenu() {
  const {
    isDocumentOpen, isSidebarVisible, isFullscreen, viewMode,
    toggleSidebar, toggleSearchBar, openGoToPageDialog,
    toggleViewMode, zoom, setZoom, toggleFullscreen,
    fitWidth, fitPage,
  } = useAppState();

  return (
    <MenubarMenu>
      <MenubarTrigger>View</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={() => setZoom(zoomIn(zoom))} disabled={!isDocumentOpen}>
          Zoom In<MenubarShortcut>Ctrl+=</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => setZoom(zoomOut(zoom))} disabled={!isDocumentOpen}>
          Zoom Out<MenubarShortcut>Ctrl+−</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => setZoom(ZOOM_DEFAULT)} disabled={!isDocumentOpen}>
          Actual Size<MenubarShortcut>Ctrl+0</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={fitWidth} disabled={!isDocumentOpen}>
          Fit Width<MenubarShortcut>Ctrl+9</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={fitPage} disabled={!isDocumentOpen}>
          Fit Page<MenubarShortcut>Ctrl+8</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarCheckboxItem
          checked={viewMode === 'contact-sheet'}
          onCheckedChange={toggleViewMode}
          disabled={!isDocumentOpen}
        >
          Contact Sheet
          <MenubarShortcut>Ctrl+J</MenubarShortcut>
        </MenubarCheckboxItem>
        <MenubarSeparator />
        <MenubarCheckboxItem checked={isSidebarVisible} onCheckedChange={toggleSidebar}>
          Show Sidebar
        </MenubarCheckboxItem>
        <MenubarSeparator />
        <MenubarCheckboxItem checked={isFullscreen} onCheckedChange={toggleFullscreen}>
          Fullscreen<MenubarShortcut>F11</MenubarShortcut>
        </MenubarCheckboxItem>
        <MenubarSeparator />
        <MenubarItem onClick={openGoToPageDialog} disabled={!isDocumentOpen}>
          Go to Page…<MenubarShortcut>Ctrl+G</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={toggleSearchBar} disabled={!isDocumentOpen}>
          Find…<MenubarShortcut>Ctrl+F</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
