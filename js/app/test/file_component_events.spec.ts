import { test, expect, drag_and_drop_file } from "@gradio/tootils";

test("File component properly dispatches load event for the single file case.", async ({
	page
}) => {
	await page
		.getByRole("button", { name: "Drop File Here - or - Click to Upload" })
		.first()
		.click();
	const uploader = await page.getByTestId("file-upload").first();
	await uploader.setInputFiles(["./test/files/cheetah1.jpg"]);

	await expect(page.getByLabel("# Load Upload Single File")).toHaveValue("1");

	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("link").nth(0).click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("cheetah1.jpg");
});

test("File component drag-and-drop uploads a file to the server correctly.", async ({
	page
}) => {
	await drag_and_drop_file(
		page,
		"input[type=file]",
		"./test/files/alphabet.txt",
		"alphabet.txt"
	);
});

test("File component properly handles drag and drop of image and video files.", async ({
	page
}) => {
	// Simulate dragging and dropping an image file
	await drag_and_drop_file(
		page,
		"input[type=file]",
		"./test/files/cheetah1.jpg",
		"cheetah1.jpg"
	);

	// Check that the image file was uploaded
	await expect(page.getByLabel("# Load Upload Multiple Files")).toHaveValue(
		"1"
	);

	// Simulate dragging and dropping a video file
	await drag_and_drop_file(
		page,
		"input[type=file]",
		"./test/files/video1.mp4",
		"video1.mp4"
	);

	// Check that the video file was uploaded
	await expect(page.getByLabel("# Load Upload Multiple Files")).toHaveValue(
		"2"
	);
});
