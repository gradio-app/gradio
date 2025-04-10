import { test, expect, drag_and_drop_file } from "@self/tootils";

test("Video click-to-upload uploads video successfuly. Clear, play, and pause buttons dispatch events correctly. Downloading the file works and has the correct name.", async ({
	page
}) => {
	let [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByLabel("Drop a video file here to upload").first().click()
	]);
	await fileChooser.setFiles(["./test/files/av1-video.mp4"]);
	await expect(page.getByLabel("# Change Events")).toHaveValue("1");

	await expect(page.getByLabel("# Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");

	await page.getByLabel("Clear").click();
	await expect(page.getByLabel("# Change Events")).toHaveValue("2");

	const [fileChooser_two] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByLabel("Drop a video file here to upload").first().click()
	]);

	await fileChooser_two.setFiles(["./test/files/av1-video.mp4"]);

	await expect(page.getByLabel("# Change Events")).toHaveValue("3");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("2");

	const downloadPromise = page.waitForEvent("download");
	await page.getByLabel("Download").click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("av1-video.mp4");
});

test.skip("Video play, pause events work correctly.", async ({ page }) => {
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByLabel("Drop a video file here to upload").first().click()
	]);
	await fileChooser.setFiles(["./test/files/av1-video.mp4"]);

	// Wait change event to trigger

	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");
	await expect(page.getByLabel("# Change Events")).toHaveValue("1");

	await page.getByLabel("play-pause-replay-button").first().click();
	await expect(page.getByLabel("# Play Events")).toHaveValue("1");
	await page.getByLabel("play-pause-replay-button").first().click();
	await expect(page.getByLabel("# Pause Events")).toHaveValue("1");
});

test("Video drag-and-drop uploads a file to the server correctly.", async ({
	page
}) => {
	await drag_and_drop_file(
		page,
		"input[type=file]",
		"./test/files/file_test.ogg",
		"file_test.ogg",
		"video/*"
	);
	await expect(page.getByLabel("# Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");
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
