import { ThumbnailContextMenu } from '@/components/menus/ThumbnailContextMenu';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';

import { cn } from '@/lib/utils';

import { PageThumbnail } from './PageThumbnail';

import type { PageData } from '@/types/page';

interface ThumbnailItemProps {
  page: PageData;
  pageIndex: number;
  pageCount: number;
  isActive: boolean;
  isSelected: boolean;
  isDragOver: boolean;
  isFileDropIndicator?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  selectedCount: number;
}

export function ThumbnailItem({
  page, pageIndex, pageCount, isActive, isSelected, isDragOver, isFileDropIndicator,
  onSelect, onDragStart, onDragOver, onDragLeave, onDrop, selectedCount,
}: ThumbnailItemProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          draggable
          onClick={onSelect}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            'cursor-pointer rounded-md border p-1.5 hover:border-ring transition-colors',
            isSelected && 'border-ring ring-2 ring-ring/50 bg-accent/5',
            !isSelected && isActive && 'border-ring/50 bg-accent/5',
            isDragOver && !isFileDropIndicator && 'border-ring border-dashed bg-accent/10',
          )}
        >
          {/* File drop insert indicator line */}
          {isFileDropIndicator && isDragOver && (
            <div className="mb-1 h-0.5 rounded-full bg-ring" />
          )}
          <PageThumbnail page={page} pageIndex={pageIndex} pageCount={pageCount} isSelected={isSelected || isActive} />
        </div>
      </ContextMenuTrigger>
      <ThumbnailContextMenu pageIndex={pageIndex} pageCount={pageCount} selectedCount={selectedCount} />
    </ContextMenu>
  );
}
