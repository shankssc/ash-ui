// ash-ui/src/components/virtualized-table/sub-components/resize-handle.tsx
import * as React from 'react';
import { cn } from '@/utils/cn';

export interface ResizeHandleProps {
  /** Column ID being resized */
  columnId: string;
  /** Start resize handler */
  onResizeStart: (columnId: string, event: React.MouseEvent) => void;
  /** Custom className */
  className?: string;
}

/**
 * ResizeHandle - Drag handle for column resizing
 *
 * Provides a visual handle for users to drag and resize columns.
 * Implements proper cursor and hover states for UX.
 *
 * @example
 * ```tsx
 * <ResizeHandle
 *   columnId="name"
 *   onResizeStart={handleResizeStart}
 * />
 * ```
 */
export const ResizeHandle = (props: ResizeHandleProps) => {
  const { columnId, onResizeStart, className } = props;

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent) => {
      onResizeStart(columnId, event);
    },
    [columnId, onResizeStart],
  );

  return (
    <div
      className={cn(
        'absolute bottom-0 right-0 top-0 w-1 cursor-col-resize transition-all hover:w-1.5 hover:bg-primary-500 dark:hover:bg-primary-400',
        className,
      )}
      onMouseDown={handleMouseDown}
      data-testid={`resize-handle-${columnId}`}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${columnId} column`}
      tabIndex={0}
      onKeyDown={(e) => {
        // Keyboard resizing support (optional enhancement)
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          // Could implement keyboard resizing here
        }
      }}
    />
  );
};

ResizeHandle.displayName = 'ResizeHandle';
