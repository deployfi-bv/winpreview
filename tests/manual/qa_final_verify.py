"""
QA Final Verification Script
Verifies ALL previously reported issues are fixed.
Viewport: 1400x900, Chromium browser.
"""

import time
from pathlib import Path
from playwright.sync_api import sync_playwright

QA_DIR = Path(r"C:\Users\Deployfi\Downloads\WinPreview v2\qa\final_verify")
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

        # ── 01: Zero state — verify filled primary button ──
        print("01. Taking screenshot: 01_zero_state.png")
        page.goto(URL, wait_until="networkidle")
        time.sleep(1)
        page.screenshot(path=str(QA_DIR / "01_zero_state.png"), full_page=False)
        print("   Saved 01_zero_state.png")

        # ── 02: Open document with 5 pages ──
        print("02. Opening document with 5 pages...")
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        time.sleep(1.5)
        page.screenshot(path=str(QA_DIR / "02_document.png"), full_page=False)
        print("   Saved 02_document.png")

        # ── 03: Toolbar crop — verify separators visible ──
        print("03. Cropping toolbar (top 120px)...")
        page.screenshot(
            path=str(QA_DIR / "03_toolbar_crop.png"),
            clip={"x": 0, "y": 0, "width": 1400, "height": 120},
        )
        print("   Saved 03_toolbar_crop.png")

        # ── 04: Sidebar all pages — verify all 5 page numbers visible ──
        print("04. Cropping sidebar (left 280px)...")
        page.screenshot(
            path=str(QA_DIR / "04_sidebar_all_pages.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved 04_sidebar_all_pages.png")

        # ── 05: Navigate to page 4, verify highlight and label ──
        print("05. Navigating to page 4...")
        # Use the dev helper to set page
        try:
            page.evaluate("window.__setCurrentPageIndex(3)")
        except Exception as e:
            print(f"   __setCurrentPageIndex failed: {e}")
            # Fallback: try clicking page 4 thumbnail or using page input
            try:
                page_input = page.locator('input[type="text"]').first
                if page_input.is_visible():
                    page_input.click()
                    page_input.fill("4")
                    page_input.press("Enter")
            except Exception:
                pass
        time.sleep(0.8)
        page.screenshot(
            path=str(QA_DIR / "05_page4_selected.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved 05_page4_selected.png")

        # ── 06: Rotate page 1 and check thumbnail ──
        print("06. Navigating back to page 1 and rotating...")
        # Go back to page 1 first
        try:
            page.evaluate("window.__setCurrentPageIndex(0)")
        except Exception:
            try:
                page_input = page.locator('input[type="text"]').first
                if page_input.is_visible():
                    page_input.click()
                    page_input.fill("1")
                    page_input.press("Enter")
            except Exception:
                pass
        time.sleep(0.5)

        # Try rotating via Tools menu
        try:
            tools_menu = page.locator('[role="menubar"] >> text="Tools"')
            if tools_menu.is_visible():
                tools_menu.click()
                time.sleep(0.4)
                rotate_item = page.locator('text="Rotate Left"')
                if rotate_item.is_visible():
                    rotate_item.click()
                    time.sleep(0.5)
                else:
                    page.keyboard.press("Escape")
                    time.sleep(0.2)
                    page.keyboard.press("Control+l")
                    time.sleep(0.5)
            else:
                page.keyboard.press("Control+l")
                time.sleep(0.5)
        except Exception:
            page.keyboard.press("Control+l")
            time.sleep(0.5)

        page.screenshot(
            path=str(QA_DIR / "06_rotated_thumb.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved 06_rotated_thumb.png")

        # ── 07: Canvas context menu — verify 11+ items ──
        print("07. Opening canvas context menu...")
        # Right-click on the canvas area (center-right area, avoiding sidebar)
        page.mouse.click(750, 450, button="right")
        time.sleep(0.6)
        page.screenshot(path=str(QA_DIR / "07_context_menu.png"), full_page=False)
        print("   Saved 07_context_menu.png")

        # Close context menu
        page.keyboard.press("Escape")
        time.sleep(0.3)

        # ── 08: API status — crop far right of toolbar ──
        print("08. Cropping API status area...")
        page.screenshot(
            path=str(QA_DIR / "08_api_status.png"),
            clip={"x": 1200, "y": 0, "width": 200, "height": 60},
        )
        print("   Saved 08_api_status.png")

        # Also take wider crop in case it's further left
        page.screenshot(
            path=str(QA_DIR / "08_api_status_wide.png"),
            clip={"x": 1000, "y": 0, "width": 400, "height": 60},
        )
        print("   Saved 08_api_status_wide.png")

        # ── 09: Contact sheet — verify heading + grid centered ──
        print("09. Switching to contact sheet (Ctrl+J)...")
        page.keyboard.press("Control+j")
        time.sleep(1)
        page.screenshot(path=str(QA_DIR / "09_contact_sheet.png"), full_page=False)
        print("   Saved 09_contact_sheet.png")

        # ── 10: Contact sheet heading crop ──
        print("10. Cropping contact sheet heading...")
        page.screenshot(
            path=str(QA_DIR / "10_contact_heading_crop.png"),
            clip={"x": 200, "y": 30, "width": 1000, "height": 120},
        )
        print("   Saved 10_contact_heading_crop.png")

        # Also crop the bottom of the contact sheet to check last row centering
        page.screenshot(
            path=str(QA_DIR / "10b_contact_lastrow.png"),
            clip={"x": 200, "y": 400, "width": 1000, "height": 500},
        )
        print("   Saved 10b_contact_lastrow.png")

        browser.close()

    print("\nAll screenshots saved to:", QA_DIR)
    print("Done!")


if __name__ == "__main__":
    main()
