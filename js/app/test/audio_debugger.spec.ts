import { test } from "@playwright/test";

test("Audio waveform", async ({ page }) => {
	await page.getByRole('button', { name: 'Interface' }).click();
	await page.getByRole('button', { name: 'cantina.wav' }).click();
	await page.getByTestId('waveform-x').getByLabel('Adjust playback speed to 1.5x').click();
	await page.getByLabel('Adjust playback speed to 2x').click();
	await page.getByTestId('waveform-x').getByLabel('common.pause').click();
	await page.getByLabel('common.play').click();
	await page.getByTestId('waveform-x').getByLabel('Skip forward by 0.15 seconds').click();
	await page.getByTestId('waveform-x').getByLabel('Skip backwards by 0.15 seconds').click();
	await page.getByLabel('Trim audio to selection').click();
	await page.getByRole('button', { name: 'Trim' }).click();
	await page.getByLabel('Reset audio').click();
	await page.getByRole('button', { name: 'Submit' }).click();
	await page.getByTestId('waveform-output').getByLabel('common.pause').click();
	await page.getByLabel('common.play').click();
	await page.getByTestId('waveform-output').getByLabel('Adjust playback speed to 1.5x').click();
	await page.getByTestId('waveform-output').getByLabel('Skip backwards by 0.15 seconds').click();
	await page.getByTestId('waveform-output').getByLabel('Skip forward by 0.15 seconds').click();
});
