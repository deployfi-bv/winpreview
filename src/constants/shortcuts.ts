export interface ShortcutDefinition {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  requiresDocument: boolean;
  action: string;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  // File operations
  { key: 'n', ctrl: true, requiresDocument: false, action: 'new-from-clipboard' },
  { key: 'o', ctrl: true, requiresDocument: false, action: 'open' },
  { key: 'w', ctrl: true, requiresDocument: true, action: 'close' },
  { key: 's', ctrl: true, requiresDocument: true, action: 'save' },
  { key: 's', ctrl: true, shift: true, requiresDocument: true, action: 'save-as' },
  { key: 'p', ctrl: true, requiresDocument: true, action: 'print' },

  // Edit operations
  { key: 'z', ctrl: true, requiresDocument: true, action: 'undo' },
  { key: 'z', ctrl: true, shift: true, requiresDocument: true, action: 'redo' },
  { key: 'y', ctrl: true, requiresDocument: true, action: 'redo' },
  { key: 'x', ctrl: true, requiresDocument: true, action: 'cut' },
  { key: 'c', ctrl: true, requiresDocument: true, action: 'copy' },
  { key: 'v', ctrl: true, requiresDocument: true, action: 'paste' },
  { key: 'a', ctrl: true, requiresDocument: true, action: 'select-all' },
  { key: 'Delete', requiresDocument: true, action: 'delete' },
  { key: 'Backspace', requiresDocument: true, action: 'delete' },
  { key: 'k', ctrl: true, requiresDocument: true, action: 'crop' },

  // View / Navigation
  { key: '=', ctrl: true, requiresDocument: true, action: 'zoom-in' },
  { key: '-', ctrl: true, requiresDocument: true, action: 'zoom-out' },
  { key: '0', ctrl: true, requiresDocument: true, action: 'zoom-reset' },
  { key: '9', ctrl: true, requiresDocument: true, action: 'fit-width' },
  { key: '8', ctrl: true, requiresDocument: true, action: 'fit-page' },
  { key: 'F11', requiresDocument: false, action: 'fullscreen' },
  { key: 'g', ctrl: true, requiresDocument: true, action: 'go-to-page' },
  { key: 'f', ctrl: true, requiresDocument: true, action: 'find' },
  { key: 'j', ctrl: true, requiresDocument: true, action: 'contact-sheet' },

  // Window operations
  { key: 'm', ctrl: true, requiresDocument: false, action: 'minimize' },

  // Page operations
  { key: 'l', ctrl: true, requiresDocument: true, action: 'rotate-left' },
  { key: 'r', ctrl: true, requiresDocument: true, action: 'rotate-right' },

  // Navigation
  { key: 'PageUp', requiresDocument: true, action: 'page-prev' },
  { key: 'PageDown', requiresDocument: true, action: 'page-next' },
  { key: 'Home', requiresDocument: true, action: 'page-first' },
  { key: 'End', requiresDocument: true, action: 'page-last' },

  // Escape
  { key: 'Escape', requiresDocument: false, action: 'escape' },

  // Tool shortcuts (single letter, no modifiers)
  { key: 'v', requiresDocument: true, action: 'tool-selection' },
  { key: 'r', requiresDocument: true, action: 'tool-rectangle' },
  { key: 'o', requiresDocument: true, action: 'tool-oval' },
  { key: 'l', requiresDocument: true, action: 'tool-line' },
  { key: 'a', requiresDocument: true, action: 'tool-arrow' },
  { key: 't', requiresDocument: true, action: 'tool-text' },
  { key: 'd', requiresDocument: true, action: 'tool-freehand' },
  { key: 's', requiresDocument: true, action: 'tool-signature' },
  { key: 'h', requiresDocument: true, action: 'tool-highlight' },
  { key: 'u', requiresDocument: true, action: 'tool-underline' },
  { key: 'k', requiresDocument: true, action: 'tool-strikethrough' },
  { key: 'n', requiresDocument: true, action: 'tool-sticky-note' },
  { key: 'm', requiresDocument: true, action: 'tool-mask' },
];
