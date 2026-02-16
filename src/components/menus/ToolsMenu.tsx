import {
MenubarCheckboxItem,
MenubarContent, MenubarItem,
  MenubarMenu,   MenubarSeparator, MenubarShortcut, MenubarTrigger, } from '@/components/ui/menubar';

import { useAppState } from '@/hooks/useAppState';

import { TOOL_DEFINITIONS } from '@/constants/tools';

export function ToolsMenu() {
  const {
    isDocumentOpen, activeTool, isSketchRecognitionEnabled,
    currentPageIndex,
    setActiveTool, openResizeDialog, openInspectorDialog,
    toggleSketchRecognition, toggleColorAdjustmentPanel,
    openOcrDialog, openCompressPdfDialog, rotatePage,
  } = useAppState();

  const selectTool = (toolId: string) => {
    setActiveTool(toolId as typeof activeTool);
  };

  // Group tools by category for display
  const individualTools = TOOL_DEFINITIONS.filter((t) => t.group === 'individual');
  const shapesTools = TOOL_DEFINITIONS.filter((t) => t.group === 'shapes');
  const linesTools = TOOL_DEFINITIONS.filter((t) => t.group === 'lines');
  const markupTools = TOOL_DEFINITIONS.filter((t) => t.group === 'markup');
  const specialTools = TOOL_DEFINITIONS.filter((t) => t.group === 'special');

  return (
    <MenubarMenu>
      <MenubarTrigger>Tools</MenubarTrigger>
      <MenubarContent>
        {individualTools.map((tool) => (
          <MenubarCheckboxItem
            key={tool.id}
            checked={activeTool === tool.id}
            onCheckedChange={() => selectTool(tool.id)}
            disabled={!isDocumentOpen}
          >
            {tool.label}
            {tool.shortcut && <MenubarShortcut>{tool.shortcut}</MenubarShortcut>}
          </MenubarCheckboxItem>
        ))}
        <MenubarSeparator />
        {shapesTools.map((tool) => (
          <MenubarCheckboxItem
            key={tool.id}
            checked={activeTool === tool.id}
            onCheckedChange={() => selectTool(tool.id)}
            disabled={!isDocumentOpen}
          >
            {tool.label}
            {tool.shortcut && <MenubarShortcut>{tool.shortcut}</MenubarShortcut>}
          </MenubarCheckboxItem>
        ))}
        <MenubarSeparator />
        {linesTools.map((tool) => (
          <MenubarCheckboxItem
            key={tool.id}
            checked={activeTool === tool.id}
            onCheckedChange={() => selectTool(tool.id)}
            disabled={!isDocumentOpen}
          >
            {tool.label}
            {tool.shortcut && <MenubarShortcut>{tool.shortcut}</MenubarShortcut>}
          </MenubarCheckboxItem>
        ))}
        <MenubarSeparator />
        {markupTools.map((tool) => (
          <MenubarCheckboxItem
            key={tool.id}
            checked={activeTool === tool.id}
            onCheckedChange={() => selectTool(tool.id)}
            disabled={!isDocumentOpen}
          >
            {tool.label}
            {tool.shortcut && <MenubarShortcut>{tool.shortcut}</MenubarShortcut>}
          </MenubarCheckboxItem>
        ))}
        <MenubarSeparator />
        {specialTools.map((tool) => (
          <MenubarCheckboxItem
            key={tool.id}
            checked={activeTool === tool.id}
            onCheckedChange={() => selectTool(tool.id)}
            disabled={!isDocumentOpen}
          >
            {tool.label}
            {tool.shortcut && <MenubarShortcut>{tool.shortcut}</MenubarShortcut>}
          </MenubarCheckboxItem>
        ))}
        <MenubarSeparator />
        <MenubarCheckboxItem
          checked={isSketchRecognitionEnabled}
          onCheckedChange={toggleSketchRecognition}
          disabled={!isDocumentOpen}
        >
          Sketch Recognition
        </MenubarCheckboxItem>
        <MenubarSeparator />
        <MenubarItem onClick={openResizeDialog} disabled={!isDocumentOpen}>
          Adjust Size…
        </MenubarItem>
        <MenubarItem onClick={toggleColorAdjustmentPanel} disabled={!isDocumentOpen}>
          Color Adjustments…
        </MenubarItem>
        <MenubarItem onClick={openOcrDialog} disabled={!isDocumentOpen}>
          OCR / Live Text…
        </MenubarItem>
        <MenubarItem onClick={openCompressPdfDialog} disabled={!isDocumentOpen}>
          Compress PDF…
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={openInspectorDialog} disabled={!isDocumentOpen}>
          Show Inspector
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={() => rotatePage(currentPageIndex, 'left')} disabled={!isDocumentOpen}>
          Rotate Left<MenubarShortcut>Ctrl+L</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => rotatePage(currentPageIndex, 'right')} disabled={!isDocumentOpen}>
          Rotate Right<MenubarShortcut>Ctrl+R</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
