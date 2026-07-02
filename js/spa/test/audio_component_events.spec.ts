import { test, expect, drag_and_drop_file } from "@self/tootils";
import { chromium } from "playwright";

test("Audio click-to-upload downloads the file with the correct name.", async ({
	page
}) => {
	const uploader = await page.locator("input[type=file]");
	await uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]);

	const downloadPromise = page.waitForEvent("download");
	await page.getByLabel("Download").nth(1).click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("audio_sample.wav");
});

test("Audio drag-and-drop displays a warning when the file is of the wrong mime type.", async ({
	page
}) => {
	await drag_and_drop_file(
		page,
		"input[type=file]",
		"../../test/test_files/audio_sample.wav",
		"audio_sample.wav"
	);
	const toast = page.getByTestId("toast-body");
	expect(toast).toContainText("Warning");
});

test.skip("Play, Pause, and stop events work correctly.", async ({ page }) => {
	const uploader = await page.locator("input[type=file]");
	await uploader.setInputFiles(["../../demo/audio_debugger/cantina.wav"]);
	const event_triggered = async (label: string) => {
		const value = await page.getByLabel(label).inputValue();
		expect(Number(value)).toBeGreaterThan(0);
	};

	await page
		.getByTestId("waveform-Output Audio")
		.getByLabel("Play", { exact: true })
		.click();
	await expect(async () => event_triggered("# Output Play Events")).toPass();

	await page.getByTestId("waveform-Output Audio").getByLabel("Pause").click();
	await expect(async () => event_triggered("# Output Pause Events")).toPass();

	await page
		.getByTestId("waveform-Output Audio")
		.getByLabel("Play", { exact: true })
		.click();
	await expect(async () => event_triggered("# Output Stop Events")).toPass();
});

test.skip("Record, pause, and stop recording events work correctly.", async ({
	page
}) => {
	const browser = await chromium.launch();
	const context = await browser.newContext({
		permissions: ["microphone"]
	});
	context.grantPermissions(["microphone"]);

	await page.getByLabel("Record audio").click();
	await page.getByRole("button", { name: "Record", exact: true }).click();

	expect(await page.getByLabel("# Input Start Recording Events")).toHaveValue(
		"1"
	);

	await page.waitForTimeout(2000);
	await page.getByLabel("pause", { exact: true }).click();
	await page.getByRole("button", { name: "Resume" }).click();

	expect(await page.getByLabel("# Input Pause Recording Events")).toHaveValue(
		"1"
	);

	await page.getByRole("button", { name: "Stop" }).click();

	expect(await page.getByLabel("# Input Stop Recording Events")).toHaveValue(
		"1"
	);

	expect(await page.getByLabel("# Input Change Events")).toHaveValue("1");
});
