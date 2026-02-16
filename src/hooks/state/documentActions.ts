import { generateId } from '@/lib/annotationFactory';

import { INITIAL_APP_STATE } from '@/types/appDefaults';
import { createPage, DEFAULT_PAGE_HEIGHT, DEFAULT_PAGE_WIDTH } from '@/types/page';

import type { SetState } from '@/hooks/state/types';
import type { PdfLink } from '@/services/pdfFormService';
import type { FormField } from '@/types/app';

import { clearImage, getMimeType, loadImage, setImageUrl } from '@/services/imageService';
import { clearAllPdfBinaries, storePdfBinary } from '@/services/pdfBinaryStore';
import { extractFormFields, extractPdfLinks } from '@/services/pdfFormService';
import { closePdf, getAllPageDimensions, loadPdf } from '@/services/pdfService';
import { getPageTextContent } from '@/services/pdfTextService';

export function createDocumentActions(setState: SetState) {
  const openDocument = async (filename: string, format: string, data: Uint8Array) => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setState((prev) => ({ ...prev, isDocumentLoading: true }));

    try {
      if (format === 'pdf') {
        let password: string | undefined;

        // Try to load PDF; if password-protected, prompt for password
        try {
          await loadPdf(data, sessionId, password);
        } catch (err) {
          // Check if this is a password exception
          if (err instanceof Error && err.name === 'PasswordException') {
            password = window.prompt('This PDF is password-protected. Enter password:') || undefined;
            if (!password) {
              setState((prev) => ({ ...prev, isDocumentLoading: false }));
              return;
            }
            // Retry with password
            await loadPdf(data, sessionId, password);
          } else {
            throw err;
          }
        }

        const dimensions = await getAllPageDimensions(sessionId);
        const newPages = dimensions.map((dim, i) => createPage({
          originalIndex: i, width: dim.width, height: dim.height,
          sourceId: sessionId, sourceFormat: 'pdf',
        }));
        storePdfBinary(sessionId, data, filename);

        let fields: FormField[] = [];
        let links: PdfLink[] = [];
        try { fields = await extractFormFields(sessionId, newPages); } catch { /* non-fatal */ }
        try { links = await extractPdfLinks(sessionId, newPages); } catch { /* non-fatal */ }

        // Extract native text from PDF pages for search
        const nativeText: Record<string, string> = {};
        for (const page of newPages) {
          if (page.sourceFormat === 'pdf') {
            try {
              const items = await getPageTextContent(page.originalIndex + 1, page.sourceId);
              if (items.length > 0) {
                nativeText[page.id] = items.map(i => i.str).join(' ');
              }
            } catch { /* non-fatal */ }
          }
        }

        setState((prev) => ({
          ...prev, isDocumentOpen: true, isDocumentLoading: false,
          documentSessionId: sessionId, filename, format,
          pages: newPages, currentPageIndex: 0,
          formFields: fields, isFormMode: fields.length > 0,
          pdfLinks: links,
          nativeText,
        }));
      } else {
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'png';
        const mime = getMimeType(ext);
        const imgInfo = await loadImage(data, mime);
        setImageUrl(sessionId, imgInfo.objectUrl);
        const newPages = [createPage({
          originalIndex: 0, width: imgInfo.width, height: imgInfo.height,
          sourceId: sessionId, sourceFormat: 'image',
        })];
        storePdfBinary(sessionId, data, filename);
        setState((prev) => ({
          ...prev, isDocumentOpen: true, isDocumentLoading: false,
          documentSessionId: sessionId, filename, format,
          pages: newPages, currentPageIndex: 0,
          formFields: [], isFormMode: false,
          pdfLinks: [],
        }));
      }
    } catch (err) {
      setState((prev) => ({ ...prev, isDocumentLoading: false }));
      throw err;
    }
  };

  const closeDocument = async () => {
    await closePdf();
    clearImage();
    clearAllPdfBinaries();
    setState(INITIAL_APP_STATE);
  };

  const newDocument = async () => {
    // Close any existing document first
    await closeDocument();

    // Create a blank page with default dimensions
    const sourceId = generateId();
    const blankPage = createPage({
      originalIndex: 0,
      width: DEFAULT_PAGE_WIDTH,
      height: DEFAULT_PAGE_HEIGHT,
      sourceId,
      sourceFormat: 'image',
    });

    setState((prev) => ({
      ...prev,
      isDocumentOpen: true,
      isDocumentLoading: false,
      documentSessionId: sourceId,
      filename: 'Untitled',
      format: 'image',
      pages: [blankPage],
      currentPageIndex: 0,
      formFields: [],
      isFormMode: false,
      pdfLinks: [],
    }));
  };

  return {
    openDocument,
    closeDocument,
    newDocument,
  };
}
