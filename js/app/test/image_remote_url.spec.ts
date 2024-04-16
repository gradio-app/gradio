import { test, expect } from "@gradio/tootils";

test("Image displays remote image correctly", async ({ page }) => {
	const example_image = page.locator(
		'div.block:has(div.label:has-text("Examples")) img'
	);
	const input_image = page.locator(
		'div.block:has(label:has-text("InputImage")) img'
	);
	const loopback_image = page.locator(
		'div.block:has(label:has-text("Loopback")) img'
	);
	const remote_output_image = page.locator(
		'div.block:has(label:has-text("RemoteImage")) img'
	);
	const submit_button = page.locator('button:has-text("Submit")');

	await expect(example_image).toHaveJSProperty("complete", true);
	await expect(example_image).not.toHaveJSProperty("naturalWidth", 0);

	await expect(input_image).toHaveJSProperty("complete", true);
	await expect(input_image).not.toHaveJSProperty("naturalWidth", 0);

	await submit_button.click();

	await expect(loopback_image).toHaveJSProperty("complete", true);
	await expect(loopback_image).not.toHaveJSProperty("naturalWidth", 0);
	await expect(remote_output_image).toHaveJSProperty("complete", true);
	await expect(remote_output_image).not.toHaveJSProperty("naturalWidth", 0);
});
