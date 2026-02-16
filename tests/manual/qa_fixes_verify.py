"""
QA Fixes Verification Script
Verifies that 7 reported issues (m1-m4, c1-c3) have been fixed.
Viewport: 1400x900, Chromium browser.
"""

import time
from pathlib import Path
from playwright.sync_api import sync_playwright

QA_DIR = Path(r"C:\Users\Deployfi\Downloads\WinPreview v2\qa\fixes_verify")
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

        # ── Screenshot 1: Zero state — verify "Open File..." button is prominent ──
        print("1. Taking screenshot: zero_state.png")
        page.goto(URL, wait_until="networkidle")
        time.sleep(1)
        page.screenshot(path=str(QA_DIR / "zero_state.png"), full_page=False)
        print("   Saved zero_state.png")

        # Also take a close-up of the center area where the button should be
        page.screenshot(
            path=str(QA_DIR / "zero_state_center.png"),
            clip={"x": 400, "y": 300, "width": 600, "height": 400},
        )
        print("   Saved zero_state_center.png (center crop)")

        # ── Screenshot 2: Toolbar separators — open doc, crop toolbar ──
        print("2. Opening document and capturing toolbar...")
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        time.sleep(1.5)
        page.screenshot(
            path=str(QA_DIR / "toolbar_separators.png"),
            clip={"x": 0, "y": 0, "width": 1400, "height": 120},
        )
        print("   Saved toolbar_separators.png")

        # Also take full page for reference
        page.screenshot(path=str(QA_DIR / "full_document.png"), full_page=False)
        print("   Saved full_document.png")

        # ── Screenshot 3: Sidebar full — verify all 5 page numbers visible ──
        print("3. Capturing sidebar (left 280px)...")
        page.screenshot(
            path=str(QA_DIR / "sidebar_full.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved sidebar_full.png")

        # ── Screenshot 4: Navigate to page 4, check sidebar highlight ──
        print("4. Navigating to page 4...")
        # Try setting page index via evaluate
        try:
            page.evaluate("window.__setCurrentPageIndex && window.__setCurrentPageIndex(3)")
        except Exception:
            pass
        time.sleep(0.5)

        # Also try clicking page 4 thumbnail if visible
        # Look for thumbnail with text "4" and click it
        try:
            thumb4 = page.locator("text='4'").nth(0)
            if thumb4.is_visible():
                # Find the actual thumbnail element nearby
                pass
        except Exception:
            pass

        # Alternative: click on page 4 in sidebar thumbnails
        try:
            thumbnails = page.locator('[class*="thumbnail"]').all()
            if len(thumbnails) >= 4:
                thumbnails[3].click()
                time.sleep(0.5)
        except Exception:
            pass

        # Try clicking the page indicator in toolbar and typing page number
        try:
            page_input = page.locator('input[type="text"]').first
            if page_input.is_visible():
                page_input.click()
                page_input.fill("4")
                page_input.press("Enter")
                time.sleep(0.5)
        except Exception:
            pass

        page.screenshot(
            path=str(QA_DIR / "sidebar_after_nav.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved sidebar_after_nav.png")

        # ── Screenshot 5: Rotate page and check thumbnail ──
        print("5. Rotating page and checking thumbnail...")
        # Try using the Tools menu → Rotate Left
        try:
            # Open Tools menu
            tools_menu = page.locator("text='Tools'")
            if tools_menu.is_visible():
                tools_menu.click()
                time.sleep(0.3)
                # Look for Rotate Left
                rotate_item = page.locator("text='Rotate Left'")
                if rotate_item.is_visible():
                    rotate_item.click()
                    time.sleep(0.5)
        except Exception:
            pass

        # Try keyboard shortcut for rotate
        page.keyboard.press("Control+l")
        time.sleep(0.5)

        page.screenshot(
            path=str(QA_DIR / "rotated_thumbnail.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved rotated_thumbnail.png")

        # ── Screenshot 6: Canvas context menu ──
        print("6. Opening canvas context menu...")
        # Right-click on the canvas area (center of page)
        page.mouse.click(700, 500, button="right")
        time.sleep(0.5)
        page.screenshot(path=str(QA_DIR / "canvas_context_menu.png"), full_page=False)
        print("   Saved canvas_context_menu.png")

        # Also take a crop around the context menu area
        page.screenshot(
            path=str(QA_DIR / "canvas_context_menu_crop.png"),
            clip={"x": 550, "y": 350, "width": 400, "height": 450},
        )
        print("   Saved canvas_context_menu_crop.png")

        # Close context menu
        page.keyboard.press("Escape")
        time.sleep(0.3)

        # ── Screenshot 7: API status — check for "Offline" text ──
        print("7. Capturing API status area (far right of toolbar)...")
        page.screenshot(
            path=str(QA_DIR / "api_status.png"),
            clip={"x": 1100, "y": 0, "width": 300, "height": 60},
        )
        print("   Saved api_status.png")

        # ── Screenshot 8: Contact sheet view ──
        print("8. Switching to contact sheet view (Ctrl+J)...")
        page.keyboard.press("Control+j")
        time.sleep(1)
        page.screenshot(path=str(QA_DIR / "contact_sheet.png"), full_page=False)
        print("   Saved contact_sheet.png")

        # Also crop the heading area
        page.screenshot(
            path=str(QA_DIR / "contact_sheet_heading.png"),
            clip={"x": 200, "y": 30, "width": 1000, "height": 100},
        )
        print("   Saved contact_sheet_heading.png")

        browser.close()

    print("\nAll screenshots saved to:", QA_DIR)
    print("Done!")


if __name__ == "__main__":
    main()
