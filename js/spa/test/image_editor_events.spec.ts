import { test, expect } from "@self/tootils";

test("upload events work as expected", async ({ page }) => {
	await page.getByLabel("Click to upload or drop files").first().click();
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByLabel("Click to upload or drop files").first().click()
	]);
	await fileChooser.setFiles(["./test/files/cheetah1.jpg"]);

	await expect(page.locator("#upload h2")).toContainText("1");
});

test("change events work as expected", async ({ page }) => {
	const change_text = page.locator("#change h2");

	await page.getByLabel("Brush").first().click();

	const canvas = page.locator("canvas").first();
	await canvas.click({ position: { x: 200, y: 100 } });
	await expect(change_text).toContainText("1");
});

test("Image editor user can draw after upload", async ({ page }) => {
	await page.getByLabel("Click to upload or drop files").first().click();
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByLabel("Click to upload or drop files").first().click()
	]);

	// crucial to use a large image here
	await fileChooser.setFiles(["./test/files/bike.jpeg"]);

	await expect(page.locator("#upload h2")).toContainText("1");
	await page.getByLabel("Brush").first().click();
	const canvas = page.locator("canvas").first();
	await canvas.click({ position: { x: 200, y: 100 } });
	const change_text = page.locator("#change h2");
	await expect(change_text).toContainText("2");
});

test("input events work as expected", async ({ page }) => {
	const input_text = page.locator("#input h2");

	await page.getByLabel("Brush").first().click();

	const canvas = page.locator("canvas").first();
	await canvas.click({ position: { x: 200, y: 100 } });
	await expect(input_text).toContainText("1");
});

test("erase triggers change and input events", async ({ page }) => {
	const canvas = page.locator("canvas").first();
	const input_text = page.locator("#input h2");
	const change_text = page.locator("#change h2");

	await page.getByLabel("Erase").first().click();
	await canvas.click({ position: { x: 200, y: 100 } });
	await expect(input_text).toContainText("1");
	await expect(change_text).toContainText("1");
});

test("apply events work as expected", async ({ page }) => {
	const apply_text = page.locator("#apply h2");
	const apply_button = page.getByLabel("Save changes").first();

	await page.getByLabel("Brush").first().click();
	const canvas = page.locator("canvas").first();
	await canvas.click({ position: { x: 200, y: 100 } });
	await apply_button.click();
	await expect(apply_text).toContainText("1");
});

test("image editor can be cleared twice by setting value to None", async ({
	page
}) => {
	await page.getByLabel("Brush").first().click();
	const canvas = page.locator("canvas").first();
	await canvas.click({ position: { x: 200, y: 100 } });
	await page.getByRole("button", { name: "Clear Button" }).click();
	await page.waitForTimeout(1000);

	await page.getByLabel("Brush").first().click();
	const canvas_2 = page.locator("canvas").first();
	await canvas_2.click({ position: { x: 200, y: 100 } });
	await canvas_2.click({ position: { x: 201, y: 100 } });
	await page.getByRole("button", { name: "Clear Button" }).click();

	await expect(page.getByLabel("cleared properly")).toHaveValue("1");
});
