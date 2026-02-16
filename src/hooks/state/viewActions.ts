import { DEFAULT_COLOR_ADJUSTMENT } from '@/lib/colorAdjustment';
import { calculateFitPage, calculateFitWidth } from '@/lib/zoom';

import type { SetState } from '@/hooks/state/types';
import type { AppState, ColorAdjustment, Tool, ZoomLevel } from '@/types/app';

export function createViewActions(state: AppState, setState: SetState) {
  const setActiveTool = (tool: Tool) => {
    setState((prev) => ({ ...prev, activeTool: tool }));
  };

  const setZoom = (zoom: ZoomLevel) => {
    setState((prev) => ({ ...prev, zoom }));
  };

  const toggleSidebar = () => {
    setState((prev) => ({ ...prev, isSidebarVisible: !prev.isSidebarVisible }));
  };

  const setCurrentPageIndex = (index: number) => {
    setState((prev) => {
      const clamped = Math.max(0, Math.min(index, prev.pages.length - 1));
      return { ...prev, currentPageIndex: clamped, selectedPageIndices: [clamped] };
    });
  };

  const toggleFullscreen = () => {
    setState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  const fitWidth = () => {
    const sidebarWidth = state.isSidebarVisible ? 240 : 0;
    const canvasWidth = window.innerWidth - sidebarWidth;
    const currentPg = state.pages[state.currentPageIndex];
    setState((prev) => ({ ...prev, zoom: calculateFitWidth(canvasWidth, currentPg?.width) }));
  };

  const fitPage = () => {
    const sidebarWidth = state.isSidebarVisible ? 240 : 0;
    const canvasWidth = window.innerWidth - sidebarWidth;
    const canvasHeight = window.innerHeight - 120;
    const currentPg = state.pages[state.currentPageIndex];
    setState((prev) => ({
      ...prev,
      zoom: calculateFitPage(canvasWidth, canvasHeight, currentPg?.width, currentPg?.height),
    }));
  };

  const searchNext = () => {
    setState((prev) => {
      if (prev.searchMatchTotal === 0) return prev;
      const newIndex = (prev.searchMatchIndex + 1) % prev.searchMatchTotal;
      const match = prev.searchMatches[newIndex];
      const pageIdx = match ? prev.pages.findIndex(p => p.id === match.pageId) : -1;
      return {
        ...prev,
        searchMatchIndex: newIndex,
        ...(pageIdx >= 0 ? { currentPageIndex: pageIdx, selectedPageIndices: [pageIdx] } : {}),
      };
    });
  };

  const searchPrevious = () => {
    setState((prev) => {
      if (prev.searchMatchTotal === 0) return prev;
      const newIndex = (prev.searchMatchIndex - 1 + prev.searchMatchTotal) % prev.searchMatchTotal;
      const match = prev.searchMatches[newIndex];
      const pageIdx = match ? prev.pages.findIndex(p => p.id === match.pageId) : -1;
      return {
        ...prev,
        searchMatchIndex: newIndex,
        ...(pageIdx >= 0 ? { currentPageIndex: pageIdx, selectedPageIndices: [pageIdx] } : {}),
      };
    });
  };

  const setViewMode = (mode: 'single' | 'contact-sheet') => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  };

  const toggleViewMode = () => {
    setState((prev) => ({
      ...prev, viewMode: prev.viewMode === 'single' ? 'contact-sheet' : 'single',
    }));
  };

  const toggleSketchRecognition = () => {
    setState((prev) => ({ ...prev, isSketchRecognitionEnabled: !prev.isSketchRecognitionEnabled }));
  };

  const setMaskRect = (rect: AppState['maskRect']) => {
    setState((prev) => ({ ...prev, maskRect: rect }));
  };

  const clearMask = () => setState((prev) => ({ ...prev, maskRect: null }));

  const setLoupePosition = (pos: { x: number; y: number } | null) => {
    setState((prev) => ({ ...prev, loupePosition: pos }));
  };

  const setLoupeMagnification = (mag: number) => {
    setState((prev) => ({ ...prev, loupeMagnification: mag }));
  };

  const setColorAdjustment = (adj: Partial<ColorAdjustment>) => {
    setState((prev) => ({
      ...prev, colorAdjustment: { ...prev.colorAdjustment, ...adj },
    }));
  };

  const resetColorAdjustment = () => {
    setState((prev) => ({ ...prev, colorAdjustment: DEFAULT_COLOR_ADJUSTMENT }));
  };

  const toggleColorAdjustmentPanel = () => {
    setState((prev) => ({ ...prev, isColorAdjustmentPanelOpen: !prev.isColorAdjustmentPanelOpen }));
  };

  const setCropMode = (active: boolean) => {
    setState((prev) => ({ ...prev, isCropMode: active, cropRect: active ? prev.cropRect : null }));
  };

  const setCropRect = (rect: AppState['cropRect']) => {
    setState((prev) => ({ ...prev, cropRect: rect }));
  };

  const applyCrop = () => {
    setState((prev) => ({ ...prev, isCropMode: false, cropRect: null }));
  };

  const setFormFieldValue = (fieldId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      formFields: prev.formFields.map((f) => f.id === fieldId ? { ...f, value } : f),
    }));
  };

  const toggleFormMode = () => setState((prev) => ({ ...prev, isFormMode: !prev.isFormMode }));
  const setPrintMode = (active: boolean) => setState((prev) => ({ ...prev, isPrintMode: active }));
  const setBatchProgress = (progress: number | null) => setState((prev) => ({ ...prev, batchProgress: progress }));

  return {
    setActiveTool, setZoom, toggleSidebar, setCurrentPageIndex, toggleFullscreen,
    fitWidth, fitPage, searchNext, searchPrevious,
    setViewMode, toggleViewMode, toggleSketchRecognition,
    setMaskRect, clearMask, setLoupePosition, setLoupeMagnification,
    setColorAdjustment, resetColorAdjustment, toggleColorAdjustmentPanel,
    setCropMode, setCropRect, applyCrop,
    setFormFieldValue, toggleFormMode, setPrintMode, setBatchProgress,
  };
}
