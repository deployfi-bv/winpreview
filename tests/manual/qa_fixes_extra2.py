"""
Extra QA screenshots - page 5 visibility and page 4 navigation.
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

        # Open document
        page.goto(URL, wait_until="networkidle")
        time.sleep(1)
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        time.sleep(1.5)

        # Click the > (next page) button 4 times to get to page 5
        print("1. Navigating to page 5 using Next button...")
        for i in range(4):
            try:
                # Find the next button (right arrow)
                next_buttons = page.locator('button').all()
                for btn in next_buttons:
                    title = btn.get_attribute("title") or ""
                    text = btn.inner_text() if btn.is_visible() else ""
                    if "next" in title.lower() or ">" == text.strip():
                        btn.click()
                        time.sleep(0.3)
                        break
            except Exception:
                pass

        time.sleep(0.5)
        page.screenshot(
            path=str(QA_DIR / "sidebar_page5_visible.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved sidebar_page5_visible.png")

        # Now go to page 4 by clicking prev once
        print("2. Going back to page 4...")
        try:
            prev_buttons = page.locator('button').all()
            for btn in prev_buttons:
                title = btn.get_attribute("title") or ""
                if "prev" in title.lower():
                    btn.click()
                    time.sleep(0.3)
                    break
        except Exception:
            pass

        time.sleep(0.5)
        page.screenshot(
            path=str(QA_DIR / "sidebar_page4_selected.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved sidebar_page4_selected.png")

        # Full page screenshot showing page 4 selected
        page.screenshot(path=str(QA_DIR / "full_page4_selected.png"), full_page=False)
        print("   Saved full_page4_selected.png")

        browser.close()

    print("\nDone!")


if __name__ == "__main__":
    main()
