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

	const res = page.waitForEvent("response", {
		predicate: async (response) => {
			return (await response.text()).indexOf("process_completed") !== -1;
		}
	});
	await page.getByRole("button", { name: "Run" }).click();

	await res;

	const directory_paths_displayed = async () => {
		const value = await page.getByLabel("Selected Directory").inputValue();
		const files_and_dirs = value.split(",");
		expect(files_and_dirs.length).toBe(7);
	};
	await expect(directory_paths_displayed).toPass();
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

	const text_files_displayed = async () => {
		const value = await page.getByLabel("Selected Directory").inputValue();
		const dirs = value.split(",");
		expect(dirs.length).toBe(3);
		expect(dirs.every((d) => d.endsWith(".txt"))).toBeTruthy();
	};
	await expect(text_files_displayed).toPass();
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
		expect(files.length).toBe(4);
		expect(files.some((f) => f.endsWith(".log"))).toBeTruthy();
		expect(files.some((f) => f.endsWith(".txt"))).toBeFalsy();
	};
	await expect(only_files_displayed).toPass();
});
