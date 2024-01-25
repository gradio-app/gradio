import { test, expect, drag_and_drop_file } from "@gradio/tootils";
import { chromium } from "playwright";

test("Audio click-to-upload uploads audio successfuly. File downloading works and file has correct name.", async ({
	page
}) => {
	await page
		.getByRole("button", { name: "Drop Audio Here - or - Click to Upload" })
		.click();
	const uploader = await page.locator("input[type=file]");
	await uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]);

	await expect(page.getByLabel("# Input Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Input Upload Events")).toHaveValue("1");

	await page.getByLabel("Clear").click();
	await expect(page.getByLabel("# Input Change Events")).toHaveValue("2");
	await page
		.getByRole("button", { name: "Drop Audio Here - or - Click to Upload" })
		.click();

	await uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]);

	await expect(page.getByLabel("# Input Change Events")).toHaveValue("3");
	await expect(page.getByLabel("# Input Upload Events")).toHaveValue("2");

	const downloadPromise = page.waitForEvent("download");
	await page.getByLabel("Download").click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("audio_sample.wav");
});

test("Audio drag-and-drop uploads a file to the server correctly.", async ({
	page
}) => {
	await drag_and_drop_file(
		page,
		"input[type=file]",
		"../../test/test_files/audio_sample.wav",
		"audio_sample.wav",
		"audio/wav"
	);
	await expect(page.getByLabel("# Input Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Input Upload Events")).toHaveValue("1");
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
	expect(toast).toContainText("warning");
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

test("Record, pause, and stop events work correctly.", async ({ page }) => {
	const browser = await chromium.launch({
		args: ["--use-fake-ui-for-media-stream"]
	});

	const context = await browser.newContext({
		permissions: ["microphone"]
	});

	context.grantPermissions(["microphone"]);

	await page.getByLabel('Record audio').click();

	await page.getByRole('button', { name: 'Record', exact: true }).click();
	expect(await page.getByLabel('# Output Record Events').inputValue()).toBe('1');

	await page.getByText('Pause').click();
	expect(await page.getByLabel('# Output Pause Events').inputValue()).toBe('1');

	await page.getByRole('button', { name: 'Resume' }).click();
	await page.getByRole('button', { name: 'Stop' }).click();

	expect(await page.getByLabel('# Output Stop Events').inputValue()).toBe('1');
});