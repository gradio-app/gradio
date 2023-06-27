import { test, expect } from "@gradio/tootils";

test("yielding", async ({ page }) => {
    const start_button = await page.locator("button", { hasText: /Start Iterating/ });
    const textbox = await page.getByLabel("Textbox").nth(0);
    await start_button.click()

    page.on('websocket', ws => {
        ws.on('framesent', async event => {
            console.log(event.payload)
        });

        ws.on('framereceived', async event => {
            console.log(event.payload)
            await expect(textbox).toHaveValue("ranoiamsdlfasldabcd");
        });

    });
});

