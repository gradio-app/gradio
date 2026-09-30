import { test, expect } from "@self/tootils";

test("clicking cached example loads image and video correctly", async ({
	page
}) => {
	// Click the first example row in the examples table
	const example_row = page.locator("tr.tr-body").first();
	await expect(example_row).toBeVisible();
	await example_row.click();

	// Verify the input image loaded successfully (populated via queue=False /run/ endpoint)
	const input_image = page.locator(
		'div.block:has(label:has-text("Image")) img'
	);
	await expect(input_image.first()).toHaveJSProperty("complete", true);
	await expect(input_image.first()).not.toHaveJSProperty("naturalWidth", 0);

	// Verify the output image loaded successfully (populated via queue)
	const output_image = page.locator("#output-img img");
	await expect(output_image).toHaveJSProperty("complete", true);
	await expect(output_image).not.toHaveJSProperty("naturalWidth", 0);

	// Verify the output video loaded successfully
	const output_video = page.locator(
		'div.block:has(label:has-text("Video")) video'
	);
	await expect(output_video.last()).toBeVisible();
	const video_src = await output_video
		.last()
		.evaluate((el: HTMLVideoElement) => {
			const source = el.querySelector("source");
			return source?.src || el.src;
		});
	expect(video_src).toBeTruthy();
	// Verify the video file URL returns 200 (not 404 from wrong root_url)
	const response = await page.request.get(video_src);
	expect(response.status()).toBe(200);
});
