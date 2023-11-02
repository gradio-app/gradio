import { test, expect, drag_and_drop_file } from "@gradio/tootils";

test("Audio click-to-upload uploads audio successfuly.", async ({ page }) => {
	await page
		.getByRole("button", { name: "Drop Audio Here - or - Click to Upload" })
		.click();
	const uploader = await page.locator("input[type=file]");
	await Promise.all([
		uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]),
		page.waitForResponse("**/upload")
	]);

	await expect(page.getByLabel("# Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");

	await page.getByLabel("Clear").click();
	await expect(page.getByLabel("# Change Events")).toHaveValue("2");
	await page
		.getByRole("button", { name: "Drop Audio Here - or - Click to Upload" })
		.click();

	await Promise.all([
		uploader.setInputFiles(["../../test/test_files/audio_sample.wav"]),
		page.waitForResponse("**/upload")
	]);

	await expect(page.getByLabel("# Change Events")).toHaveValue("3");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("2");
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
		page.waitForResponse("**/upload")
	]);
	await expect(page.getByLabel("# Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");
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
