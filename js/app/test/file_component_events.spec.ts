import { test, expect, drag_and_drop_file } from "@gradio/tootils";

test("File component properly dispatches load event and click event for the single file case.", async ({
	page
}) => {
	await page
		.getByRole("button", { name: "Drop File Here - or - Click to Upload" })
		.first()
		.click();
	const uploader = await page.getByTestId("Upload Single File-file-upload");
	await uploader.setInputFiles(["./test/files/cheetah1.jpg"]);

	await expect(page.getByLabel("# Load Upload Single File")).toHaveValue("1");

	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("link").nth(0).click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("cheetah1.jpg");
});

test("File component properly dispatches load event and click event for the multiple file case.", async ({
	page
}) => {
	await page
		.getByRole("button", { name: "Drop File Here - or - Click to Upload" })
		.last()
		.click();
	const uploader = await page.getByTestId("Upload Multiple Files-file-upload");
	await uploader.setInputFiles([
		"./test/files/face.obj",
		"./test/files/cheetah1.jpg"
	]);

	await expect(page.getByLabel("# Load Upload Multiple Files")).toHaveValue(
		"1"
	);

	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("link").nth(1).click();
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
