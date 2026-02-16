// Renders text annotations with inline editing support

import { useCallback, useEffect, useRef, useState } from 'react';

import { isTextAnnotation } from '@/types/annotation';

import { renderMonospaceLines } from './monospaceRenderer';
import { saveTextContent } from './textEditHelpers';

import type { AnnotationRendererProps } from './renderHelpers';
import type { Annotation, TextAnnotation as TextAnnotationType } from '@/types/annotation';

export function tryRenderText(
  annotation: Annotation,
  isSelected: boolean,
  onMouseDown: (e: React.MouseEvent) => void,
  onUpdateAnnotation: AnnotationRendererProps['onUpdateAnnotation'],
  cursor?: string,
): React.ReactElement | null {
  if (!isTextAnnotation(annotation)) return null;
  return (
    <TextAnnotationView
      annotation={annotation}
      isSelected={isSelected}
      onMouseDown={onMouseDown}
      onUpdateAnnotation={onUpdateAnnotation}
      cursor={cursor}
    />
  );
}

interface TextAnnotationViewProps {
  annotation: TextAnnotationType;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onUpdateAnnotation: AnnotationRendererProps['onUpdateAnnotation'];
  cursor?: string;
}

function TextAnnotationView({ annotation, isSelected, onMouseDown, onUpdateAnnotation, cursor }: TextAnnotationViewProps) {
  const [editRequested, setEditRequested] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingContentRef = useRef<string | null>(null);
  const wasEditingRef = useRef(false);
  const isEditing = editRequested && isSelected;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      pendingContentRef.current = annotation.content; // Initialize with current content
    }
  }, [isEditing, annotation.content]);

  // Save content when editing ends (isEditing transitions from true to false)
  useEffect(() => {
    if (wasEditingRef.current && !isEditing && pendingContentRef.current !== null) {
      const newContent = pendingContentRef.current;
      pendingContentRef.current = null;
      saveTextContent(newContent, annotation, onUpdateAnnotation);
    }
    wasEditingRef.current = isEditing;
  }, [isEditing, annotation, onUpdateAnnotation]);

  const handleEditChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    pendingContentRef.current = e.target.value;
  }, []);

  const handleEditBlur = useCallback(() => {
    const pendingContent = pendingContentRef.current;
    pendingContentRef.current = null; // Prevent double-save from useEffect

    if (textareaRef.current) {
      saveTextContent(textareaRef.current.value, annotation, onUpdateAnnotation);
    } else if (pendingContent !== null) {
      // Textarea already unmounted — use pending content
      saveTextContent(pendingContent, annotation, onUpdateAnnotation);
    }
    setEditRequested(false);
  }, [annotation, onUpdateAnnotation]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      setEditRequested(false);
    }
  }, []);

  const handleTextMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) {
      onMouseDown(e);
    }
  };

  const handleTextDoubleClick = (e: React.MouseEvent) => {
    if (isSelected) {
      e.stopPropagation();
      setEditRequested(true);
    }
  };

  const { x, y, width, height, content, fontFamily, fontSize, color, bold, italic, alignment } = annotation;
  const isMonospace = alignment === 'monospace';
  const resolvedFont = isMonospace ? 'Courier New, Consolas, monospace' : fontFamily;
  const resolvedAlign = isMonospace ? 'left' : alignment;

  // Calculate minimum height needed for content
  const lineCount = content.split('\n').length;
  const lineHeightPx = fontSize * 1.2;
  const contentMinHeight = lineCount * lineHeightPx + 4; // padding
  const effectiveHeight = Math.max(height, contentMinHeight);

  const fontStyle: React.CSSProperties = {
    fontFamily: resolvedFont, fontSize: `${fontSize}px`, color,
    fontWeight: bold ? 'bold' : 'normal', fontStyle: italic ? 'italic' : 'normal',
    textAlign: resolvedAlign, overflow: 'visible', wordWrap: 'break-word',
    lineHeight: 1.2, padding: '2px', boxSizing: 'border-box',
    whiteSpace: 'pre-wrap',
  };

  return (
    <foreignObject x={x} y={y} width={width} height={effectiveHeight}
      cursor={isEditing ? 'text' : (cursor ?? undefined)}
      onMouseDown={handleTextMouseDown}
      onDoubleClick={handleTextDoubleClick}>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          defaultValue={content}
          onChange={handleEditChange}
          onBlur={handleEditBlur}
          onKeyDown={handleEditKeyDown}
          style={{
            ...fontStyle,
            width: '100%', height: '100%',
            border: '1px solid #3b82f6', outline: 'none',
            background: 'rgba(255,255,255,0.9)', resize: 'none',
          }}
        />
      ) : (
        <div
          style={{
            ...fontStyle,
            width: '100%', height: '100%',
            border: isSelected ? '1px dashed #3b82f6' : '1px dashed transparent',
          }}
        >
          {isMonospace ? renderMonospaceLines(content, width, fontSize) : content}
        </div>
      )}
    </foreignObject>
  );
}
