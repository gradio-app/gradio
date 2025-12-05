import { test, expect } from "@self/tootils";

test("Audio playback position is retrieved correctly and updates as audio plays.", async ({
	page
}) => {
	await page.getByRole("tab", { name: "Audio" }).click();
	await page.waitForSelector('[data-testid="waveform-Audio"] svg');
	await page
		.getByRole("button", { name: "Get Audio Playback Position" })
		.click();

	const initialPositionBox = page.getByLabel(
		"Current Audio Position (seconds)"
	);
	await expect(initialPositionBox).not.toHaveValue("0");

	const initialPosition = await initialPositionBox.inputValue();
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
	await expect(initialPositionBox).not.toHaveValue(initialPosition);

	const updatedPosition = await page
		.getByLabel("Current Audio Position (seconds)")
		.inputValue();
	expect(parseFloat(updatedPosition)).toBeGreaterThan(
		parseFloat(initialPosition)
	);
});
