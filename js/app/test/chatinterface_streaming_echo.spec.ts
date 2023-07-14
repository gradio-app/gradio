import { test, expect } from "@gradio/tootils";

test("chatinterface works with streaming functions", async ({
	page
}) => {
	let last_iteration;

	const start_button = await page.locator("button", {
		hasText: /Start Iterating/
	});
	const textbox = await page.getByLabel("Iterative Output");

	page.on("websocket", (ws) => {
		last_iteration = ws.waitForEvent("framereceived", {
			predicate: (event) => {
				return JSON.parse(event.payload as string).msg === "process_completed";
			}
		});
	});

	await start_button.click();

	await last_iteration;
	await expect(textbox).toHaveValue("8");
});

test("the buttons in chatinterface work as expected", async ({
	page
}) => {
	
});
