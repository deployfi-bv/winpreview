"""
Check if toast bottom edge is clipped at viewport boundary.
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

        # Trigger Save
        await page.keyboard.press("Control+s")
        await page.wait_for_timeout(600)

        # Get the toast element bounding box
        toast_box = await page.evaluate("""() => {
            const toast = document.querySelector('[data-sonner-toast]');
            if (toast) {
                const rect = toast.getBoundingClientRect();
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bottom: rect.bottom };
            }
            return null;
        }""")
        print(f"Toast bounding box: {toast_box}")
        print(f"Viewport height: 900")
        if toast_box:
            print(f"Toast bottom edge: {toast_box['bottom']}")
            if toast_box['bottom'] > 900:
                print("WARNING: Toast bottom extends beyond viewport!")
            else:
                print("OK: Toast is fully within viewport.")

        # Crop the very bottom of the screen to check
        await page.screenshot(
            path=os.path.join(OUTPUT_DIR, "24_toast_bottom_edge.png"),
            clip={"x": 950, "y": 820, "width": 420, "height": 80}
        )
        print("Screenshot 24: Toast bottom edge detail")

        await browser.close()

asyncio.run(main())
