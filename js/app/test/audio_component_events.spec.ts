import { test, expect, drag_and_drop_file } from "@gradio/tootils";

test("Audio click-to-upload uploads audio successfuly. File downloading works and file has correct name.", async ({
	page
}) => {
	await page
		.getByRole("button", { name: "Drop Audio Here - or - Click to Upload" })
		.click();
	const uploader = await page.locator("input[type=file]");
	await Promise.all([
		uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]),
		page.waitForResponse("**/upload?*")
	]);

	await expect(page.getByLabel("# Input Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Input Upload Events")).toHaveValue("1");

	await page.getByLabel("Clear").click();
	await expect(page.getByLabel("# Input Change Events")).toHaveValue("2");
	await page
		.getByRole("button", { name: "Drop Audio Here - or - Click to Upload" })
		.click();

	await Promise.all([
		uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]),
		page.waitForResponse("**/upload?*")
	]);

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
	await Promise.all([
		drag_and_drop_file(
			page,
			"input[type=file]",
			"../../test/test_files/audio_sample.wav",
			"audio_sample.wav",
			"audio/wav"
		),
		page.waitForResponse("**/upload?*")
	]);
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

test("Play, Pause, and stop events work correctly.", async ({ page }) => {
	const uploader = await page.locator("input[type=file]");
	await Promise.all([
		uploader.setInputFiles(["../../demo/audio_debugger/cantina.wav"]),
		page.waitForResponse("**/upload?*")
	]);

	await page
		.getByTestId("waveform-Output Audio")
		.getByLabel("Play", { exact: true })
		.click();
	await page.getByTestId("waveform-Output Audio").getByLabel("Pause").click();
	await page
		.getByTestId("waveform-Output Audio")
		.getByLabel("Play", { exact: true })
		.click();

	const event_triggered = async (label: string) => {
		const value = await page.getByLabel(label).inputValue();
		expect(Number(value)).toBeGreaterThan(0);
	};

	// toPass will retry the function until it passes or times out
	// need this because the stop event is only triggered when the video is done playing
	// hard to time otherwise
	await expect(async () => event_triggered("# Output Play Events")).toPass();
	await expect(async () => event_triggered("# Output Pause Events")).toPass();
	await expect(async () => event_triggered("# Output Stop Events")).toPass();
});
