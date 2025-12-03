import { test, expect } from "@self/tootils";

test("Video playback position is retrieved correctly and updates as video plays.", async ({
	page
}) => {
	await page.getByRole("tab", { name: "Video" }).click();

	await page
		.getByRole("button", { name: "Get Video Playback Position" })
		.click();

	await page.waitForTimeout(500);

	const initialPosition = await page
		.getByLabel("Current Playback Position (seconds)")
		.inputValue();
	expect(parseFloat(initialPosition)).toBeGreaterThanOrEqual(4.5);
	expect(parseFloat(initialPosition)).toBeLessThanOrEqual(5.5);

	await page.getByLabel("play-pause-replay-button").first().click();
	await page.waitForTimeout(2000);

	await page
		.getByRole("button", { name: "Get Video Playback Position" })
		.click();
	await page.waitForTimeout(500);

	const updatedPosition = await page
		.getByLabel("Current Playback Position (seconds)")
		.inputValue();
	expect(parseFloat(updatedPosition)).toBeGreaterThan(
		parseFloat(initialPosition)
	);
});

test("Audio playback position is retrieved correctly and updates as audio plays.", async ({
	page
}) => {
	await page.getByRole("tab", { name: "Audio" }).click();
	await page.waitForTimeout(500);

	const initialPosition = await page
		.getByLabel("Current Playback Position (seconds)")
		.inputValue();
	expect(parseFloat(initialPosition)).toBeGreaterThanOrEqual(1.5);
	expect(parseFloat(initialPosition)).toBeLessThanOrEqual(2.5);

	await page
		.getByTestId("waveform-Audio")
		.getByLabel("Play", { exact: true })
		.click();
	await page.waitForTimeout(2000);

	await page
		.getByRole("button", { name: "Get Audio Playback Position" })
		.click();
	await page.waitForTimeout(500);

	const updatedPosition = await page
		.getByLabel("Current Playback Position (seconds)")
		.inputValue();
	expect(parseFloat(updatedPosition)).toBeGreaterThan(
		parseFloat(initialPosition)
	);
});
