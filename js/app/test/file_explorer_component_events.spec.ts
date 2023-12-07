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

test("File Explorer correctly displays only directories and clicking a directory properly selects it.", async ({
	page
}) => {
	const check = page.getByRole("checkbox", { name: "Show only directories" });
	await check.click();

	await page
		.locator("span")
		.filter({ hasText: "dir4" })
		.getByRole("checkbox")
		.check();
	await page.getByRole("button", { name: "Run" }).click();
	await page.waitForResponse("**/queue/join*");

	const directory_paths_displayed = async () => {
		const value = await page.getByLabel("Selected Directory").inputValue();
		const [dir4, dir5] = value.split(",");
		console.log(dir4, dir5);
		expect(dir4.endsWith("dir4")).toBeTruthy();
		expect(dir5.endsWith("dir5")).toBeTruthy();
	};
	await page.pause();
	await expect(directory_paths_displayed).toPass();
});
