import { test, expect, drag_and_drop_file } from "@self/tootils";

async function error_modal_showed(page) {
	const toast = page.getByTestId("toast-body");
	expect(toast).toContainText("Error");
	const close = page.getByTestId("toast-close");
	await close.click();
	await expect(page.getByTestId("toast-body")).toHaveCount(0);
}

test("File component properly dispatches load event for the single file case.", async ({
	page
}) => {
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page
			.getByRole("button", { name: "Drop File Here - or - Click to Upload" })
			.first()
			.click()
	]);
	await fileChooser.setFiles(["./test/files/cheetah1.jpg"]);

	await expect(page.getByLabel("# Load Upload Single File")).toHaveValue("1");

	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("link").nth(0).click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("cheetah1.jpg");
});

test("File component drag-and-drop uploads a file to the server correctly.", async ({
	page
}) => {
	const uploader = await page.locator("input[type=file]").nth(1);
	await uploader.setInputFiles(["./test/files/alphabet.txt"]);

	await expect(
		page.getByLabel("# Load Upload Multiple Files").first()
	).toHaveValue("1");
});

test("File component properly handles drag and drop of image and video files.", async ({
	page
}) => {
	const uploader = await page.locator("input[type=file]").nth(2);
	await uploader.setInputFiles(["./test/files/cheetah1.jpg"]);

	// Check that the image file was uploaded
	await expect(
		page.getByLabel("# Load Upload Multiple Files Image/Video")
	).toHaveValue("1");

	await page.getByLabel("Clear").click();

	await uploader.setInputFiles(["./test/files/world.mp4"]);

	// Check that the video file was uploaded
	await expect(
		page.getByLabel("# Load Upload Multiple Files Image/Video")
	).toHaveValue("2");
});

test("File component properly handles drag and drop of pdf file.", async ({
	page
}) => {
	const uploader = await page.locator("input[type=file]").nth(3);
	await uploader.setInputFiles(["./test/files/contract.pdf"]);

	// Check that the pdf file was uploaded
	await expect(page.getByLabel("# Load Upload PDF File")).toHaveValue("1");
});

test("File component properly handles invalid file_types.", async ({
	page
}) => {
	const locator = page.locator("input[type=file]").nth(4);
	await drag_and_drop_file(
		page,
		locator,
		"./test/files/cheetah1.jpg",
		"cheetah1.jpg",
		"image/jpeg"
	);

	await error_modal_showed(page);
});

test("Delete event is fired correctly", async ({ page }) => {
	const locator = page.locator("input[type=file]").nth(5);
	await drag_and_drop_file(
		page,
		locator,
		"./test/files/cheetah1.jpg",
		"cheetah1.jpg",
		"image/jpeg",
		2
	);

	await page.getByLabel("Remove this file").first().click();

	await expect(page.getByLabel("# Deleted File")).toHaveValue("1");
	expect(
		(await page.getByLabel("Delete file data").inputValue()).length
	).toBeGreaterThan(5);
});
