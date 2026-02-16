import { Separator } from '@/components/ui/separator';

import { ActionsGroup } from './ActionsGroup';
import { ApiStatus } from './ApiStatus';
import { ExportGroup } from './ExportGroup';
import { FileGroup } from './FileGroup';
import { NavigationGroup } from './NavigationGroup';
import { ToolsGroup } from './ToolsGroup';
import { ZoomGroup } from './ZoomGroup';

export function MainToolbar() {
  return (
    <div className="flex h-11 items-center gap-1 border-b px-3">
      <FileGroup />
      <Separator orientation="vertical" className="mx-1 h-6 bg-muted-foreground/30" />
      <NavigationGroup />
      <Separator orientation="vertical" className="mx-1 h-6 bg-muted-foreground/30" />
      <ZoomGroup />
      <Separator orientation="vertical" className="mx-1 h-6 bg-muted-foreground/30" />
      <ToolsGroup />
      <Separator orientation="vertical" className="mx-1 h-6 bg-muted-foreground/30" />
      <ActionsGroup />
      <Separator orientation="vertical" className="mx-1 h-6 bg-muted-foreground/30" />
      <ExportGroup />
      <ApiStatus />
    </div>
  );
}
