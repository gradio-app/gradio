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

	await page
		.locator("span")
		.filter({ hasText: "foo.png" })
		.getByRole("checkbox")
		.uncheck();

	await expect(page.locator("#total-changes input")).toHaveValue("3");
});

test("File Explorer correctly displays both directories and files. Directories included in value.", async ({
	page
}) => {
	await page.getByLabel("Select File Explorer Root").click();
	await page.getByLabel(new RegExp("/dir3$"), { exact: true }).first().click();

	await page
		.locator("span")
		.filter({ hasText: "dir4" })
		.getByLabel("expand directory")
		.click();

	await page
		.locator("li")
		.filter({ hasText: "dir4 . dir5 dir7 dir_4_bar.log dir_4_foo.txt" })
		.getByRole("checkbox")
		.first()
		.check();

	await page
		.locator("span")
		.filter({ hasText: "dir_4_foo.txt" })
		.getByRole("checkbox")
		.check();

	await page
		.locator("span")
		.filter({ hasText: "dir3_foo.txt" })
		.getByRole("checkbox")
		.check();

	await page.getByRole("button", { name: "Run" }).click();
	const directory_paths_displayed = async () => {
		const value = await page.getByLabel("Selected Directory").inputValue();
		const files = value.split(",");

		return (
			files.some((f) => f.endsWith("dir4")) &&
			files.some((f) => f.endsWith("dir_4_foo.txt")) &&
			files.some((f) => f.endsWith("dir3_foo.txt"))
		);
	};

	await expect.poll(directory_paths_displayed).toBe(true);
});

test("File Explorer selects all children when top level directory is selected.", async ({
	page
}) => {
	await page.getByLabel("Select File Explorer Root").click();
	await page.getByLabel(new RegExp("/dir3$"), { exact: true }).first().click();

	await page
		.locator("span")
		.filter({ hasText: "dir4" })
		.getByRole("checkbox")
		.check();

	await Promise.all([page.getByRole("button", { name: "Run" }).click()]);

	async function directory_paths_displayed() {
		const value = await page.getByLabel("Selected Directory").inputValue();
		const files_and_dirs = value.split(",");

		return files_and_dirs.length === 7;
	}
	await expect.poll(directory_paths_displayed).toBe(true);
});

test("File Explorer correctly displays only text files", async ({ page }) => {
	const check = page.getByRole("checkbox", {
		name: "Show only text files",
		exact: true
	});
	await check.click();

	await page.getByLabel("Select File Explorer Root").click();
	await page.getByLabel(new RegExp("/dir3$"), { exact: true }).first().click();

	await page
		.locator("span")
		.filter({ hasText: "dir4" })
		.getByRole("checkbox")
		.check();
	await page.getByRole("button", { name: "Run" }).click();

	async function text_files_displayed() {
		const value = await page.getByLabel("Selected Directory").inputValue();
		const dirs = value.split(",");
		return dirs.length === 3 && dirs.every((d) => d.endsWith(".txt"));
	}

	await expect.poll(text_files_displayed).toBe(true);
});

test("File Explorer correctly excludes text files when ignore_glob is '*.txt'.", async ({
	page
}) => {
	const check = page.getByRole("checkbox", {
		name: "Ignore text files in glob",
		exact: true
	});
	await check.click();

	await page.getByLabel("Select File Explorer Root").click();
	await page.getByLabel(new RegExp("/dir3$"), { exact: true }).first().click();

	await page
		.locator("span")
		.filter({ hasText: "dir4" })
		.getByRole("checkbox")
		.check();
	await page.getByRole("button", { name: "Run" }).click();

	const only_files_displayed = async () => {
		const value = await page.getByLabel("Selected Directory").inputValue();
		const files = value.split(",");
		return (
			files.length === 4 &&
			files.some((f) => f.endsWith(".log")) &&
			!files.some((f) => f.endsWith(".txt"))
		);
	};

	await expect.poll(only_files_displayed).toBe(true);
});
