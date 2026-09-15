import { test, expect, drag_and_drop_file } from "@self/tootils";

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
