"""Fix C1: Verify Save toast is not clipped at bottom."""
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

    # Click Save - now it should be enabled since doc is open
    save_item = page.locator('[role="menuitem"]:has-text("Save")').first
    save_item.click(timeout=5000)
    time.sleep(1.5)

    # Screenshot full page to see toast
    page.screenshot(path="qa/screenshots/c1_save_toast_full.png")

    # Close-up of bottom-right where toast appears
    page.screenshot(path="qa/screenshots/c1_save_toast_closeup.png", clip={"x": 800, "y": 650, "width": 600, "height": 250})

    browser.close()
    print("C1 toast screenshots done.")
