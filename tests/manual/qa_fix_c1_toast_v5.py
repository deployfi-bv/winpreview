"""Fix C1: Better toast screenshot - try with different timing and viewport."""
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
    time.sleep(0.3)  # Shorter wait - catch it right as it appears

    # Take multiple rapid screenshots to catch the toast
    page.screenshot(path="qa/screenshots/c1_toast_v3_immediate.png")
    time.sleep(0.5)
    page.screenshot(path="qa/screenshots/c1_toast_v3_half_sec.png")

    # Also try locating the toast element directly
    toasts = page.locator('[data-sonner-toaster]')
    if toasts.count() > 0:
        toasts.first.screenshot(path="qa/screenshots/c1_toast_element.png")

    # Wider bottom crop
    page.screenshot(path="qa/screenshots/c1_toast_v3_wide_bottom.png", clip={"x": 600, "y": 780, "width": 800, "height": 120})

    browser.close()
    print("C1 toast v5 done.")
