import { test, expect } from "@self/tootils";

test("Image Editor reshapes image to fit default canvas", async ({ page }) => {
	await page.locator("#default >> .upload-container > button").click();
	const uploader = page.locator("#default >> input[type=file]");
	await uploader.setInputFiles(["./test/files/brown_dog.jpg"]);

	await expect(page.getByLabel("Width")).toHaveValue("450");
	await expect(page.getByLabel("Height")).toHaveValue("600");
});

test("Image Editor reshapes image to fit small unfixed 100 x 100 canvas", async ({
	page
}) => {
	await page.locator("#small >> .upload-container > button").click();
	const uploader = page.locator("#small >> input[type=file]");
	await uploader.setInputFiles(["./test/files/brown_dog.jpg"]);

	await expect(page.getByLabel("Width")).toHaveValue("75");
	await expect(page.getByLabel("Height")).toHaveValue("100");
});

test("Image Editor reshapes image to fit fixed 500 x 500 canvas", async ({
	page
}) => {
	await page.locator("#small >> .upload-container > button").click();
	const uploader = page.locator("#fixed >> input[type=file]");
	await uploader.setInputFiles(["./test/files/brown_dog.jpg"]);

	await expect(page.getByLabel("Width")).toHaveValue("500");
	await expect(page.getByLabel("Height")).toHaveValue("500");
});
