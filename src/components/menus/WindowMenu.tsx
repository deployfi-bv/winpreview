import {
MenubarContent, MenubarItem,
  MenubarMenu,   MenubarShortcut,
MenubarTrigger, } from '@/components/ui/menubar';

import { useAppState } from '@/hooks/useAppState';

export function WindowMenu() {
  const { toggleFullscreen } = useAppState();

  const handleMinimize = () => {
    // Best browser approximation of minimize: blur the window
    window.blur();
  };

  return (
    <MenubarMenu>
      <MenubarTrigger>Window</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleMinimize}>
          Minimize<MenubarShortcut>Ctrl+M</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={toggleFullscreen}>
          Zoom<MenubarShortcut>F11</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
