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
		.filter({ hasText: "dir4 dir5 dir7 . dir_4_foo.txt" })
		.getByRole("checkbox")
		.nth(3)
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
		expect(files.some((f) => f.endsWith("dir4"))).toBeTruthy();
		expect(files.some((f) => f.endsWith("dir_4_foo.txt"))).toBeTruthy();
		expect(files.some((f) => f.endsWith("dir3_foo.txt"))).toBeTruthy();
	};
	await expect(directory_paths_displayed).toPass();
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

	await page.getByRole("button", { name: "Run" }).click();

	const directory_paths_displayed = async () => {
		const value = await page.getByLabel("Selected Directory").inputValue();
		const files_and_dirs = value.split(",");
		expect(files_and_dirs.length).toBe(6);
	};
	await expect(directory_paths_displayed).toPass();
});

test("File Explorer correctly displays only directories and properly adds it to the value", async ({
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
		const dirs = value.split(",");
		expect(dirs.some((f) => f.endsWith("dir4"))).toBeTruthy();
		expect(dirs.some((f) => f.endsWith("dir5"))).toBeTruthy();
		expect(dirs.some((f) => f.endsWith("dir7"))).toBeTruthy();
	};
	await expect(directory_paths_displayed).toPass();
});

test("File Explorer correctly excludes directories when ignore_glob is '**/'.", async ({
	page
}) => {
	const check = page.getByRole("checkbox", {
		name: "Ignore directories in glob",
		exact: true
	});
	await check.click();

	await page
		.locator("span")
		.filter({ hasText: "dir4" })
		.getByRole("checkbox")
		.check();
	await page.getByRole("button", { name: "Run" }).click();

	const only_files_displayed = async () => {
		const value = await page.getByLabel("Selected Directory").inputValue();
		const files = value.split(",");
		expect(files.length).toBe(3);
		expect(files.some((f) => f.endsWith("dir_4_foo.txt"))).toBeTruthy();
		expect(files.some((f) => f.endsWith("dir5_foo.txt"))).toBeTruthy();
		expect(files.some((f) => f.endsWith("dir7_foo.txt"))).toBeTruthy();
	};
	await expect(only_files_displayed).toPass();
});
