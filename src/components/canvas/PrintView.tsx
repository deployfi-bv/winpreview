import { useEffect, useRef } from 'react';

import { AnnotationLayer } from './annotations/AnnotationLayer';

import type { FormField } from '@/types/app';
import type { PageData } from '@/types/page';

import { getImageUrl, renderImageToCanvas } from '@/services/imageService';
import { getDoc, renderPage } from '@/services/pdfService';

interface PrintViewProps {
  pages: PageData[];
  formFields: FormField[];
}

export function PrintView({ pages, formFields }: PrintViewProps) {
  return (
    <div className="print-only">
      {pages.map((page) => (
        <PrintPage
          key={page.id}
          page={page}
          pageFormFields={formFields.filter((f) => f.pageId === page.id)}
        />
      ))}
    </div>
  );
}

interface PrintPageProps {
  page: PageData;
  pageFormFields: FormField[];
}

function PrintPage({ page, pageFormFields }: PrintPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (page.sourceFormat === 'pdf' && getDoc(page.sourceId)) {
      const renderKey = `print-${page.id}`;
      renderPage(page.originalIndex + 1, canvas, 1, renderKey, page.sourceId);
    } else if (page.sourceFormat === 'image') {
      const imageUrl = getImageUrl(page.sourceId);
      if (imageUrl) {
        renderImageToCanvas(imageUrl, canvas, page.width, page.height, 1);
      }
    }
  }, [page]);

  return (
    <div
      className="print-page"
      style={{ width: page.width, height: page.height, position: 'relative' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Annotation overlay for print */}
      <svg
        viewBox={`0 0 ${page.width} ${page.height}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <AnnotationLayer
          pageId={page.id}
          drawingAnnotation={null}
          onAnnotationMouseDown={() => {}}
          onHandleMouseDown={() => {}}
        />
      </svg>
      {/* Flattened form field values (text only, not interactive) */}
      {pageFormFields.map((field) => (
        <div
          key={field.id}
          className="absolute overflow-hidden text-[10px] leading-tight text-black"
          style={{
            left: field.x,
            top: field.y,
            width: field.width,
            height: field.height,
          }}
        >
          {field.type === 'checkbox' ? (field.value === 'true' ? '[X]' : '[ ]') : field.value}
        </div>
      ))}
    </div>
  );
}
