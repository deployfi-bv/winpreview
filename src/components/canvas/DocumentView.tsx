import { ScrollArea } from '@/components/ui/scroll-area';

import { PageRenderer } from './PageRenderer';

import type { PageData } from '@/types/page';

interface DocumentViewProps {
  page: PageData;
  zoom: number;
}

export function DocumentView({ page, zoom }: DocumentViewProps) {
  return (
    <ScrollArea className="h-full w-full">
      <div className="flex min-h-full items-center justify-center bg-secondary p-12">
        <PageRenderer page={page} zoom={zoom} />
      </div>
    </ScrollArea>
  );
}
