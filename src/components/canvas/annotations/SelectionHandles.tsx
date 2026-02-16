// Resize handles overlay for selected annotations

import { getHandles } from '@/lib/annotationHelpers';

import type { Handle } from '@/lib/annotationHelpers';
import type { Annotation } from '@/types/annotation';

interface SelectionHandlesProps {
  annotation: Annotation;
  onHandleMouseDown: (e: React.MouseEvent, handle: Handle) => void;
}

const HANDLE_SIZE = 8;
const HALF = HANDLE_SIZE / 2;

export function SelectionHandles({ annotation, onHandleMouseDown }: SelectionHandlesProps) {
  const handles = getHandles(annotation);

  return (
    <g>
      {handles.map((handle) => (
        <rect
          key={handle.type}
          x={handle.x - HALF}
          y={handle.y - HALF}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="white"
          stroke="#3b82f6"
          strokeWidth={1.5}
          cursor={handle.cursor}
          onMouseDown={(e) => {
            e.stopPropagation();
            onHandleMouseDown(e, handle);
          }}
        />
      ))}
    </g>
  );
}
