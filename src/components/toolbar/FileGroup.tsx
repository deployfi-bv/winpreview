import { FolderOpen, PanelLeft,PanelLeftClose } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { useAppState } from '@/hooks/useAppState';

import { triggerFileDialog } from '@/lib/fileDialog';

export function FileGroup() {
  const { isSidebarVisible, toggleSidebar, openDocument } = useAppState();

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

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpen}>
        <FolderOpen />
        <span>Open</span>
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={toggleSidebar} title="Toggle Sidebar">
        {isSidebarVisible ? <PanelLeftClose /> : <PanelLeft />}
      </Button>
    </>
  );
}
