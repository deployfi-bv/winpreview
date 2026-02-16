"""
Dedicated toast visibility verification.
"""
import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = r"C:\Users\Deployfi\Downloads\WinPreview v2\qa\screenshots_final"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1400, "height": 900})
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(1500)

        # Open document
        await page.evaluate("window.__openDocument('test.pdf', 'pdf', 5)")
        await page.wait_for_timeout(1000)

        # Trigger Save via keyboard shortcut (Ctrl+S) for fastest capture
        await page.keyboard.press("Control+s")
        # Immediate capture
        await page.wait_for_timeout(200)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "20_toast_immediate.png"), full_page=False)
        print("Screenshot 20: Toast immediate after Ctrl+S")

        # Crop bottom-right where toast appears
        await page.screenshot(
            path=os.path.join(OUTPUT_DIR, "21_toast_crop_bottomright.png"),
            clip={"x": 900, "y": 780, "width": 500, "height": 120}
        )
        print("Screenshot 21: Toast crop bottom-right")

        # Also try a different action for another toast
        await page.wait_for_timeout(3000)  # Wait for first toast to dismiss

        # Trigger Print via Ctrl+P
        await page.keyboard.press("Control+p")
        await page.wait_for_timeout(200)
        await page.screenshot(path=os.path.join(OUTPUT_DIR, "22_toast_print.png"), full_page=False)
        print("Screenshot 22: Toast after Ctrl+P")

        # Crop the toast area
        await page.screenshot(
            path=os.path.join(OUTPUT_DIR, "23_toast_print_crop.png"),
            clip={"x": 900, "y": 780, "width": 500, "height": 120}
        )
        print("Screenshot 23: Toast print crop")

        await browser.close()
        print("\nToast verification complete!")

asyncio.run(main())
