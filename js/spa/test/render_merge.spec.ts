import { test, expect } from "@self/tootils";

test("Test re-renders reattach components and listeners", async ({ page }) => {
	const output = page.getByLabel("Textbox", { exact: true });
	await page.getByLabel("Box 0").click();
	await page.getByLabel("Box 0").fill("c");

	await page
		.getByLabel("range slider for Textbox Count")
		.fill("3", { timeout: 200 });
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
	await expect(page.getByLabel("Box 2")).toHaveValue(" ");

	await page
		.getByLabel("range slider for Textbox Count")
		.fill("4", { timeout: 200 });

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
	await page.getByLabel("Box 4").fill("s", { timeout: 500 });
	await page.getByRole("button", { name: "Merge" }).click();

	await expect(output).toHaveValue("t e s t s");
});

test("js_on_load runs when gr.render replaces an HTML component", async ({
	page
}) => {
	const clicked = page.getByLabel("Clicked HTML button");

	await page
		.getByRole("button", { name: "HTML button 1", exact: true })
		.click();
	await expect(clicked).toHaveValue("HTML button 1");

	await page.getByRole("button", { name: "Add HTML button" }).click();
	const addedButton = page.getByRole("button", {
		name: "HTML button 2",
		exact: true
	});
	await expect(addedButton).toBeVisible();
	await addedButton.click();

	await expect(clicked).toHaveValue("HTML button 2");
});
