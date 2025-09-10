import { test, expect } from "@self/tootils";

test.skip("video streams from ts files correctly", async ({ page }) => {
	test.skip(!!process.env.CI, "Not supported in CI");
	await page.getByRole("gridcell", { name: "false" }).click();
	await page.waitForSelector("[data-testid='video'] video");
	await page.getByRole("button", { name: "process video" }).click();
	await expect
		.poll(
			async () =>
				await page
					.locator("#stream_video_output video")
					// @ts-ignore
					.evaluate((el) => el.currentTime)
		)
		.toBeGreaterThan(0);
});

test.skip("video streams from mp4 files correctly", async ({ page }) => {
	test.skip(!!process.env.CI, "Not supported in CI");
	await page.getByRole("gridcell", { name: "true" }).click();
	await page.waitForSelector("[data-testid='video'] video");
	await page.getByRole("button", { name: "process video" }).click();
	await expect
		.poll(
			async () =>
				await page
					.locator("#stream_video_output video")
					// @ts-ignore
					.evaluate((el) => el.currentTime)
		)
		.toBeGreaterThan(0);
});
