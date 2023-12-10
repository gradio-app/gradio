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
