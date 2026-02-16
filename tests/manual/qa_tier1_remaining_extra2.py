"""
QA Extra Screenshots — page navigation and full page 2 view
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

        # ── 12. Navigate to page 2 using next arrow button ──
        print("12. Navigate to page 2...")
        # Find the next page button by its title attribute
        next_btn = page.query_selector('[title*="Next"]')
        if next_btn:
            next_btn.click()
            time.sleep(0.5)
            print("   Clicked Next button")
        else:
            # Try clicking the > arrow in navigation
            arrows = page.query_selector_all('button')
            for btn in arrows:
                text = btn.inner_text()
                if text.strip() == '>':
                    btn.click()
                    time.sleep(0.5)
                    print("   Clicked > button")
                    break

        page.screenshot(
            path=str(QA_DIR / "12_page2_indicator.png"),
            clip={"x": 100, "y": 35, "width": 200, "height": 50},
        )
        print("   Saved 12_page2_indicator.png")

        # ── 13. Full app with page 2 selected ──
        page.screenshot(path=str(QA_DIR / "13_full_page2.png"), full_page=False)
        print("   Saved 13_full_page2.png")

        # ── 14. Right-click context menu on canvas ──
        print("14. Right-click canvas...")
        page.click("body", position={"x": 700, "y": 450}, button="right")
        time.sleep(0.5)
        page.screenshot(path=str(QA_DIR / "14_canvas_context_menu.png"), full_page=False)
        print("   Saved 14_canvas_context_menu.png")
        page.keyboard.press("Escape")
        time.sleep(0.3)

        # ── 15. Right-click on a thumbnail ──
        print("15. Right-click thumbnail...")
        page.click("body", position={"x": 137, "y": 170}, button="right")
        time.sleep(0.5)
        page.screenshot(
            path=str(QA_DIR / "15_thumbnail_context_menu.png"),
            clip={"x": 0, "y": 0, "width": 500, "height": 500},
        )
        print("   Saved 15_thumbnail_context_menu.png")

        print("\nExtra screenshots 2 captured successfully!")
        browser.close()


if __name__ == "__main__":
    main()
