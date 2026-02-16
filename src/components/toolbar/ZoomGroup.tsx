import { FileText,Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAppState } from '@/hooks/useAppState';

import { calculateFitPage,calculateFitWidth } from '@/lib/zoom';

import { formatZoom,zoomIn, zoomOut } from '@/constants/zoom';

export function ZoomGroup() {
  const { isDocumentOpen, zoom, setZoom } = useAppState();

  const handleFitWidth = () => {
    const viewportWidth = window.innerWidth * 0.8;
    setZoom(calculateFitWidth(viewportWidth));
  };

  const handleFitPage = () => {
    const viewportWidth = window.innerWidth * 0.8;
    const viewportHeight = window.innerHeight - 200;
    setZoom(calculateFitPage(viewportWidth, viewportHeight));
  };

  return (
    <>
      <Button variant="ghost" size="icon-sm" onClick={() => setZoom(zoomOut(zoom))} title="Zoom Out" disabled={!isDocumentOpen}>
        <ZoomOut />
      </Button>

      <span className="min-w-[3.5rem] text-center text-sm text-muted-foreground">
        {formatZoom(zoom)}
      </span>

      <Button variant="ghost" size="icon-sm" onClick={() => setZoom(zoomIn(zoom))} title="Zoom In" disabled={!isDocumentOpen}>
        <ZoomIn />
      </Button>

      <Button variant="ghost" size="icon-sm" onClick={handleFitWidth} title="Fit Width" disabled={!isDocumentOpen}>
        <Maximize2 className="rotate-90" />
      </Button>

      <Button variant="ghost" size="icon-sm" onClick={handleFitPage} title="Fit Page" disabled={!isDocumentOpen}>
        <FileText />
      </Button>
    </>
  );
}
