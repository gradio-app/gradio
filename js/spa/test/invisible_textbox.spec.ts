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
	await page.click('text="Show"');

	await expect(page.locator("#test-textbox")).toHaveCount(1);

	await page.getByRole("tab", { name: "Another Tab" }).click();

	await page.click('text="Show Message"');

	await expect(
		page.getByText(
			"This is another tab to demonstrate that invisible components work across tabs."
		)
	).toBeVisible();

	// Switch back to first tab and check textbox is still there
	await page.getByRole("tab", { name: "Invisible Textbox Demo" }).click();

	await expect(page.locator("#test-textbox")).toHaveCount(1);
});

test("Making accordion visible does not show all children automatically", async ({
	page
}) => {
	await page.getByRole("tab", { name: "Third Tab" }).click();
	await expect(page.locator("#hidden-number")).toHaveCount(0);

	await page.click('text="Show Accordion"');

	await expect(page.getByLabel("Visible Textbox")).toBeVisible();

	await page.click('text="Show Number"');

	await expect(page.locator("#hidden-number")).toHaveCount(1);

	await page.click('text="Hide Number"');
	await expect(page.locator("#hidden-number")).toHaveCount(0);
});

test("Hiding accordion retains textbox value when accordion is shown again", async ({
	page
}) => {
	await page.getByRole("tab", { name: "Third Tab" }).click();

	await page.click('text="Show Accordion"');

	const textbox = page.getByLabel("Visible Textbox");
	await expect(textbox).toBeVisible();
	await textbox.fill("Hello there");

	await page.click('text="Hide Accordion"');
	await expect(textbox).not.toBeVisible();

	await page.click('text="Show Accordion"');
	await expect(textbox).toBeVisible();
	await expect(textbox).toHaveValue("Hello there");
});
