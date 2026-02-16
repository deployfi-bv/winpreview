"""Fix C1: Better toast screenshot - capture bottom-right with more room."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    # Open a document first so Save is enabled
    page.evaluate("window.__openDocument('test.pdf', 'pdf', 3)")
    time.sleep(1)

    # File > Save
    file_trigger = page.locator('[role="menubar"] >> text="File"')
    file_trigger.click()
    time.sleep(0.5)

    # Click Save
    save_item = page.locator('[role="menuitem"]:has-text("Save")').first
    save_item.click(timeout=5000)
    time.sleep(0.8)

    # Full page screenshot immediately
    page.screenshot(path="qa/screenshots/c1_toast_v2_full.png")

    # Bottom region with more room - entire bottom strip
    page.screenshot(path="qa/screenshots/c1_toast_v2_bottom.png", clip={"x": 0, "y": 750, "width": 1400, "height": 150})

    # Right half bottom
    page.screenshot(path="qa/screenshots/c1_toast_v2_right_bottom.png", clip={"x": 700, "y": 700, "width": 700, "height": 200})

    browser.close()
    print("C1 toast v4 done.")
