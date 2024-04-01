import { test, expect } from "@gradio/tootils";

test("audio streams correctly", async ({ page }) => {
	const uploader = await page.locator("input[type=file]");
	await uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]);
	await page.getByRole("button", { name: "Stream as File" }).click();
	await page.waitForSelector("audio");
	const isAudioPlaying = await page.evaluate(async () => {
		const audio = document.querySelector("audio");
		if (!audio) {
			return false;
		}
		await audio.play();
		await new Promise((resolve) => setTimeout(resolve, 2000));
		return audio.currentTime > 0;
	});
	await expect(isAudioPlaying).toBeTruthy();
});
