import { test, expect } from "@self/tootils";

test.describe.configure({ mode: "serial" });

test("Change counter is 0 on page load", async ({ page }) => {
	const counter = page.getByLabel("Change counter");
	await expect(counter).toHaveValue("0");
});

test("Textbox change and input events work correctly", async ({ page }) => {
	const textbox = page.getByLabel("TB Input");

	await textbox.press("h");
	await page.waitForTimeout(500);
	await textbox.press("Enter");
	await page.waitForTimeout(1_000);

	expect(page.getByLabel("Change counter")).toHaveValue("1");

	await expect(page.getByLabel("Textbox Input Event")).toHaveValue("h");
	await expect(
		page.getByLabel("Textbox Change Event", { exact: true })
	).toHaveValue("h");
	await expect(page.getByLabel("Textbox Change Event x2")).toHaveValue("h");
});

test("Checkbox change and input events work correctly", async ({ page }) => {
	const checkbox = page.getByLabel("CB Input");
	await checkbox.click();

	await expect(page.getByLabel("Change counter")).toHaveValue("1");
	await expect(page.getByLabel("Checkbox Input Event")).toBeChecked();
	await expect(
		page.getByLabel("Checkbox Change Event", { exact: true })
	).toBeChecked();
	await expect(page.getByLabel("Checkbox Change Event x2")).toBeChecked();
});

test("CheckboxGroup change and input events work correctly", async ({
	page
}) => {
	await page
		.getByRole("group")
		.filter({ hasText: "CBG Input a b c" })
		.getByLabel("a", { exact: true })
		.check();

	await expect(page.getByLabel("Change counter")).toHaveValue("1");

	await expect(
		page
			.getByRole("group")
			.filter({ hasText: "CheckboxGroup Input Event" })
			.getByLabel("a", { exact: true })
	).toBeChecked();

	await expect(
		page
			.getByRole("group")
			.filter({ hasText: "CheckboxGroup Change Event", hasNotText: "x2" })
			.getByLabel("a", { exact: true })
	).toBeChecked();
	await expect(
		page
			.getByRole("group")
			.filter({ hasText: "CheckboxGroup Change Event x2" })
			.getByLabel("a", { exact: true })
	).toBeChecked();
});

test("Radio change and input events work correctly", async ({ page }) => {
	await page
		.getByRole("group")
		.filter({ hasText: "Radio Input a b c" })
		.getByTestId("b-radio-label")
		.click();
	await expect(page.getByLabel("Change counter")).toHaveValue("1");

	await expect(
		page
			.getByRole("group")
			.filter({ hasText: "Radio Input Event a b c" })
			.getByTestId("b-radio-label")
	).toBeChecked();
	await expect(
		page
			.getByRole("group")
			.filter({ hasText: "Radio Change Event a b c" })
			.getByTestId("b-radio-label")
	).toBeChecked();
	await expect(
		page
			.getByRole("group")
			.filter({ hasText: "Radio Change Event x2 a b c" })
			.getByTestId("b-radio-label")
	).toBeChecked();
});

test("Dropdown change and input events work correctly", async ({ page }) => {
	await page.getByRole("listbox", { name: "DD Input" }).click();
	await page.getByRole("option", { name: "b" }).click();

	await expect(page.getByLabel("Change counter")).toHaveValue("1");

	await expect(
		page.getByRole("listbox", { name: "Dropdown Input Event", exact: true })
	).toHaveValue("b");
	await expect(
		page.getByRole("listbox", { name: "Dropdown Change Event x2", exact: true })
	).toHaveValue("b");
});
