"""
QA Screenshot Script — Tier 1 Remaining
Takes Playwright screenshots of key UI states for manual QA review.
Viewport: 1400x900, Chromium browser.
"""

import time
from pathlib import Path
from playwright.sync_api import sync_playwright

QA_DIR = Path(r"C:\Users\Deployfi\Downloads\WinPreview v2\qa")
URL = "http://localhost:5173"
VIEWPORT = {"width": 1400, "height": 900}


def main():
    QA_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport=VIEWPORT,
            device_scale_factor=1,
            color_scheme="dark",
        )
        page = context.new_page()

        # ── 1. Default empty state (zero state / drop zone) ──
        print("1. Taking screenshot: zero state...")
        page.goto(URL, wait_until="networkidle")
        time.sleep(1)
        page.screenshot(path=str(QA_DIR / "01_zero_state.png"), full_page=False)
        print("   Saved 01_zero_state.png")

        # ── 2. Open a document ──
        print("2. Opening document via console...")
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        time.sleep(1.5)
        page.screenshot(path=str(QA_DIR / "02_document_open.png"), full_page=False)
        print("   Saved 02_document_open.png")

        # ── 3. Thumbnail sidebar with pages visible ──
        print("3. Taking screenshot: thumbnail sidebar...")
        # Capture just the left portion showing sidebar + some canvas
        page.screenshot(
            path=str(QA_DIR / "03_thumbnail_sidebar.png"),
            clip={"x": 0, "y": 0, "width": 350, "height": 900},
        )
        print("   Saved 03_thumbnail_sidebar.png")

        # ── 4. Rotate current page ──
        print("4. Rotating current page...")
        # Try using keyboard shortcut Cmd+R or clicking rotate button
        # macOS Preview uses Cmd+R for rotate right. Let's try the Tools menu.
        # Actually, let's use the toolbar rotate button if available, or keyboard shortcut.
        # Try Ctrl+R for rotate right (common shortcut)
        page.keyboard.press("Control+r")
        time.sleep(0.5)
        # If that refreshes, try the menu approach instead
        # Let's take screenshot regardless
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        time.sleep(1)
        # Try clicking the rotate button in the toolbar if it exists
        # Look for a rotate button
        rotate_btn = page.query_selector('[title*="Rotate"]')
        if rotate_btn:
            rotate_btn.click()
            time.sleep(0.5)
            print("   Clicked rotate button")
        else:
            print("   No rotate button found, trying menu...")
            # Try Tools menu -> Rotate Right
            tools_menu = page.query_selector('text=Tools')
            if tools_menu:
                tools_menu.click()
                time.sleep(0.3)
                rotate_item = page.query_selector('text=Rotate Right')
                if rotate_item:
                    rotate_item.click()
                    time.sleep(0.5)
                    print("   Used Tools > Rotate Right")
                else:
                    print("   Rotate Right menu item not found")
            else:
                print("   Tools menu not found")
        page.screenshot(path=str(QA_DIR / "04_after_rotate.png"), full_page=False)
        print("   Saved 04_after_rotate.png")

        # ── 5. Contact sheet view (Ctrl+J) ──
        print("5. Opening contact sheet view...")
        # Re-open document fresh first
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        time.sleep(1)
        page.keyboard.press("Control+j")
        time.sleep(1)
        page.screenshot(path=str(QA_DIR / "05_contact_sheet.png"), full_page=False)
        print("   Saved 05_contact_sheet.png")

        # ── 6. Close-up of toolbar area ──
        print("6. Taking close-up of toolbar...")
        # Exit contact sheet first
        page.keyboard.press("Control+j")
        time.sleep(0.5)
        page.screenshot(
            path=str(QA_DIR / "06_toolbar_closeup.png"),
            clip={"x": 0, "y": 0, "width": 1400, "height": 120},
        )
        print("   Saved 06_toolbar_closeup.png")

        # ── 7. Close-up of status bar ──
        print("7. Taking close-up of status bar...")
        page.screenshot(
            path=str(QA_DIR / "07_statusbar_closeup.png"),
            clip={"x": 0, "y": 868, "width": 1400, "height": 32},
        )
        print("   Saved 07_statusbar_closeup.png")

        print("\nAll screenshots captured successfully!")
        browser.close()


if __name__ == "__main__":
    main()
