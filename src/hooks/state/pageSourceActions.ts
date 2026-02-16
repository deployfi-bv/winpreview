import { toast } from 'sonner';

import { createPage } from '@/types/page';

import type { PagePickerState, SetState } from '@/hooks/state/types';
import type { SourceFormat } from '@/types/page';

import { getMimeType, loadImage, setImageUrl } from '@/services/imageService';
import { storePdfBinary } from '@/services/pdfBinaryStore';
import { getAllPageDimensions, loadPdf } from '@/services/pdfService';

export function createPageSourceActions(
  setState: SetState,
  openPagePickerDialog: (s: PagePickerState) => void,
) {
  const insertPagesFromSource = (
    afterIndex: number, sourceId: string, pageIndices: number[], sourceFormat: SourceFormat,
  ) => {
    setState((prev) => {
      const newPages = pageIndices.map((origIdx) =>
        createPage({ originalIndex: origIdx, sourceId, sourceFormat })
      );
      const pages = [...prev.pages];
      pages.splice(afterIndex + 1, 0, ...newPages);
      return {
        ...prev, pages, currentPageIndex: afterIndex + 1,
        selectedPageIndices: pageIndices.map((_, i) => afterIndex + 1 + i),
      };
    });
  };

  const replacePageFromSource = (
    targetIndex: number, sourceId: string, pageIndex: number, sourceFormat: SourceFormat,
  ) => {
    setState((prev) => {
      const pages = [...prev.pages];
      const oldPage = pages[targetIndex];
      if (!oldPage) return prev;
      const newPage = createPage({
        originalIndex: pageIndex, sourceId, sourceFormat,
        width: oldPage.width, height: oldPage.height,
      });
      pages[targetIndex] = newPage;
      const newAnnotations = { ...prev.annotations };
      const oldAnns = newAnnotations[oldPage.id];
      if (oldAnns) {
        newAnnotations[newPage.id] = oldAnns.map((a) => ({ ...a, pageId: newPage.id }));
        delete newAnnotations[oldPage.id];
      }
      return { ...prev, pages, annotations: newAnnotations, selectedPageIndices: [targetIndex] };
    });
  };

  const insertPagesFromFile = async (afterIndex: number, file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isPdf = ext === 'pdf';
    const data = new Uint8Array(await file.arrayBuffer());
    const sourceId = `source-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    storePdfBinary(sourceId, data, file.name);

    if (isPdf) {
      const numPages = await loadPdf(data, sourceId);
      const dims = await getAllPageDimensions(sourceId);
      if (numPages === 1) {
        setState((prev) => {
          const newPage = createPage({
            originalIndex: 0, sourceId, sourceFormat: 'pdf',
            width: dims[0].width, height: dims[0].height,
          });
          const pages = [...prev.pages];
          pages.splice(afterIndex + 1, 0, newPage);
          return { ...prev, pages, currentPageIndex: afterIndex + 1, selectedPageIndices: [afterIndex + 1] };
        });
        toast(`Inserted 1 page from ${file.name}`);
      } else {
        openPagePickerDialog({
          sourceId, sourceFormat: 'pdf', pageCount: numPages,
          mode: 'insert', targetIndex: afterIndex,
        });
      }
    } else {
      const mime = getMimeType(ext);
      const imgInfo = await loadImage(data, mime);
      setImageUrl(sourceId, imgInfo.objectUrl);
      setState((prev) => {
        const newPage = createPage({
          originalIndex: 0, sourceId, sourceFormat: 'image',
          width: imgInfo.width, height: imgInfo.height,
        });
        const pages = [...prev.pages];
        pages.splice(afterIndex + 1, 0, newPage);
        return { ...prev, pages, currentPageIndex: afterIndex + 1, selectedPageIndices: [afterIndex + 1] };
      });
      toast(`Inserted image: ${file.name}`);
    }
  };

  const replacePageWithFile = async (pageIndex: number, file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isPdf = ext === 'pdf';
    const data = new Uint8Array(await file.arrayBuffer());
    const sourceId = `source-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    storePdfBinary(sourceId, data, file.name);

    if (isPdf) {
      const numPages = await loadPdf(data, sourceId);
      const dims = await getAllPageDimensions(sourceId);
      if (numPages === 1) {
        setState((prev) => {
          const pages = [...prev.pages];
          const oldPage = pages[pageIndex];
          if (!oldPage) return prev;
          const newPage = createPage({
            originalIndex: 0, sourceId, sourceFormat: 'pdf',
            width: dims[0].width, height: dims[0].height,
          });
          const newAnnotations = { ...prev.annotations };
          const oldAnns = newAnnotations[oldPage.id];
          if (oldAnns) {
            newAnnotations[newPage.id] = oldAnns.map((a) => ({ ...a, pageId: newPage.id }));
            delete newAnnotations[oldPage.id];
          }
          pages[pageIndex] = newPage;
          return { ...prev, pages, annotations: newAnnotations };
        });
        toast(`Replaced page with ${file.name}`);
      } else {
        openPagePickerDialog({
          sourceId, sourceFormat: 'pdf', pageCount: numPages,
          mode: 'replace', targetIndex: pageIndex,
        });
      }
    } else {
      const mime = getMimeType(ext);
      const imgInfo = await loadImage(data, mime);
      setImageUrl(sourceId, imgInfo.objectUrl);
      setState((prev) => {
        const pages = [...prev.pages];
        const oldPage = pages[pageIndex];
        if (!oldPage) return prev;
        const newPage = createPage({
          originalIndex: 0, sourceId, sourceFormat: 'image',
          width: imgInfo.width, height: imgInfo.height,
        });
        const newAnnotations = { ...prev.annotations };
        const oldAnns = newAnnotations[oldPage.id];
        if (oldAnns) {
          newAnnotations[newPage.id] = oldAnns.map((a) => ({ ...a, pageId: newPage.id }));
          delete newAnnotations[oldPage.id];
        }
        pages[pageIndex] = newPage;
        return { ...prev, pages, annotations: newAnnotations };
      });
      toast(`Replaced page with image: ${file.name}`);
    }
  };

  return { insertPagesFromSource, replacePageFromSource, insertPagesFromFile, replacePageWithFile };
}
