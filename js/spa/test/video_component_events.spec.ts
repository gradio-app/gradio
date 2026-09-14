import { test, expect, drag_and_drop_file } from "@self/tootils";

test("Video click-to-upload downloads the file with the correct name.", async ({
	page
}) => {
	let [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByLabel("Drop a video file here to upload").first().click()
	]);
	await fileChooser.setFiles(["./test/files/av1-video.mp4"]);

	const downloadPromise = page.waitForEvent("download");
	await page.getByLabel("Download").click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("av1-video.mp4");
});

test("Video drag-and-drop displays a warning when the file is of the wrong mime type.", async ({
	page
}) => {
	await drag_and_drop_file(
		page,
		"input[type=file]",
		"./test/files/file_test.ogg",
		"file_test.ogg"
	);
	const toast = page.getByTestId("toast-body");
	expect(toast).toContainText("Warning");
});
