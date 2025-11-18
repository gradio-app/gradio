import { test, expect } from "@self/tootils";

test(`Gallery component properly displayed`, async ({ page }) => {
	await page.getByTestId("gallery-radio-label").click();
	await page.getByTestId("textbox").click();
	await page.getByTestId("textbox").fill("gallery");
	await page.keyboard.press("Enter");
	await expect(
		page.getByLabel("Thumbnail 1 of 2").locator("img")
	).toBeVisible();
	await expect(
		page.getByLabel("Thumbnail 2 of 2").locator("img")
	).toBeVisible();
});

test(`Audio component properly displayed`, async ({ page }) => {
	await page.getByTestId("audio-radio-label").click();
	await page.getByTestId("textbox").click();
	await page.getByTestId("textbox").fill("audio");
	await page.keyboard.press("Enter");
	await expect(page.getByTestId("waveform-Audio")).toBeVisible();
});

test(`Video component properly displayed`, async ({ page }) => {
	await page.getByTestId("video-radio-label").click();
	await page.getByTestId("textbox").click();
	await page.getByTestId("textbox").fill("video");
	await page.keyboard.press("Enter");
	await expect(page.getByTestId("test-player")).toBeAttached();
	await expect(
		page.getByTestId("test-player").getAttribute("src")
	).toBeTruthy();
});

test(`Image component properly displayed`, async ({ page }) => {
	await page.getByTestId("image-radio-label").click();
	await page.getByTestId("textbox").click();
	await page.getByTestId("textbox").fill("image");
	await page.keyboard.press("Enter");
	await expect(page.getByTestId("bot").locator("img")).toBeAttached();
});

test(`Model3D component properly displayed`, async ({ page }) => {
	await page.getByTestId("model3d-radio-label").click();
	await page.getByTestId("textbox").click();
	await page.getByTestId("textbox").fill("model3d");
	await page.keyboard.press("Enter");
	await expect(
		page.getByTestId("bot").locator('[data-testid="model3d"]')
	).toBeAttached();
});
