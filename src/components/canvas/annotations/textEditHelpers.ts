// Helper functions for text annotation editing

import type { TextAnnotation as TextAnnotationType } from '@/types/annotation';

interface UpdateCallback {
  (annotationId: string, updates: Partial<TextAnnotationType>): void;
}

export function saveTextContent(
  newContent: string,
  annotation: TextAnnotationType,
  onUpdateAnnotation?: UpdateCallback
): void {
  const updates: Partial<TextAnnotationType> = {};

  if (newContent !== annotation.content) {
    updates.content = newContent;
  }

  const lineCount = newContent.split('\n').length;
  const neededHeight = lineCount * annotation.fontSize * 1.2 + 4;
  if (neededHeight > annotation.height) {
    updates.height = neededHeight;
  }

  if (Object.keys(updates).length > 0) {
    onUpdateAnnotation?.(annotation.id, updates);
  }
}
