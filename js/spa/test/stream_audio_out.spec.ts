import { test, expect } from "@self/tootils";

test.skip("audio streams from wav file correctly", async ({ page }) => {
	test.skip(!!process.env.CI, "Not supported in CI");
	await page.getByRole("gridcell", { name: "wav" }).first().click();
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

test.skip("audio streams from wav file correctly as bytes", async ({
	page
}) => {
	test.skip(!!process.env.CI, "Not supported in CI");
	await page.getByRole("gridcell", { name: "wav" }).first().click();
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
