import { test, expect } from "@gradio/tootils";

test("Test re-renders reattach components and listeners", async ({ page }) => {
	const output = page.getByLabel("Textbox", { exact: true });
	await page.getByLabel("Box 0").click();
	await page.getByLabel("Box 0").fill("c");

	await page.getByLabel("range slider for Textbox Count").fill("3");
	await expect(page.getByLabel("Box 0")).toHaveValue("c");
	await page.getByLabel("Box 1").click();
	await page.getByLabel("Box 1").fill("a");
	await page.getByLabel("Box 2").click();
	await page.getByLabel("Box 2").fill("t");
	await page.getByRole("button", { name: "Merge" }).click();

	await expect(output).toHaveValue("c a t");

	await page.getByRole("button", { name: "Count" }).click();
	await expect(page.getByLabel("Box 2")).toHaveValue("2");

	await page.getByRole("button", { name: "Clear" }).click();
	await expect(page.getByLabel("Box 2")).toBeEmpty();

	await page.getByLabel("range slider for Textbox Count").fill("4");
	await page.getByLabel("Box 3").click();
	await page.getByLabel("Box 3").fill("t");
	await page.getByLabel("Box 2").click();
	await page.getByLabel("Box 2").fill("s");
	await page.getByLabel("Box 1").click();
	await page.getByLabel("Box 1").fill("e");
	await page.getByLabel("Box 0").click();
	await page.getByLabel("Box 0").fill("t");
	await page.getByRole("button", { name: "Merge" }).click();

	await expect(output).toHaveValue("t e s t");

	await page.getByLabel("range slider for Textbox Count").fill("5");
	await expect(page.getByLabel("Box 3")).toHaveValue("t");
	await page.getByLabel("Box 4").fill("s");
	await page.getByRole("button", { name: "Merge" }).click();

	await expect(output).toHaveValue("t e s t s");
});
