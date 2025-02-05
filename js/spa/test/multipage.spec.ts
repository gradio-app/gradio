import { test, expect, is_lite } from "@self/tootils";

test("Test multipage navigation and events", async ({ page }) => {
	test.fixme(is_lite, "Lite doesn't support multipage gradio apps");

	await page.getByLabel("Name").fill("asdf");
	await page.getByRole("button", { name: "Greet" }).click();
	await expect(page.getByLabel("Output")).toHaveValue("Hello asdf!");
	await expect(page.getByLabel("Textbox")).toHaveCount(4);

	await page.getByRole("link", { name: "Interface" }).click();
	await page.getByLabel("x").click();
	await page.getByLabel("x").fill("3");
	await page.getByLabel("y", { exact: true }).click();
	await page.getByLabel("y", { exact: true }).fill("4");
	await page.getByText("Submit").last().click();
	await expect(page.getByLabel("output").last()).toHaveValue("12");

	await page.getByRole("link", { name: "Up" }).click();
	await expect(page.getByLabel("Number")).not.toHaveValue("0");
	await page.getByLabel("Number").click();
	await page.getByLabel("Number").fill("5");
	await page.getByRole("main").click();
	await page.getByRole("button", { name: "Increase" }).click();
	await expect(page.getByLabel("Number")).toHaveValue("6");
	await expect(page.getByLabel("Textbox")).toHaveCount(100);
});
