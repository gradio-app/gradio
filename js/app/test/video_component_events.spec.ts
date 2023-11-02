import { test, expect } from "@gradio/tootils";

test("test video click-to-upload and play-pause trigger", async ({ page }) => {
	await page
		.getByRole("button", { name: "Drop Video Here - or - Click to Upload" })
		.click();
	const uploader = await page.locator("input[type=file]");
	await Promise.all([
		uploader.setInputFiles(["./test/files/file_test.ogg"]),
		page.waitForResponse("**/upload")
	]);

	await expect(page.getByLabel("# Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");

	await page.getByLabel("play-pause-replay-button").nth(0).click();
	await page.getByLabel("play-pause-replay-button").nth(0).click();
	await expect(page.getByLabel("# Play Events")).toHaveValue("1");
	await expect(page.getByLabel("# Pause Events")).toHaveValue("1");

	await page.getByLabel("Clear").click();
	await expect(page.getByLabel("# Change Events")).toHaveValue("2");
	await page
		.getByRole("button", { name: "Drop Video Here - or - Click to Upload" })
		.click();

	await Promise.all([
		uploader.setInputFiles(["./test/files/file_test.ogg"]),
		page.waitForResponse("**/upload")
	]);

	await expect(page.getByLabel("# Change Events")).toHaveValue("3");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("2");

	await page.getByLabel("play-pause-replay-button").first().click();
	await page.getByLabel("play-pause-replay-button").first().click();
	await expect(page.getByLabel("# Play Events")).toHaveValue("2");
	await expect(page.getByLabel("# Pause Events")).toHaveValue("2");
});
