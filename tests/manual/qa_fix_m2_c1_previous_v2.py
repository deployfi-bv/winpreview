"""Verify previous fixes M2 (View menu shortcuts) and C1 (toast not clipped)."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    # M2: Screenshot already taken by c2 script (view menu open)
    # The m2_view_menu_shortcuts was taken successfully above

    # C1: File > Save and check toast
    # Use role-based selector for File menu
    file_trigger = page.locator('[role="menubar"] >> text="File"')
    file_trigger.click()
    time.sleep(0.5)
    page.screenshot(path="qa/screenshots/c1_file_menu_open.png")

    # Click Save using menuitem role
    save_items = page.locator('[role="menuitem"]:has-text("Save")')
    # We need "Save" not "Save As..."
    for i in range(save_items.count()):
        text = save_items.nth(i).text_content()
        if text and text.strip() == "Save" or (text and "Save" in text and "As" not in text):
            save_items.nth(i).click()
            break

    time.sleep(1.5)

    # Screenshot full page to see toast
    page.screenshot(path="qa/screenshots/c1_save_toast_full.png")

    # Close-up of bottom-right where toast appears
    page.screenshot(path="qa/screenshots/c1_save_toast_closeup.png", clip={"x": 800, "y": 650, "width": 600, "height": 250})

    browser.close()
    print("M2/C1 screenshots done.")
