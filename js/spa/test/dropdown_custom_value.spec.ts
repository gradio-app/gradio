import { test, expect } from "@self/tootils";

test.describe("Dropdown with allow_custom_value=True", () => {
	test("selecting an option updates the textbox with the value, not the name", async ({
		page
	}) => {
		const dropdown = page.getByRole("listbox", { name: "Dropdown" });
		const output = page.getByLabel("Output");

		await dropdown.click();
		await page.getByRole("option", { name: "abc" }).click();

		await expect(output).toHaveValue("123");
	});

	test("blurring dropdown after selecting an option does not change the value", async ({
		page
	}) => {
		const dropdown = page.getByRole("listbox", { name: "Dropdown" });
		const output = page.getByLabel("Output");

		await dropdown.click();
		await page.getByRole("option", { name: "abc" }).click();

		await expect(output).toHaveValue("123");

		await dropdown.click();
		await dropdown.blur();

		await expect(output).toHaveValue("123");
	});

	test("typing a custom value and pressing Enter updates the textbox", async ({
		page
	}) => {
		const dropdown = page.getByRole("listbox", { name: "Dropdown" });
		const output = page.getByLabel("Output");

		// Focus the dropdown and type a custom value
		await dropdown.click();
		await dropdown.fill("my custom value");
		await dropdown.press("Enter");

		// The textbox should show the custom value
		await expect(output).toHaveValue("my custom value");
	});

	test("typing a custom value and blurring updates the textbox", async ({
		page
	}) => {
		const dropdown = page.getByRole("listbox", { name: "Dropdown" });
		const output = page.getByLabel("Output");

		await dropdown.click();
		await dropdown.fill("another custom value");
		await dropdown.blur();

		await expect(output).toHaveValue("another custom value");
	});

	test("selecting an option after typing a custom value works correctly", async ({
		page
	}) => {
		const dropdown = page.getByRole("listbox", { name: "Dropdown" });
		const output = page.getByLabel("Output");

		await dropdown.click();
		await dropdown.fill("custom");
		await dropdown.press("Enter");
		await expect(output).toHaveValue("custom");

		await dropdown.click();
		await page.getByRole("option", { name: "hello" }).click();

		await expect(output).toHaveValue("goodbye");
	});
});
