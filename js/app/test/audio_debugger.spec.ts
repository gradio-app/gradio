import { test } from "@gradio/tootils";

// we cannot currently test the waveform canvas with playwright (https://github.com/microsoft/playwright/issues/23964)
// so this test covers the interactive elements around the waveform canvas

test("audio waveform", async ({ page }) => {
	await page.getByRole("button", { name: "Interface" }).click();
	await page.getByRole("button", { name: "cantina.wav" }).click();
	await page
		.getByTestId("waveform-x")
		.getByLabel("Adjust playback speed to 1.5x")
		.click();
	await page.getByLabel("Adjust playback speed to 2x").click();

	await page
		.getByTestId("waveform-x")
		.getByLabel("Skip forward by 0.15 seconds")
		.click();
	await page
		.getByTestId("waveform-x")
		.getByLabel("Skip backwards by 0.15 seconds")
		.click();
	await page.getByLabel("Trim audio to selection").click();
	await page.getByRole("button", { name: "Trim" }).click();
	await page.getByLabel("Reset audio").click();
	await page.getByRole("button", { name: "Submit" }).click();
	await page
		.getByTestId("waveform-output")
		.getByLabel("Adjust playback speed to 1.5x")
		.click();
	await page
		.getByTestId("waveform-output")
		.getByLabel("Skip backwards by 0.15 seconds")
		.click();
	await page
		.getByTestId("waveform-output")
		.getByLabel("Skip forward by 0.15 seconds")
		.click();
});
