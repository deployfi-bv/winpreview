import { Group, Panel, Separator } from 'react-resizable-panels';

import { CanvasArea } from '@/components/canvas/CanvasArea';
import { PrintView } from '@/components/canvas/PrintView';
import {
AboutDialog, CompressPdfDialog,
DeletePageDialog, ExportDialog,   GoToPageDialog, InspectorDialog, OcrDialog,   PagePickerDialog,
PasswordDialog, ResizeDialog,
  SignaturePadDialog, TetrisDialog, } from '@/components/dialogs';
import { AppMenubar } from '@/components/menus/AppMenubar';
import { ColorAdjustmentPanel } from '@/components/panels/ColorAdjustmentPanel';
import { ThumbnailPanel } from '@/components/sidebar/ThumbnailPanel';
import { MainToolbar } from '@/components/toolbar/MainToolbar';
import { PropertiesBar } from '@/components/toolbar/PropertiesBar';

import { useAppState } from '@/hooks/useAppState';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

import { CropToolbar } from './CropToolbar';
import { StatusBar } from './StatusBar';

export function AppShell() {
  const {
    isSidebarVisible, isFullscreen, isCropMode, isPrintMode,
    pages, formFields,
    toggleFullscreen,
  } = useAppState();
  useKeyboardShortcuts();

  // Fullscreen: hide menubar, toolbar, sidebar, status bar
  if (isFullscreen) {
    return (
      <div className="flex h-screen flex-col bg-background text-foreground">
        {/* Hover-peek toolbar at top in fullscreen */}
        <div className="group/fullscreen relative">
          <div className="absolute left-0 right-0 top-0 z-50 translate-y-[-100%] opacity-0 transition-all duration-200 group-hover/fullscreen:translate-y-0 group-hover/fullscreen:opacity-100">
            <div className="flex items-center justify-between bg-background/95 border-b px-3 py-1 backdrop-blur">
              <span className="text-xs text-muted-foreground">Fullscreen — press F11 or Esc to exit</span>
              <button onClick={toggleFullscreen} className="text-xs text-muted-foreground hover:text-foreground">
                Exit Fullscreen
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <CanvasArea />
        </div>
        <GoToPageDialog />
        <DeletePageDialog />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div data-print-hide>
        <AppMenubar />
        <MainToolbar />
        <PropertiesBar />
        {isCropMode && <CropToolbar />}
      </div>

      <div className="flex flex-1 overflow-hidden" data-print-hide>
        <div className="flex-1 overflow-hidden">
          <Group orientation="horizontal">
            {isSidebarVisible && (
              <>
                <Panel defaultSize="20%" minSize="15%" maxSize="35%">
                  <ThumbnailPanel />
                </Panel>
                <Separator className="w-1 bg-border hover:bg-ring transition-colors cursor-col-resize" />
              </>
            )}
            <Panel defaultSize={isSidebarVisible ? '80%' : '100%'}>
              <CanvasArea />
            </Panel>
          </Group>
        </div>
        <ColorAdjustmentPanel />
      </div>

      <div data-print-hide>
        <StatusBar />
      </div>

      {/* Print view — hidden on screen, shown on print */}
      {isPrintMode && (
        <PrintView pages={pages} formFields={formFields} />
      )}

      <GoToPageDialog />
      <InspectorDialog />
      <ExportDialog />
      <ResizeDialog />
      <SignaturePadDialog />
      <PasswordDialog />
      <OcrDialog />
      <DeletePageDialog />
      <AboutDialog />
      <PagePickerDialog />
      <TetrisDialog />
      <CompressPdfDialog />
    </div>
  );
}
