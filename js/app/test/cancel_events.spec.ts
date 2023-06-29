import { test, expect } from "@gradio/tootils";

test("yielding", async ({ page }) => {
	let first_iteration;
	let fourth_iteration;
	let last_iteration;

	page.on("websocket", (ws) => {
		first_iteration = ws.waitForEvent("framereceived", {
			predicate: (event) => {
				return JSON.parse(event.payload as string).msg === "process_generating";
			}
		});

		fourth_iteration = ws.waitForEvent("framereceived", {
			predicate: (event) => {
				return JSON.parse(event.payload as string)?.output?.data?.[0] === "3";
			}
		});

		last_iteration = ws.waitForEvent("framereceived", {
			predicate: (event) => {
				return JSON.parse(event.payload as string).msg === "process_completed";
			}
		});
	});

	const start_button = await page.locator("button", {
		hasText: /Start Iterating/
	});
	const textbox = await page.getByLabel("Iterative Output");
	await start_button.click();

	await first_iteration;
	await expect(textbox).toHaveValue("0");
	await fourth_iteration;
	await expect(textbox).toHaveValue("3");
	await last_iteration;
	await expect(textbox).toHaveValue("8");
});
