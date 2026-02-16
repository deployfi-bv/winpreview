import { toast } from 'sonner';

import { triggerFileDialog } from '@/lib/fileDialog';

import type { ShortcutContext } from './types';

async function openFileFromDialog(
  openDocument: ShortcutContext['openDocument'],
): Promise<void> {
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
}

export function handleFileAction(action: string, ctx: ShortcutContext): boolean {
  switch (action) {
    case 'open':
      openFileFromDialog(ctx.openDocument);
      return true;
    case 'save':
      ctx.saveRef.current();
      return true;
    case 'save-as':
      ctx.openExportDialog();
      return true;
    case 'print':
      ctx.printRef.current();
      return true;
    case 'close':
      ctx.closeDocument();
      return true;
    case 'new-from-clipboard':
      ctx.newDocument();
      toast('Created new blank document');
      return true;
    default:
      return false;
  }
}
