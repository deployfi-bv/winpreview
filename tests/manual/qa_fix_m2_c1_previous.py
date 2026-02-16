"""Verify previous fixes M2 (View menu shortcuts) and C1 (toast not clipped)."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    # M2: Open View menu and check for Ctrl+9 / Ctrl+8
    view_menu = page.get_by_text("View", exact=True).first
    view_menu.click()
    time.sleep(0.5)
    page.screenshot(path="qa/screenshots/m2_view_menu_shortcuts.png")

    # Close menu
    page.keyboard.press("Escape")
    time.sleep(0.3)

    # C1: File > Save and check toast
    file_menu = page.get_by_text("File", exact=True).first
    file_menu.click()
    time.sleep(0.5)

    save_item = page.get_by_text("Save", exact=True).first
    save_item.click()
    time.sleep(1)

    # Screenshot toast area - full page to see if toast is clipped at bottom
    page.screenshot(path="qa/screenshots/c1_save_toast_full.png")

    # Close-up of bottom-right where toast appears
    page.screenshot(path="qa/screenshots/c1_save_toast_closeup.png", clip={"x": 900, "y": 700, "width": 500, "height": 200})

    browser.close()
    print("M2/C1 screenshots done.")
