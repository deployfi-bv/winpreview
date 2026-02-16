"""
Extra QA screenshots for closer inspection of toolbar separators and page 5 visibility.
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
            device_scale_factor=2,  # 2x for better detail
            color_scheme="dark",
        )
        page = context.new_page()

        # Open document
        page.goto(URL, wait_until="networkidle")
        time.sleep(1)
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        time.sleep(1.5)

        # Toolbar close-up at 2x resolution
        print("1. Toolbar at 2x resolution...")
        page.screenshot(
            path=str(QA_DIR / "toolbar_2x.png"),
            clip={"x": 0, "y": 36, "width": 1400, "height": 50},
        )
        print("   Saved toolbar_2x.png")

        # Scroll sidebar to see page 5
        print("2. Scrolling sidebar to see page 5...")
        # Navigate to page 5 to scroll it into view
        page.keyboard.press("End")
        time.sleep(0.5)

        # Try clicking the > (next) button multiple times to get to page 5
        for i in range(4):
            try:
                next_btn = page.locator('button[title*="Next"]').first
                if next_btn.is_visible():
                    next_btn.click()
                    time.sleep(0.3)
            except Exception:
                pass

        page.screenshot(
            path=str(QA_DIR / "sidebar_page5_visible.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved sidebar_page5_visible.png")

        # Navigate to page 4 by clicking the page input
        print("3. Navigating to page 4 via page input...")
        try:
            # Find the page indicator input (should show "1/5" or similar)
            page_input = page.locator('input').first
            if page_input.is_visible():
                page_input.triple_click()
                page_input.fill("4")
                page_input.press("Enter")
                time.sleep(0.5)
        except Exception as e:
            print(f"   Could not use page input: {e}")

        page.screenshot(
            path=str(QA_DIR / "sidebar_page4_selected.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved sidebar_page4_selected.png")

        # Zero state button close-up at 2x
        print("4. Zero state button at 2x...")
        page.evaluate("window.__closeDocument()")
        time.sleep(0.5)
        page.screenshot(
            path=str(QA_DIR / "zero_state_2x.png"),
            clip={"x": 530, "y": 440, "width": 340, "height": 180},
        )
        print("   Saved zero_state_2x.png")

        browser.close()

    print("\nDone!")


if __name__ == "__main__":
    main()
