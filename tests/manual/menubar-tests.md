# Manual Test: App Menu Bar

## Test Environment
- Browser: Chromium-based (Edge/Chrome)
- URL: http://localhost:5173/
- Date: 2026-02-14

## Prerequisites
- Dev server running (`npm run dev`)
- No document open (initial state)

---

## TC-MENU-01: Menu Bar Renders
- [ ] Menu bar visible at the very top of the app (above toolbar)
- [ ] 6 menu triggers visible: File, Edit, View, Tools, Window, Help
- [ ] Menu bar has dark theme (#1E1E1E background, light text)
- [ ] Menu bar height is compact (~32px)

## TC-MENU-02: File Menu — Full Content
- [ ] Click "File" → dropdown opens
- [ ] Items visible: New from Clipboard, Open…, Close, Save, Save As…, Export (submenu), Print…
- [ ] Keyboard shortcuts displayed: Ctrl+N, Ctrl+O, Ctrl+W, Ctrl+S, Ctrl+Shift+S, Ctrl+P
- [ ] Close, Save, Save As disabled (no document open)
- [ ] Export submenu trigger disabled (no document open)
- [ ] Open… and New from Clipboard are enabled (no document needed)
- [ ] Click "Open…" → toast shows "Action: Open File"
- [ ] Dropdown closes after clicking item

## TC-MENU-03: File > Export Submenu
- [ ] (Open a mock doc first if needed — or verify submenu trigger is disabled)
- [ ] Hover/click "Export" → submenu opens with PDF…, JPEG…, PNG…

## TC-MENU-04: Edit Menu — Full Content
- [ ] Click "Edit" → dropdown opens
- [ ] Items: Undo, Redo | Cut, Copy, Paste, Select All, Delete | Insert Page from File…, Insert Blank Page | Crop, Flip Horizontal, Flip Vertical
- [ ] Separators between groups
- [ ] Most items disabled when no document open
- [ ] Paste is enabled (always available)
- [ ] Keyboard shortcuts: Ctrl+Z, Ctrl+Shift+Z, Ctrl+X, Ctrl+C, Ctrl+V, Ctrl+A, Del, Ctrl+K
- [ ] Click enabled item → toast notification

## TC-MENU-05: View Menu — Full Content
- [ ] Click "View" → dropdown opens
- [ ] Items: Zoom In, Zoom Out, Actual Size, Fit Width, Fit Page | Show Sidebar (checkbox) | Enter Fullscreen | Go to Page…, Find…
- [ ] Keyboard shortcuts: Ctrl+=, Ctrl+-, Ctrl+0, F11, Ctrl+G, Ctrl+F
- [ ] "Show Sidebar" has checkbox indicator (checked by default)
- [ ] Click "Show Sidebar" → sidebar toggles visibility
- [ ] Zoom items disabled when no document open
- [ ] "Enter Fullscreen" is enabled always

## TC-MENU-06: Tools Menu — Full Content
- [ ] Click "Tools" → dropdown opens
- [ ] Items: Selection (✓), Rectangle, Oval, Line, Arrow, Text, Freehand | Adjust Size… | Rotate Left, Rotate Right
- [ ] Tool shortcuts displayed: V, R, O, L, A, T, D, Ctrl+L, Ctrl+R
- [ ] Active tool (Selection by default) has check mark
- [ ] All items disabled when no document open

## TC-MENU-07: Window Menu
- [ ] Click "Window" → dropdown opens
- [ ] Items: Minimize, Zoom
- [ ] Click each → toast notification

## TC-MENU-08: Help Menu
- [ ] Click "Help" → dropdown opens
- [ ] Item: About WinPreview
- [ ] Click → toast notification

## TC-MENU-09: Dark Theme Styling
- [ ] All dropdowns have dark background (#2D2D2D)
- [ ] Text is light (#E0E0E0)
- [ ] Separators are subtle (#3D3D3D)
- [ ] Borders are visible (#555555)
- [ ] Hover/focus highlights items with dark accent
- [ ] Disabled items appear dimmed (opacity)

## TC-MENU-10: Menu Bar Integration
- [ ] Menu bar is above toolbar (correct z-order)
- [ ] Menu bar does not push layout — app still fits in viewport
- [ ] Sidebar toggle from View menu works in sync with toolbar sidebar toggle
- [ ] Tool selection from Tools menu updates toolbar active tool indicator

---

## Test Results
| TC | Pass/Fail | Notes |
|----|-----------|-------|
| TC-MENU-01 | | |
| TC-MENU-02 | | |
| TC-MENU-03 | | |
| TC-MENU-04 | | |
| TC-MENU-05 | | |
| TC-MENU-06 | | |
| TC-MENU-07 | | |
| TC-MENU-08 | | |
| TC-MENU-09 | | |
| TC-MENU-10 | | |
