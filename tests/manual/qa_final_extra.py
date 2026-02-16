"""
QA Final Extra Screenshots
Additional close-up screenshots for verifying specific issues.
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

        # Open document
        page.goto(URL, wait_until="networkidle")
        time.sleep(1)
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        time.sleep(1.5)

        # Extra 1: Close-up of page 4 label at bottom of sidebar
        # Crop the very bottom portion of the sidebar
        print("Extra 1: Close-up of sidebar bottom (page 4 label area)")
        page.screenshot(
            path=str(QA_DIR / "extra_sidebar_bottom.png"),
            clip={"x": 0, "y": 620, "width": 280, "height": 280},
        )
        print("   Saved extra_sidebar_bottom.png")

        # Extra 2: Scroll sidebar down to see page 5
        print("Extra 2: Scrolling sidebar to reveal page 5...")
        # Try to scroll the sidebar
        sidebar = page.locator('[data-radix-scroll-area-viewport]').first
        if sidebar.is_visible():
            sidebar.evaluate("el => el.scrollTop = el.scrollHeight")
            time.sleep(0.5)
        else:
            # Try generic scroll on sidebar area
            page.mouse.move(140, 500)
            for _ in range(5):
                page.mouse.wheel(0, 200)
                time.sleep(0.2)

        page.screenshot(
            path=str(QA_DIR / "extra_sidebar_scrolled.png"),
            clip={"x": 0, "y": 0, "width": 280, "height": 900},
        )
        print("   Saved extra_sidebar_scrolled.png")

        # Extra 3: Close-up of zero state button
        page.evaluate("window.__closeDocument()")
        time.sleep(0.5)
        page.screenshot(
            path=str(QA_DIR / "extra_zero_button_crop.png"),
            clip={"x": 600, "y": 530, "width": 300, "height": 100},
        )
        print("   Saved extra_zero_button_crop.png")

        # Extra 4: Re-open doc and check toolbar separators close-up
        page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        time.sleep(1)
        # Crop just the toolbar area between groups
        page.screenshot(
            path=str(QA_DIR / "extra_toolbar_separators_close.png"),
            clip={"x": 100, "y": 40, "width": 900, "height": 35},
        )
        print("   Saved extra_toolbar_separators_close.png")

        # Extra 5: Try rotation and check page 1 thumbnail more carefully
        print("Extra 5: Attempting rotation via Tools menu...")
        tools_menu = page.locator('[role="menubar"] >> text="Tools"')
        if tools_menu.is_visible():
            tools_menu.click()
            time.sleep(0.5)
            # Screenshot the open menu
            page.screenshot(path=str(QA_DIR / "extra_tools_menu_open.png"), full_page=False)
            print("   Saved extra_tools_menu_open.png")

            rotate_item = page.locator('text="Rotate Left"')
            if rotate_item.is_visible():
                rotate_item.click()
                time.sleep(0.5)
                page.screenshot(
                    path=str(QA_DIR / "extra_after_rotate.png"),
                    clip={"x": 0, "y": 70, "width": 280, "height": 250},
                )
                print("   Saved extra_after_rotate.png")
            else:
                page.keyboard.press("Escape")
                print("   Rotate Left not found in menu")

        # Extra 6: Contact sheet - check if last row is truly centered
        page.keyboard.press("Control+j")
        time.sleep(1)
        # Crop just the second row area
        page.screenshot(
            path=str(QA_DIR / "extra_contact_row2.png"),
            clip={"x": 270, "y": 300, "width": 900, "height": 300},
        )
        print("   Saved extra_contact_row2.png")

        browser.close()

    print("\nAll extra screenshots saved to:", QA_DIR)
    print("Done!")


if __name__ == "__main__":
    main()
