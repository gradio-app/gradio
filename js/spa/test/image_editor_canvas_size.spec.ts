import { test, expect } from "@self/tootils";

test.skip("Image Editor canvas matches background image size if fixed_canvas=False", async ({
	page
}) => {
	await page.locator("#default >> .upload-container > button").click();
	const uploader = page.locator("#default >> input[type=file]");
	await uploader.setInputFiles(["./test/files/bike.jpeg"]);

	await expect(page.getByLabel("Width")).toHaveValue("1024");
	await expect(page.getByLabel("Height")).toHaveValue("769");
});

test.skip("Image Editor 300 x 300 canvas resizes to match uploaded image", async ({
	page
}) => {
	await page.locator("#small >> .upload-container > button").click();
	const uploader = page.locator("#small >> input[type=file]");
	await uploader.setInputFiles(["./test/files/bike.jpeg"]);

	await expect(page.getByLabel("Width")).toHaveValue("1024");
	await expect(page.getByLabel("Height")).toHaveValue("769");
});

test.skip("Image Editor 300 x 300 canvas maintains size while being drawn upon", async ({
	page
}) => {
	await page.locator("#small").getByLabel("Draw button").click();
	await page.locator("#small canvas").click({ position: { x: 15, y: 18 } });
	await expect(page.getByLabel("Width")).toHaveValue("300");
	await expect(page.getByLabel("Height")).toHaveValue("300");

	await page.locator("#small canvas").click({ position: { x: 10, y: 12 } });
	await expect(page.getByLabel("Width")).toHaveValue("300");
	await expect(page.getByLabel("Height")).toHaveValue("300");
});

test.skip("Image Editor reshapes image to fit fixed 500 x 500 canvas", async ({
	page
}) => {
	await page.locator("#small >> .upload-container > button").click();
	const uploader = page.locator("#fixed >> input[type=file]");
	await uploader.setInputFiles(["./test/files/bike.jpeg"]);

	await expect(page.getByLabel("Width")).toHaveValue("500");
	await expect(page.getByLabel("Height")).toHaveValue("500");
});
