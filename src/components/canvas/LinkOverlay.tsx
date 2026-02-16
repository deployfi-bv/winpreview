import { useAppState } from '@/hooks/useAppState';

interface LinkOverlayProps {
  pageId: string;
  zoom: number;
}

export function LinkOverlay({ pageId, zoom }: LinkOverlayProps) {
  const { pdfLinks } = useAppState();
  const pageLinks = pdfLinks.filter((l) => l.pageId === pageId);

  if (pageLinks.length === 0) return null;

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      {pageLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute block"
          title={link.url}
          style={{
            left: link.x * zoom,
            top: link.y * zoom,
            width: link.width * zoom,
            height: link.height * zoom,
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      ))}
    </div>
  );
}
