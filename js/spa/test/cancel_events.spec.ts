import { test, expect } from "@self/tootils";
import { readFileSync } from "fs";

test("when using an iterative function the UI should update over time as iteration results are received", async ({
	page,
}) => {
	const start_button = await page.locator("button", {
		hasText: /Start Iterating/,
	});

	let output_values: string[] = [];
	let last_output_value = "";
	let interval = setInterval(async () => {
		let value = await page.getByLabel("Iterative Output").inputValue();
		if (value !== last_output_value) {
			output_values.push(value);
			last_output_value = value;
		}
	}, 100);

	await start_button.click();
	await expect(page.getByLabel("Iterative Output")).toHaveValue("8");
	clearInterval(interval);
	for (let i = 1; i < 8; i++) {
		expect(output_values).toContain(i.toString());
	}
});

test("when using an iterative function it should be possible to cancel the function, after which the UI should stop updating", async ({
	page,
}) => {
	const start_button = await page.locator("button", {
		hasText: /Start Iterating/,
	});
	const stop_button = await page.locator("button", {
		hasText: /Stop Iterating/,
	});
	const textbox = await page.getByLabel("Iterative Output");

	await start_button.click();
	await page.waitForTimeout(200);
	await stop_button.click();
	await expect(textbox).not.toHaveValue("9");
	await expect(page.getByLabel("Cancel Follow-up")).toHaveValue(
		"Cancel follow-up ran",
	);
});

test("when using an iterative function and the user closes the page, the python function should keep running", async ({
	page,
}) => {
	const start_button = await page.locator("button", {
		hasText: /Start Iterating/,
	});

	await start_button.click();
	await page.waitForTimeout(300);
	await page.close();

	await new Promise((resolve) => setTimeout(resolve, 2000));
	const data = readFileSync(
		"../../demo/cancel_events/cancel_events_output_log.txt",
		"utf-8",
	);
	expect(data).toContain("Current step: 0");
	expect(data).toContain("Current step: 8");
});
