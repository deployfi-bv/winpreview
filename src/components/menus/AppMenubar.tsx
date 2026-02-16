import { Menubar } from '@/components/ui/menubar';

import { EditMenu } from './EditMenu';
import { FileMenu } from './FileMenu';
import { HelpMenu } from './HelpMenu';
import { ToolsMenu } from './ToolsMenu';
import { ViewMenu } from './ViewMenu';
import { WindowMenu } from './WindowMenu';

export function AppMenubar() {
  return (
    <Menubar className="rounded-none border-x-0 border-t-0 shadow-none">
      <FileMenu />
      <EditMenu />
      <ViewMenu />
      <ToolsMenu />
      <WindowMenu />
      <HelpMenu />
    </Menubar>
  );
}
