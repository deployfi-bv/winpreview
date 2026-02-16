"""
QA Extra Screenshots — hover states, selected states, menu open
"""

import time
from pathlib import Path
from playwright.sync_api import sync_playwright

QA_DIR = Path(r"C:\Users\Deployfi\Downloads\WinPreview v2\qa")
URL = "http://localhost:5173"
VIEWPORT = {"width": 1400, "height": 900}


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport=VIEWPORT,
            device_scale_factor=1,
            color_scheme="dark",
        )
        page = context.new_page()

        page.goto(URL, wait_until="networkidle")
        time.sleep(1)

        # Open document
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        time.sleep(1.5)

        # ── 8. Click on page 3 thumbnail to see selection state ──
        print("8. Clicking thumbnail page 3...")
        thumbnails = page.query_selector_all('[class*="thumbnail"], [data-page]')
        # Try to click third thumbnail
        all_thumbs = page.query_selector_all('.cursor-pointer')
        if len(all_thumbs) >= 3:
            all_thumbs[2].click()
            time.sleep(0.5)
        else:
            # Try by text
            page.click('text=3', timeout=2000)
            time.sleep(0.5)
        page.screenshot(
            path=str(QA_DIR / "08_thumbnail_selected_page3.png"),
            clip={"x": 0, "y": 0, "width": 350, "height": 900},
        )
        print("   Saved 08_thumbnail_selected_page3.png")

        # ── 9. Hover over Export button ──
        print("9. Hovering over Export button...")
        export_btn = page.query_selector('text=Export')
        if export_btn:
            export_btn.hover()
            time.sleep(0.3)
        page.screenshot(
            path=str(QA_DIR / "09_toolbar_hover_export.png"),
            clip={"x": 800, "y": 35, "width": 600, "height": 50},
        )
        print("   Saved 09_toolbar_hover_export.png")

        # ── 10. Open File menu ──
        print("10. Opening File menu...")
        page.click('text=File')
        time.sleep(0.5)
        page.screenshot(
            path=str(QA_DIR / "10_file_menu_open.png"),
            clip={"x": 0, "y": 0, "width": 350, "height": 500},
        )
        print("   Saved 10_file_menu_open.png")
        page.keyboard.press("Escape")
        time.sleep(0.3)

        # ── 11. Open View menu ──
        print("11. Opening View menu...")
        page.click('text=View')
        time.sleep(0.5)
        page.screenshot(
            path=str(QA_DIR / "11_view_menu_open.png"),
            clip={"x": 60, "y": 0, "width": 350, "height": 500},
        )
        print("   Saved 11_view_menu_open.png")
        page.keyboard.press("Escape")
        time.sleep(0.3)

        # ── 12. Navigate to page 2 and check page indicator ──
        print("12. Navigate to page 2...")
        page.click('text=>')  # next page button
        time.sleep(0.5)
        page.screenshot(
            path=str(QA_DIR / "12_page2_indicator.png"),
            clip={"x": 100, "y": 35, "width": 200, "height": 50},
        )
        print("   Saved 12_page2_indicator.png")

        # ── 13. Full app with page 2 selected ──
        page.screenshot(path=str(QA_DIR / "13_full_page2.png"), full_page=False)
        print("   Saved 13_full_page2.png")

        print("\nExtra screenshots captured successfully!")
        browser.close()


if __name__ == "__main__":
    main()
