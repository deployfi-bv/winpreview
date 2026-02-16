"""Fix M3: Verify Window menu items show keyboard shortcuts."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    # Screenshot: Open Window menu
    window_menu = page.get_by_text("Window", exact=True).first
    window_menu.click()
    time.sleep(0.5)
    page.screenshot(path="qa/screenshots/m3_window_menu_shortcuts.png")

    browser.close()
    print("M3 screenshots done.")
