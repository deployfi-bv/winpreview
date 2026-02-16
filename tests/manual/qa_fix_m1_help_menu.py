"""Fix M1: Verify Help menu has 3 items and Check for Updates toast."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    # Screenshot 1: Open Help menu
    help_menu = page.get_by_text("Help", exact=True).first
    help_menu.click()
    time.sleep(0.5)
    page.screenshot(path="qa/screenshots/m1_help_menu_open.png")

    # Screenshot 2: Click "Check for Updates..." and capture toast
    updates_item = page.get_by_text("Check for Updates", exact=False).first
    updates_item.click()
    time.sleep(1)
    page.screenshot(path="qa/screenshots/m1_help_check_updates_toast.png")

    browser.close()
    print("M1 screenshots done.")
