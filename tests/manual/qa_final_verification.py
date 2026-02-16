"""
Final QA Verification — All Previously Reported Issues
Takes screenshots to verify each fix.
"""
import asyncio
from playwright.async_api import async_playwright
import os
import time

OUTPUT_DIR = r"C:\Users\Deployfi\Downloads\WinPreview v2\qa\screenshots_final"

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1400, "height": 900})
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(1500)

        # Screenshot 0: Initial state (zero state)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "00_initial_zero_state.png"), full_page=False)
        print("Screenshot 00: Initial zero state")

        # Open a document for testing
        await page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "01_document_open.png"), full_page=False)
        print("Screenshot 01: Document open")

        # === C1: Toast z-index verification ===
        # Click File menu then Save
        menubar = page.locator('button:has-text("File")')
        await menubar.first.click()
        await page.wait_for_timeout(400)
        save_item = page.locator('[role="menuitem"]:has-text("Save")')
        await save_item.first.click()
        await page.wait_for_timeout(300)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "02_C1_toast_save.png"), full_page=False)
        print("Screenshot 02: C1 — Toast after Save")

        # Wait a moment and take another screenshot of toast
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "03_C1_toast_save_delayed.png"), full_page=False)
        print("Screenshot 03: C1 — Toast delayed capture")

        # Close any open menu
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(300)

        # === M1: Help menu verification ===
        help_menu = page.locator('button:has-text("Help")')
        await help_menu.first.click()
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "04_M1_help_menu.png"), full_page=False)
        print("Screenshot 04: M1 — Help menu items")

        # Close menu
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(300)

        # === M3: Window menu shortcuts ===
        window_menu = page.locator('button:has-text("Window")')
        await window_menu.first.click()
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "05_M3_window_menu.png"), full_page=False)
        print("Screenshot 05: M3 — Window menu shortcuts")

        # Close menu
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(300)

        # === C2: Page number subtlety check ===
        # First fit the page: View > Fit Page
        view_menu = page.locator('button:has-text("View")')
        await view_menu.first.click()
        await page.wait_for_timeout(500)

        # Screenshot View menu for M2 verification first
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "06_M2_view_menu.png"), full_page=False)
        print("Screenshot 06: M2 — View menu shortcuts")

        # Click Fit Page
        fit_page_item = page.locator('[role="menuitem"]:has-text("Fit Page")')
        if await fit_page_item.count() > 0:
            await fit_page_item.first.click()
        else:
            # Try radio item
            fit_page_radio = page.locator('[role="menuitemradio"]:has-text("Fit Page")')
            if await fit_page_radio.count() > 0:
                await fit_page_radio.first.click()
            else:
                await page.keyboard.press("Escape")
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "07_C2_page_number.png"), full_page=False)
        print("Screenshot 07: C2 — Page number subtlety (full canvas)")

        # Crop the bottom center of the canvas for page number detail
        # Canvas area is roughly center-bottom
        await page.screenshot(
            path=os.path.join(OUTPUT_DIR, "08_C2_page_number_crop.png"),
            clip={"x": 400, "y": 700, "width": 600, "height": 200}
        )
        print("Screenshot 08: C2 — Page number crop")

        # === General Regression: File menu ===
        file_menu = page.locator('button:has-text("File")')
        await file_menu.first.click()
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "09_file_menu.png"), full_page=False)
        print("Screenshot 09: File menu regression check")
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(300)

        # === General Regression: Edit menu ===
        edit_menu = page.locator('button:has-text("Edit")')
        await edit_menu.first.click()
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "10_edit_menu.png"), full_page=False)
        print("Screenshot 10: Edit menu regression check")
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(300)

        # === General Regression: Tools menu ===
        tools_menu = page.locator('button:has-text("Tools")')
        await tools_menu.first.click()
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "11_tools_menu.png"), full_page=False)
        print("Screenshot 11: Tools menu regression check")
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(300)

        # === General Regression: Toolbar ===
        await page.screenshot(
            path=os.path.join(OUTPUT_DIR, "12_toolbar_full.png"),
            clip={"x": 0, "y": 30, "width": 1400, "height": 50}
        )
        print("Screenshot 12: Toolbar regression check")

        # === General Regression: Zero state ===
        # Close document via File > Close
        file_menu2 = page.locator('button:has-text("File")')
        await file_menu2.first.click()
        await page.wait_for_timeout(400)
        close_item = page.locator('[role="menuitem"]:has-text("Close")')
        if await close_item.count() > 0:
            await close_item.first.click()
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "13_zero_state.png"), full_page=False)
        print("Screenshot 13: Zero state after close")

        # === Additional: Re-open document and check sidebar thumbnails ===
        await page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        await page.wait_for_timeout(1000)
        await page.screenshot(
            path=os.path.join(OUTPUT_DIR, "14_sidebar_thumbnails.png"),
            clip={"x": 0, "y": 70, "width": 220, "height": 700}
        )
        print("Screenshot 14: Sidebar thumbnails")

        # === Status bar check ===
        await page.screenshot(
            path=os.path.join(OUTPUT_DIR, "15_status_bar.png"),
            clip={"x": 0, "y": 868, "width": 1400, "height": 32}
        )
        print("Screenshot 15: Status bar")

        # === Test toast from toolbar action ===
        # Click an annotation tool dropdown and select something
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(200)

        # Try triggering a toast from Edit > Select All
        edit_menu2 = page.locator('button:has-text("Edit")')
        await edit_menu2.first.click()
        await page.wait_for_timeout(400)
        select_all = page.locator('[role="menuitem"]:has-text("Select All")')
        if await select_all.count() > 0:
            await select_all.first.click()
            await page.wait_for_timeout(400)
            await page.screenshot(path=os.path.join(OUTPUT_DIR, "16_toast_edit_action.png"), full_page=False)
            print("Screenshot 16: Toast from Edit action")
        else:
            await page.keyboard.press("Escape")

        # === Help > About WinPreview ===
        help_menu2 = page.locator('button:has-text("Help")')
        await help_menu2.first.click()
        await page.wait_for_timeout(400)

        # Crop the Help menu area for close-up
        await page.screenshot(
            path=os.path.join(OUTPUT_DIR, "17_help_menu_crop.png"),
            clip={"x": 800, "y": 0, "width": 400, "height": 200}
        )
        print("Screenshot 17: Help menu crop")
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(200)

        # === Window menu crop for shortcut detail ===
        window_menu2 = page.locator('button:has-text("Window")')
        await window_menu2.first.click()
        await page.wait_for_timeout(400)
        await page.screenshot(
            path=os.path.join(OUTPUT_DIR, "18_window_menu_crop.png"),
            clip={"x": 700, "y": 0, "width": 500, "height": 300}
        )
        print("Screenshot 18: Window menu crop for shortcuts")
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(200)

        # === View menu crop for shortcuts ===
        view_menu2 = page.locator('button:has-text("View")')
        await view_menu2.first.click()
        await page.wait_for_timeout(400)
        await page.screenshot(
            path=os.path.join(OUTPUT_DIR, "19_view_menu_crop.png"),
            clip={"x": 200, "y": 0, "width": 500, "height": 500}
        )
        print("Screenshot 19: View menu crop for shortcuts")
        await page.keyboard.press("Escape")

        await browser.close()
        print("\nAll screenshots captured successfully!")

asyncio.run(main())
