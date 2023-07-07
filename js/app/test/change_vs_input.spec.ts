import { test, expect } from "@gradio/tootils";

test("change() event only gets triggered only once", async ({ page }) => {
	const counter = await page.getByLabel("Change counter")
	await expect(counter).toHaveValue("0");

	const image_input = await page.locator("#image-original input")
	await image_input.setInputFiles("./test/files/cheetah1.jpg");
	await expect(counter).toHaveValue("1");

	const audio_input = await page.locator("#audio-original input")
	await audio_input.setInputFiles("./test/files/cantina.wav");
	await expect(counter).toHaveValue("2");

	const video_input = await page.locator("#video-original input")
	await video_input.setInputFiles("./test/files/world.mp4");
	await expect(counter).toHaveValue("3");
});

test("change() event gets triggered upon programmatic change", async ({ page }) => {
	const image_input = await page.locator("#image-original input")
	await image_input.setInputFiles("./test/files/cheetah1.jpg");

	const image_change = await page.locator("#image-change img")
	const image_change_2 = await page.locator("#image-change-2 img")
	const image_in_change = await image_change.getAttribute("src")
	const image_in_change_2 = await image_change_2.getAttribute("src")
	await expect(image_in_change).toEqual(image_in_change_2);

	const audio_input = await page.locator("#audio-original input")
	await audio_input.setInputFiles("./test/files/cantina.wav");

	const audio_change = await page.locator("#audio-change audio")
	const audio_change_2 = await page.locator("#audio-change-2 audio")
	const audio_in_change = await audio_change.getAttribute("src")
	const audio_in_change_2 = await audio_change_2.getAttribute("src")
	await expect(audio_in_change).toEqual(audio_in_change_2);

	const video_input = await page.locator("#video-original input")
	await video_input.setInputFiles("./test/files/world.mp4");

	const video_change = await page.locator("#video-change img")
	const video_change_2 = await page.locator("#video-change-2 img")
	const video_in_change = await video_change.getAttribute("src")
	const video_in_change2 = await video_change_2.getAttribute("src")
	await expect(video_in_change).toEqual(video_in_change2);
});
