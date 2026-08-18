import { test, expect } from "@self/tootils";

test.fixme("ImageEditor layers are properly set", async ({ page }) => {
	await page.getByRole("button", { name: "Set Layers" }).click();
	await expect(page.getByLabel("Layer Updates")).toHaveValue("1");
	await page.getByRole("button", { name: "Get Layers" }).click();
	await expect(page.getByLabel("Num Layers")).toHaveValue("1");
});

// gradio-app/gradio#11134
test("ImageEditor crop works at a mobile viewport", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const editor = page.getByTestId("image").first();
	await editor
		.locator('input[type="file"]')
		.setInputFiles("./test/files/cheetah1.jpg");
	await editor.getByRole("button", { name: "Image" }).click();
	await editor.getByRole("button", { name: "Crop" }).click();

	const cropCanvas = editor.locator(".pixi-target-crop canvas");
	await expect(cropCanvas).toBeVisible();
	const bounds = await cropCanvas.boundingBox();
	expect(bounds).not.toBeNull();
	if (!bounds) return;

	await page.mouse.move(bounds.x + 24, bounds.y + 24);
	await page.mouse.down();
	await page.mouse.move(bounds.x + 64, bounds.y + 56);
	await page.mouse.up();
	await editor.getByRole("button", { name: "Confirm crop" }).click();

	await expect(editor.getByRole("button", { name: "Image" })).toBeVisible();
});

test("Clicking on examples should properly run the function", async ({
	page
}) => {
	const examples = page.locator(".gallery > .gallery-item");
	await expect(examples).toHaveCount(2);
	const local_example = examples.nth(1);
	await expect(local_example).toBeVisible();
	await local_example.click();
	await expect(page.getByLabel("Example Ran")).toHaveValue("1");
});
