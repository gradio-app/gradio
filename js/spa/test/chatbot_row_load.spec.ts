import { test, expect } from "@self/tootils";

test("demo.load() fires when Chatbot is in a Row with other components", async ({
	page
}) => {
	// Click on "Tab 2" to see the output textbox
	await page.getByRole("tab", { name: "Tab 2" }).click();

	// The textbox should be populated by demo.load()
	// If the bug is present, demo.load() hangs indefinitely and the textbox stays empty
	await expect(page.getByLabel("Output")).toHaveValue("loaded successfully", {
		timeout: 10000
	});
});
