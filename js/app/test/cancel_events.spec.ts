import { test, expect } from "@gradio/tootils";
import { BASE64_IMAGE } from "./media_data";

test("iterator", async ({ page }) => {
    const start_button = await page.locator("button", { hasText: /Start Iterating/ });
    await start_button.click()

    page.on('websocket', ws => {
        console.log(`WebSocket opened: ${ws.url()}>`);
        ws.on('framesent', async event => {
            console.log(event.payload)
            const textbox = await page.getByLabel("Textbox").nth(0);
            await expect(textbox).toHaveValue(event.payload.toString());
        });
        ws.on('framereceived', event => console.log(event.payload));
        ws.on('close', () => console.log('WebSocket closed'));

    });

    // page.waitForResponse("**/*")

    // const textbox = await page.getByLabel("Textbox").nth(0);
    // await expect(textbox).toHaveValue("Lorem ipsum");

});

