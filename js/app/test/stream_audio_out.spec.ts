import { test, expect } from "@gradio/tootils";

test("audio streams from wav file correctly", async ({ page }) => {
	const uploader = await page.locator("input[type=file]");
	await uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]);
	await page.getByRole("button", { name: "Stream as File" }).click();
	// @ts-ignore
	await page
		.locator("#stream_as_file_output audio")
		.evaluate(async (el) => await el.play());
	await expect
		.poll(
			async () =>
				await page
					.locator("#stream_as_file_output audio")
					// @ts-ignore
					.evaluate((el) => el.currentTime)
		)
		.toBeGreaterThan(0);
});

test("audio streams from wav file correctly as bytes", async ({ page }) => {
	const uploader = await page.locator("input[type=file]");
	await uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]);
	await page.getByRole("button", { name: "Stream as Bytes" }).click();
	// @ts-ignore
	await page
		.locator("#stream_as_bytes_output audio")
		.evaluate(async (el) => await el.play());
	await expect
		.poll(
			async () =>
				await page
					.locator("#stream_as_bytes_output audio")
					// @ts-ignore
					.evaluate((el) => el.currentTime)
		)
		.toBeGreaterThan(0);
});
