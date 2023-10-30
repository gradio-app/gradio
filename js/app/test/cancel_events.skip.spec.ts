import { test, expect } from "@gradio/tootils";

test.skip("when using an iterative function the UI should update over time as iteration results are received", async ({
	page
}) => {
	let first_iteration;
	let fourth_iteration;
	let last_iteration;

	const start_button = await page.locator("button", {
		hasText: /Start Iterating/
	});
	const textbox = await page.getByLabel("Iterative Output");

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

	await start_button.click();

	await first_iteration;
	await expect(textbox).toHaveValue("0");
	await fourth_iteration;
	await expect(textbox).toHaveValue("3");
	await last_iteration;
	await expect(textbox).toHaveValue("8");
});

test.skip("when using an iterative function it should be possible to cancel the function, after which the UI should stop updating", async ({
	page
}) => {
	let first_iteration;
	const start_button = await page.locator("button", {
		hasText: /Start Iterating/
	});
	const stop_button = await page.locator("button", {
		hasText: /Stop Iterating/
	});
	const textbox = await page.getByLabel("Iterative Output");

	page.on("websocket", (ws) => {
		first_iteration = ws.waitForEvent("framereceived", {
			predicate: (event) => {
				return JSON.parse(event.payload as string).msg === "process_generating";
			}
		});
	});

	await start_button.click();

	await first_iteration;
	await stop_button.click();
	await expect(textbox).toHaveValue("0");
	await page.waitForTimeout(1000);
	await expect(textbox).toHaveValue("0");
});
