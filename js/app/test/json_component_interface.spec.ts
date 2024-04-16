import { test, expect } from "@gradio/tootils";

test("JSON displays the json value both as an input and an output", async ({
	page
}) => {
	const input_json = page.locator(
		'div.block:has(label:has-text("InputJSON")) div.json-holder'
	);

	expect(input_json).not.toHaveText("");

	const submit_button = page.locator('button:has-text("Submit")');
	await submit_button.click();

	const output_json = page.locator(
		'div.block:has(label:has-text("OutputJSON")) div.json-holder'
	);

	expect(input_json).not.toHaveText("");
	expect(output_json).not.toHaveText("");
});
