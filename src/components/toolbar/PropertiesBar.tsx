import { useAppState } from '@/hooks/useAppState';

import { FreehandProperties } from './properties/FreehandProperties';
import { LineProperties } from './properties/LineProperties';
import { LoupeProperties } from './properties/LoupeProperties';
import { MaskProperties } from './properties/MaskProperties';
import { PolygonProperties } from './properties/PolygonProperties';
import { RedactionProperties } from './properties/RedactionProperties';
import { ShapeProperties } from './properties/ShapeProperties';
import { SignatureProperties } from './properties/SignatureProperties';
import { SpeechBalloonProperties } from './properties/SpeechBalloonProperties';
import { StarProperties } from './properties/StarProperties';
import { StickyNoteProperties } from './properties/StickyNoteProperties';
import { TextMarkupProperties } from './properties/TextMarkupProperties';
import { TextProperties } from './properties/TextProperties';

import type { Tool } from '@/types/app';

const TOOL_PROPERTIES: Record<string, () => React.JSX.Element> = {
  rectangle: () => <ShapeProperties />,
  oval: () => <ShapeProperties />,
  line: () => <LineProperties />,
  arrow: () => <LineProperties showArrowheads />,
  text: () => <TextProperties />,
  freehand: () => <FreehandProperties />,
  signature: () => <SignatureProperties />,
  highlight: () => <TextMarkupProperties />,
  underline: () => <TextMarkupProperties />,
  strikethrough: () => <TextMarkupProperties />,
  'sticky-note': () => <StickyNoteProperties />,
  star: () => <StarProperties />,
  polygon: () => <PolygonProperties />,
  'speech-balloon': () => <SpeechBalloonProperties />,
  redaction: () => <RedactionProperties />,
  mask: () => <MaskProperties />,
  loupe: () => <LoupeProperties />,
};

export function PropertiesBar() {
  const { activeTool, isDocumentOpen, getSelectedAnnotation } = useAppState();
  const selected = getSelectedAnnotation();

  if (!isDocumentOpen) return null;

  const propertiesKey = selected ? selected.type : activeTool;

  if (propertiesKey === 'selection') return null;

  const renderProperties = TOOL_PROPERTIES[propertiesKey as Tool];
  if (!renderProperties) return null;

  return (
    <div className="flex h-10 items-center gap-2 border-b px-3">
      {renderProperties()}
    </div>
  );
}
