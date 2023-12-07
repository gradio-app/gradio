import { test, expect } from "@gradio/tootils";

test("File Explorer is interactive and re-runs the server_fn when root is updated", async ({
	page
}) => {
	await page
		.locator("span")
		.filter({ hasText: "bar.txt" })
		.getByRole("checkbox")
		.check();
	await page
		.locator("span")
		.filter({ hasText: "foo.txt" })
		.getByRole("checkbox")
		.check();

	await page.getByLabel("Select File Explorer Root").click();
	await page.getByLabel(new RegExp("/dir2$"), { exact: true }).first().click();
	await page
		.locator("span")
		.filter({ hasText: "baz.png" })
		.getByRole("checkbox")
		.check();
	await page
		.locator("span")
		.filter({ hasText: "foo.png" })
		.getByRole("checkbox")
		.check();

	await page.locator("#input-box").getByTestId("textbox").fill("test");

	await expect(
		page.locator("span").filter({ hasText: "baz.png" }).getByRole("checkbox")
	).toBeChecked();

	await expect(
		page.locator("span").filter({ hasText: "foo.png" }).getByRole("checkbox")
	).toBeChecked();
});

test("File Explorer correctly displays only directories and clicking a directory properly selects it and all its children.", async ({
	page
}) => {
	const check = page.getByRole("checkbox", {
		name: "Show only directories",
		exact: true
	});
	await check.click();

	await page
		.locator("span")
		.filter({ hasText: "dir4" })
		.getByRole("checkbox")
		.check();
	await page.getByRole("button", { name: "Run" }).click();

	const directory_paths_displayed = async () => {
		const value = await page.getByLabel("Selected Directory").inputValue();
		const [dir4, dir5, dir7] = value.split(",");
		expect(dir4.endsWith("dir4")).toBeTruthy();
		expect(dir5.endsWith("dir5")).toBeTruthy();
		expect(dir7.endsWith("dir7")).toBeTruthy();
	};
	await expect(directory_paths_displayed).toPass();
});

test("File Explorer only sets single directory (not its children) as value when file_count='single'.", async ({
	page
}) => {
	const check = page.getByRole("checkbox", {
		name: "Show only directories (single)",
		exact: true
	});
	await check.click();

	await page
		.locator("span")
		.filter({ hasText: "dir4" })
		.getByRole("checkbox")
		.check();
	await page.getByRole("button", { name: "Run" }).click();

	const only_dir4_displayed = async () => {
		const value = await page.getByLabel("Selected Directory").inputValue();
		expect(value.endsWith("dir4")).toBeTruthy();
		expect(value.split(",").length).toBe(1);
	};
	await expect(only_dir4_displayed).toPass();

	await page.getByLabel("expand directory").first().click();
	await page
		.locator("span")
		.filter({ hasText: "dir5" })
		.getByRole("checkbox")
		.check();
	await page.getByRole("button", { name: "Run" }).click();

	const only_dir_5_displayed = async () => {
		const value = await page.getByLabel("Selected Directory").inputValue();
		expect(value.endsWith("dir5")).toBeTruthy();
		expect(value.split(",").length).toBe(1);
	};
	await expect(only_dir_5_displayed).toPass();
});
