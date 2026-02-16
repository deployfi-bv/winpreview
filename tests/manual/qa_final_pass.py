"""
Final QA verification pass for WinPreview v2.
Tests three specific fixes:
1. Contact sheet: 4 pages per row, last row centered
2. Tools menu > Rotate Left/Right actually rotates (no toast)
3. Canvas context menu has 12 items (Undo/Redo added)
"""

import time
from playwright.sync_api import sync_playwright


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(2)

        # --- Screenshot a) Contact Sheet ---
        # Open document with 8 pages
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 8)")
        time.sleep(1)

        # Press Ctrl+J for contact sheet view
        page.keyboard.press("Control+j")
        time.sleep(1.5)

        page.screenshot(path="tests/manual/demo/contact_sheet.png")
        print("Screenshot: contact_sheet.png taken")

        # --- Screenshot b) Rotate via Tools menu ---
        # Go back to single page view - press Ctrl+J again to toggle off
        page.keyboard.press("Control+j")
        time.sleep(1)

        # Navigate to page 1 (should already be there, but make sure)
        # Use keyboard shortcut or page indicator
        page.keyboard.press("Home")
        time.sleep(0.5)

        # Take a "before" screenshot for comparison
        page.screenshot(path="tests/manual/demo/tools_rotate_before.png")
        print("Screenshot: tools_rotate_before.png taken")

        # Open Tools menu and click Rotate Left
        tools_menu = page.locator('[data-testid="menubar-trigger-tools"], button:has-text("Tools")')
        if tools_menu.count() > 0:
            tools_menu.first.click()
            time.sleep(0.5)

            rotate_left = page.locator('[role="menuitem"]:has-text("Rotate Left")')
            if rotate_left.count() > 0:
                rotate_left.first.click()
                time.sleep(1)
                print("Clicked Tools > Rotate Left")
            else:
                print("ERROR: Could not find 'Rotate Left' menu item")
        else:
            print("ERROR: Could not find Tools menu trigger")

        time.sleep(1)
        page.screenshot(path="tests/manual/demo/tools_rotate.png")
        print("Screenshot: tools_rotate.png taken")

        # --- Screenshot c) Canvas context menu ---
        # Right-click on canvas area
        canvas = page.locator('[data-testid="canvas-area"], .canvas-area, [class*="canvas"]')
        if canvas.count() > 0:
            canvas.first.click(button="right", position={"x": 400, "y": 300})
        else:
            # Try right-clicking in the center of the page
            page.mouse.click(700, 500, button="right")

        time.sleep(1)
        page.screenshot(path="tests/manual/demo/context_menu.png")
        print("Screenshot: context_menu.png taken")

        # Dismiss context menu
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # --- Screenshot d) Sidebar showing rotated thumbnail ---
        # Crop left 280px of the viewport for sidebar view
        page.screenshot(
            path="tests/manual/demo/sidebar_rotated.png",
            clip={"x": 0, "y": 0, "width": 280, "height": 900}
        )
        print("Screenshot: sidebar_rotated.png taken")

        # Bonus: Take a full-page screenshot for overall reference
        page.screenshot(path="tests/manual/demo/qa_final_full.png")
        print("Screenshot: qa_final_full.png taken")

        browser.close()
        print("\nAll screenshots captured successfully.")


if __name__ == "__main__":
    run()
