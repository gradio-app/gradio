import { test, expect } from "@self/tootils";

test("Image Editor canvas matches background image size if fixed_canvas=False", async ({
	page
}) => {
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByLabel("Click to upload or drop files").first().click()
	]);
	await fileChooser.setFiles(["./test/files/bike.jpeg"]);
	await page.waitForTimeout(500);
	await page.getByRole("button", { name: "Get Default" }).click();

	await expect(page.getByLabel("Width")).toHaveValue("1024");
	await expect(page.getByLabel("Height")).toHaveValue("769");
});

test("Image Editor 300 x 300 canvas resizes to match uploaded image", async ({
	page
}) => {
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByLabel("Click to upload or drop files").nth(1).click()
	]);
	await fileChooser.setFiles(["./test/files/bike.jpeg"]);
	await page.waitForTimeout(500);
	await page.getByRole("button", { name: "Get Small" }).click();

	await expect(page.getByLabel("Width")).toHaveValue("1024");
	await expect(page.getByLabel("Height")).toHaveValue("769");
});

test("Image Editor 300 x 300 canvas maintains size while being drawn upon", async ({
	page
}) => {
	await page.locator("#small").getByLabel("Brush").click();
	await page
		.locator("#small .pixi-target")
		.click({ position: { x: 200, y: 100 } });
	await page.waitForTimeout(500);
	await page.getByRole("button", { name: "Get Small" }).click();
	await expect(page.getByLabel("Width")).toHaveValue("300");
	await expect(page.getByLabel("Height")).toHaveValue("300");

	await page
		.locator("#small .pixi-target")
		.click({ position: { x: 200, y: 100 } });
	await page.waitForTimeout(500);
	await page.getByRole("button", { name: "Get Small" }).click();
	await expect(page.getByLabel("Width")).toHaveValue("300");
	await expect(page.getByLabel("Height")).toHaveValue("300");
});

test("Image Editor reshapes image to fit fixed 500 x 500 canvas", async ({
	page
}) => {
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByLabel("Click to upload or drop files").nth(2).click()
	]);
	await fileChooser.setFiles(["./test/files/bike.jpeg"]);
	await page.waitForTimeout(500);
	await page.getByRole("button", { name: "Get Fixed" }).click();

	await expect(page.getByLabel("Width")).toHaveValue("500");
	await expect(page.getByLabel("Height")).toHaveValue("500");
});
