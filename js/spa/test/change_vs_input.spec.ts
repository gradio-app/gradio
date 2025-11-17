import { test, expect } from "@self/tootils";

test("Change counter is 0 on page load", async ({ page }) => {
	const counter = page.getByLabel("Change counter");
	await expect(counter).toHaveValue("0");
});

test("Textbox change and input events work correctly", async ({ page }) => {
	const counter = page.getByLabel("Change counter");

	// Get the textbox in the first column (row 1, index 0)
	const textbox = page.locator('input[type="text"]').first();

	// Type into the textbox
	await textbox.fill("hello");

	// Wait for events to process
	await page.waitForTimeout(300);

	// Counter should have incremented (change event fired)
	const counterValue = await counter.inputValue();
	expect(parseInt(counterValue)).toBeGreaterThan(0);

	// Check the input event textbox has the value
	const textboxIn = page.locator('input[type="text"]').nth(1);
	await expect(textboxIn).toHaveValue("hello");

	// Check the change event textbox has the value
	const textboxCh = page.locator('input[type="text"]').nth(2);
	await expect(textboxCh).toHaveValue("hello");
});

test("Checkbox change and input events work correctly", async ({ page }) => {
	const counter = page.getByLabel("Change counter");
	const initialCounter = parseInt(await counter.inputValue());

	// Find all checkboxes and click the first one (original checkbox)
	const checkboxes = page.locator('input[type="checkbox"]');
	await checkboxes.first().click();

	// Wait for events to process
	await page.waitForTimeout(300);

	// Counter should have incremented
	const newCounter = parseInt(await counter.inputValue());
	expect(newCounter).toBeGreaterThan(initialCounter);

	// Verify the input event checkbox is checked
	const checkboxIn = checkboxes.nth(1);
	await expect(checkboxIn).toBeChecked();

	// Verify the change event checkbox is checked
	const checkboxCh = checkboxes.nth(2);
	await expect(checkboxCh).toBeChecked();
});

test("CheckboxGroup change and input events work correctly", async ({
	page
}) => {
	const counter = page.getByLabel("Change counter");
	const initialCounter = parseInt(await counter.inputValue());

	// Find all labels with "a" text and click the first one (in the original CheckboxGroup)
	const checkboxGroups = page.locator("label").filter({ hasText: /^a$/ });
	await checkboxGroups.first().click();

	// Wait for events to process
	await page.waitForTimeout(300);

	// Counter should have incremented
	const newCounter = parseInt(await counter.inputValue());
	expect(newCounter).toBeGreaterThan(initialCounter);

	// Verify the input event checkboxgroup has "a" selected
	const checkboxGroupIn = checkboxGroups.nth(1);
	const inputCheckbox = checkboxGroupIn.locator('input[type="checkbox"]');
	await expect(inputCheckbox).toBeChecked();

	// Verify the change event checkboxgroup has "a" selected
	const checkboxGroupCh = checkboxGroups.nth(2);
	const changeCheckbox = checkboxGroupCh.locator('input[type="checkbox"]');
	await expect(changeCheckbox).toBeChecked();
});

test("Radio change and input events work correctly", async ({ page }) => {
	const counter = page.getByLabel("Change counter");
	const initialCounter = parseInt(await counter.inputValue());

	// Find all radio buttons and locate the first group's "b" option
	const radioLabels = page.locator("label").filter({ hasText: /^b$/ });
	await radioLabels.first().click();

	// Wait for events to process
	await page.waitForTimeout(300);

	// Counter should have incremented
	const newCounter = parseInt(await counter.inputValue());
	expect(newCounter).toBeGreaterThan(initialCounter);

	// Verify the input event radio has "b" selected
	const radioIn = radioLabels.nth(1).locator('input[type="radio"]');
	await expect(radioIn).toBeChecked();

	// Verify the change event radio has "b" selected
	const radioCh = radioLabels.nth(2).locator('input[type="radio"]');
	await expect(radioCh).toBeChecked();
});

test("Dropdown change and input events work correctly", async ({ page }) => {
	const counter = page.getByLabel("Change counter");
	const initialCounter = parseInt(await counter.inputValue());

	// Find the first dropdown and select an option
	const dropdowns = page
		.locator(".wrap.svelte-1gfkn6j")
		.filter({ has: page.locator('input[role="combobox"]') });
	const firstDropdown = dropdowns.first().locator('input[role="combobox"]');

	await firstDropdown.click();
	await page.waitForTimeout(200);

	// Click on option "b"
	await page.locator("li").filter({ hasText: /^b$/ }).first().click();

	// Wait for events to process
	await page.waitForTimeout(300);

	// Counter should have incremented
	const newCounter = parseInt(await counter.inputValue());
	expect(newCounter).toBeGreaterThan(initialCounter);

	// Verify the input event dropdown has "b" selected
	const dropdownIn = dropdowns.nth(1).locator('input[role="combobox"]');
	await expect(dropdownIn).toHaveValue("b");

	// Verify the change event dropdown has "b" selected
	const dropdownCh = dropdowns.nth(2).locator('input[role="combobox"]');
	await expect(dropdownCh).toHaveValue("b");
});
