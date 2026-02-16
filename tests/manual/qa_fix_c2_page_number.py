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

    # Navigate to View menu > Fit Page
    view_menu = page.get_by_text("View", exact=True).first
    view_menu.click()
    time.sleep(0.5)
    page.screenshot(path="qa/screenshots/c2_view_menu_open.png")

    # Click Fit Page
    fit_page = page.get_by_text("Fit Page", exact=True).first
    fit_page.click()
    time.sleep(0.5)

    # Screenshot full page view
    page.screenshot(path="qa/screenshots/c2_page_number_full.png")

    # Crop the bottom of the page area to see the page number closely
    # Take a close-up of the canvas area
    canvas = page.locator('[class*="canvas"]').first
    if canvas.is_visible():
        canvas.screenshot(path="qa/screenshots/c2_page_number_closeup.png")
    else:
        # Try another selector for the main content area
        page.screenshot(path="qa/screenshots/c2_page_number_closeup.png", clip={"x": 200, "y": 500, "width": 1000, "height": 400})

    browser.close()
    print("C2 screenshots done.")
