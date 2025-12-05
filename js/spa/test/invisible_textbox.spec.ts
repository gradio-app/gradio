import { test, expect } from "@self/tootils";

test("Textbox visibility can be toggled from the backend. Toggling visibility retains the value", async ({
	page
}) => {
	await expect(page.locator("#test-textbox textarea")).toHaveCount(0);

	await page.click('text="Show"');

	await expect(page.locator("#test-textbox")).toHaveCount(1);

	const textbox = page.locator("#test-textbox textarea");
	await textbox.fill("Test value");

	await page.click('text="Hide"');

	await expect(textbox).not.toBeVisible();
	await expect(textbox).toHaveCount(0);

	await page.click('text="Show"');
	await expect(textbox).toHaveValue("Test value");
});

test("Component visibility is respected in inactive tabs. A component with visibility=False will not be shown when the tab is active", async ({
	page
}) => {
	await page.getByRole("tab", { name: "Another Tab" }).click();

	await page.click('text="Show Message"');

	await expect(
		page.getByText(
			"This is another tab to demonstrate that invisible components work across tabs."
		)
	).toBeVisible();
});
