import { toast } from 'sonner';

import {
MenubarContent, MenubarItem,
  MenubarMenu,   MenubarSeparator,
MenubarTrigger, } from '@/components/ui/menubar';

import { useAppState } from '@/hooks/useAppState';

export function HelpMenu() {
  const { openAboutDialog, openTetrisDialog } = useAppState();

  return (
    <MenubarMenu>
      <MenubarTrigger>Help</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={() => toast('Keyboard shortcuts are listed in each menu.')}>
          WinPreview Help
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={() => toast.success('WinPreview is up to date! Version 2.0')}>
          Check for Updates…
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={openTetrisDialog}>
          Play Tetris
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={openAboutDialog}>
          About WinPreview
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
