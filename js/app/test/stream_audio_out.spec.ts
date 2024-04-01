import { test, expect } from "@gradio/tootils";

test("audio streams correctly", async ({ page }) => {
	const uploader = await page.locator("input[type=file]");
	await uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]);
	await page.getByRole('button', { name: 'Stream as File' }).click();
	const isAudioPlaying = await page.evaluate(async () => {
		const audio = document.querySelector('audio');
		if (!audio) {
			return false;
		}
		await audio.play();
		await new Promise(resolve => setTimeout(resolve, 1000));
		return !audio.paused && audio.currentTime > 0 && !audio.ended;
	});
	await expect(isAudioPlaying).toBeTruthy();
});
