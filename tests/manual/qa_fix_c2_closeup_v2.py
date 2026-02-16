"""Fix C2: Better close-up of page number at bottom of document page."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    # Open a document
    page.evaluate("window.__openDocument('test.pdf', 'pdf', 3)")
    time.sleep(1)

    # Use Fit Page via keyboard shortcut
    page.keyboard.press("Control+8")
    time.sleep(0.5)

    # Full screenshot
    page.screenshot(path="qa/screenshots/c2_fit_page_view.png")

    # Close-up of the page bottom center where the page number "1" should be
    # The page occupies roughly 570-1080 x, and bottom of page is around y=780
    page.screenshot(path="qa/screenshots/c2_page_number_closeup_v2.png", clip={"x": 500, "y": 700, "width": 500, "height": 150})

    # Scroll down to see if page number is at very bottom
    page.screenshot(path="qa/screenshots/c2_page_center_bottom.png", clip={"x": 600, "y": 650, "width": 400, "height": 200})

    browser.close()
    print("C2 close-up v2 done.")
