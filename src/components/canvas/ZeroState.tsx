import { useCallback, useState } from 'react';
import { FileIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { useAppState } from '@/hooks/useAppState';

import { triggerFileDialog } from '@/lib/fileDialog';
import { cn } from '@/lib/utils';

const SUPPORTED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp'];

export function ZeroState() {
  const { openDocument } = useAppState();
  const [isDragOver, setIsDragOver] = useState(false);

  const openFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      toast.error(`Unsupported format: .${ext}`);
      return;
    }
    try {
      const format = ext === 'pdf' ? 'pdf' : 'image';
      const buffer = await file.arrayBuffer();
      await openDocument(file.name, format, new Uint8Array(buffer));
      toast(`Opened: ${file.name}`);
    } catch (err) {
      toast.error(`Failed to open: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [openDocument]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) openFile(file);
  }, [openFile]);

  const handleOpenClick = async () => {
    const file = await triggerFileDialog();
    if (file) openFile(file);
  };

  return (
    <div
      className={cn(
        'flex h-full items-center justify-center bg-card transition-colors',
        isDragOver && 'bg-blue-500/10'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={cn(
        'flex flex-col items-center gap-6 text-center rounded-xl p-8',
        isDragOver && 'border-2 border-dashed border-blue-500'
      )}>
        <div className="rounded-xl bg-secondary p-8">
          <FileIcon className="size-16 text-muted-foreground" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium text-foreground">
            {isDragOver ? 'Drop to open' : 'Drop files here to open'}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, JPEG, PNG, GIF, BMP, TIFF, WebP
          </p>
        </div>

        <Button onClick={handleOpenClick} size="lg">
          Open File...
        </Button>
      </div>
    </div>
  );
}
