import { describe, expect, it } from 'vitest'

import { INITIAL_APP_STATE } from '@/types/appDefaults'

describe('INITIAL_APP_STATE', () => {
  it('has no document open', () => {
    expect(INITIAL_APP_STATE.isDocumentOpen).toBe(false)
    expect(INITIAL_APP_STATE.isDocumentLoading).toBe(false)
    expect(INITIAL_APP_STATE.documentSessionId).toBeNull()
    expect(INITIAL_APP_STATE.filename).toBeNull()
    expect(INITIAL_APP_STATE.format).toBeNull()
  })

  it('has empty pages', () => {
    expect(INITIAL_APP_STATE.pages).toEqual([])
    expect(INITIAL_APP_STATE.currentPageIndex).toBe(0)
    expect(INITIAL_APP_STATE.selectedPageIndices).toEqual([0])
  })

  it('has default view state', () => {
    expect(INITIAL_APP_STATE.zoom).toBe(1.0)
    expect(INITIAL_APP_STATE.activeTool).toBe('selection')
    expect(INITIAL_APP_STATE.isSidebarVisible).toBe(true)
    expect(INITIAL_APP_STATE.isFullscreen).toBe(false)
    expect(INITIAL_APP_STATE.viewMode).toBe('single')
  })

  it('has all dialogs closed', () => {
    expect(INITIAL_APP_STATE.isGoToPageDialogOpen).toBe(false)
    expect(INITIAL_APP_STATE.isExportDialogOpen).toBe(false)
    expect(INITIAL_APP_STATE.isResizeDialogOpen).toBe(false)
    expect(INITIAL_APP_STATE.isInspectorDialogOpen).toBe(false)
    expect(INITIAL_APP_STATE.isSignaturePadOpen).toBe(false)
    expect(INITIAL_APP_STATE.isPasswordDialogOpen).toBe(false)
    expect(INITIAL_APP_STATE.isOcrDialogOpen).toBe(false)
    expect(INITIAL_APP_STATE.isDeletePageDialogOpen).toBe(false)
    expect(INITIAL_APP_STATE.isAboutDialogOpen).toBe(false)
    expect(INITIAL_APP_STATE.isPagePickerDialogOpen).toBe(false)
    expect(INITIAL_APP_STATE.isCropMode).toBe(false)
  })

  it('has empty annotations', () => {
    expect(INITIAL_APP_STATE.annotations).toEqual({})
    expect(INITIAL_APP_STATE.selectedAnnotationId).toBeNull()
    expect(INITIAL_APP_STATE.selectedAnnotationIds).toEqual([])
  })

  it('has empty undo/redo stacks', () => {
    expect(INITIAL_APP_STATE.undoStack).toEqual([])
    expect(INITIAL_APP_STATE.redoStack).toEqual([])
  })

  it('has null clipboard', () => {
    expect(INITIAL_APP_STATE.clipboard).toBeNull()
  })

  it('has default color adjustment (all zeros)', () => {
    const ca = INITIAL_APP_STATE.colorAdjustment
    expect(ca.exposure).toBe(0)
    expect(ca.contrast).toBe(0)
    expect(ca.highlights).toBe(0)
    expect(ca.shadows).toBe(0)
    expect(ca.saturation).toBe(0)
    expect(ca.temperature).toBe(0)
    expect(ca.tint).toBe(0)
    expect(ca.sharpness).toBe(0)
    expect(ca.sepia).toBe(0)
  })

  it('has search state reset', () => {
    expect(INITIAL_APP_STATE.isSearchBarVisible).toBe(false)
    expect(INITIAL_APP_STATE.searchQuery).toBe('')
    expect(INITIAL_APP_STATE.isCaseSensitive).toBe(false)
  })

  it('has mask/loupe/crop reset', () => {
    expect(INITIAL_APP_STATE.maskRect).toBeNull()
    expect(INITIAL_APP_STATE.loupePosition).toBeNull()
    expect(INITIAL_APP_STATE.loupeMagnification).toBe(2)
    expect(INITIAL_APP_STATE.cropRect).toBeNull()
  })

  it('has form state reset', () => {
    expect(INITIAL_APP_STATE.formFields).toEqual([])
    expect(INITIAL_APP_STATE.isFormMode).toBe(false)
  })

  it('has batch progress null', () => {
    expect(INITIAL_APP_STATE.batchProgress).toBeNull()
  })

  it('has print mode off', () => {
    expect(INITIAL_APP_STATE.isPrintMode).toBe(false)
  })
})
