"""Fix C2: Verify page number on document page is less prominent."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    # Open a document via console
    page.evaluate("window.__openDocument('test.pdf', 'pdf', 3)")
    time.sleep(1)

    # Screenshot after opening document
    page.screenshot(path="qa/screenshots/c2_document_opened.png")

    # Navigate to View menu > Fit Page using role selectors
    view_trigger = page.locator('[role="menubar"] >> text="View"')
    view_trigger.click()
    time.sleep(0.5)

    # Find "Fit Page" in the dropdown
    fit_page = page.locator('[role="menuitem"]:has-text("Fit Page")')
    if fit_page.count() > 0:
        fit_page.first.click()
        time.sleep(0.5)
    else:
        # Try keyboard shortcut instead
        page.keyboard.press("Escape")
        time.sleep(0.2)
        page.keyboard.press("Control+8")
        time.sleep(0.5)

    # Screenshot full page view
    page.screenshot(path="qa/screenshots/c2_page_number_full.png")

    # Close-up of bottom center where page number would be
    page.screenshot(path="qa/screenshots/c2_page_number_bottom.png", clip={"x": 200, "y": 600, "width": 1000, "height": 300})

    browser.close()
    print("C2 screenshots done.")
