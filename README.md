# WinPreview

A Windows-friendly, local-first document viewer and editor for multi-page PDFs and images. Quickly assemble documents at page level — reorder, delete, replace pages, add annotations and text overlays, and export flattened PDFs. All processing runs client-side with zero external services.

**[Live Demo](https://winpreview-demo.surge.sh)**

![Swarm Architecture](agentic_swarm.png)

## Features

- **Document handling** — Open PDFs (including password-protected) and images; drag & drop from OS
- **Page operations** — Reorder, rotate, flip, crop, insert, delete, replace pages; multi-page selection (Shift/Ctrl+click)
- **Annotations** — Rectangle, oval, line, arrow, freehand, text, signature, highlight, underline, strikethrough, redaction, sticky notes, star, polygon, speech balloon
- **Selection & editing** — 8-handle resize, drag-to-move, clipboard (copy/cut/paste), undo/redo stack, Select All
- **Text & search** — Native PDF text selection and copy, full-text search with match highlighting (Ctrl+F), case-sensitive toggle, prev/next navigation
- **OCR** — On-device OCR via PaddleOCR (ONNX Runtime), auto language detection (English/Latin/Cyrillic), invisible text layer in exported PDFs
- **PDF compression** — Downscale + JPEG recompress scanned pages with 3 size presets (Email ~200KB/pg, Compact ~100KB/pg, Light ~150KB/pg), optional OCR, undo support
- **Views** — Zoom (fit width/fit page/actual size), contact sheet, loupe magnifier, mask tool, fullscreen
- **PDF forms** — Interactive form field filling with checkbox, radio, text, dropdown support; editable or flattened export
- **Clickable links** — PDF hyperlinks rendered as clickable overlays
- **Color adjustment** — Brightness, contrast, saturation, hue rotation per page
- **Export** — Flattened PDF with annotations baked in, multi-format (PDF/PNG/JPEG), batch export, multi-source assembly
- **Persistence** — Auto-save to IndexedDB, crash recovery on reload
- **Sketch recognition** — Freehand auto-snaps to circles, rectangles, lines, triangles
- **Print** — Full print support with annotation overlays and form field flattening
- **Easter egg** — Classic Tetris game hidden in Help menu

## Tech Stack

- **React 19** + **TypeScript 5.9** (strict) + **Vite 7**
- **Tailwind CSS 4** + **Radix UI** (shadcn/ui) + **Lucide icons**
- **pdf.js** — PDF parsing and rendering
- **pdf-lib** — PDF export with annotation flattening
- **ONNX Runtime Web** — On-device OCR inference (PaddleOCR PP-OCRv3/v5 models)
- **@tanstack/react-virtual** — Virtualized thumbnail sidebar
- **IndexedDB (idb)** — Client-side persistence
- **Vitest** + **Playwright** — 442 unit tests + E2E testing

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build

```bash
npm run build
npm run preview   # serve production build locally
```

## Testing

```bash
npm test              # unit tests (442 tests)
npm run test:coverage # with coverage report
```

## Architecture

Frontend-only SPA — no backend. All document processing (PDF parsing, OCR, export, compression) runs in the browser via Web Workers and WASM. Annotations are stored as vector models (source of truth), rendered to canvas, and flattened into PDF on export.

Built with an agentic swarm development process — orchestrator delegates to specialist agents (planner, coder, gatekeeper, QA, UX reviewer) with full Playwright-based quality gates on every change.

## License

Apache License 2.0 — see [LICENSE](LICENSE).
