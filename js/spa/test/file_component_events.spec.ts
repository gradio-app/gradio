import { test, expect, drag_and_drop_file } from "@self/tootils";

async function error_modal_showed(page) {
	const toast = page.getByTestId("toast-body");
	expect(toast).toContainText("Error");
	const close = page.getByTestId("toast-close");
	await close.click();
	await expect(page.getByTestId("toast-body")).toHaveCount(0);
}

test("File component uploads and downloads a single file with the correct name.", async ({
	page
}) => {
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page.getByLabel("Click to upload or drop files").first().click()
	]);
	await fileChooser.setFiles(["./test/files/cheetah1.jpg"]);

	await expect(page.getByLabel("# Load Upload Single File")).toHaveValue("1");

	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("link").nth(0).click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("cheetah1.jpg");
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

test("File component accepts a compound extension in file_types.", async ({
	page
}) => {
	const locator = page.locator("input[type=file]").nth(6);
	await drag_and_drop_file(
		page,
		locator,
		"./test/files/alphabet.txt",
		"brain.nii.gz",
		"application/gzip"
	);

	await expect(
		page.getByLabel("# Load Upload Compound Extension File")
	).toHaveValue("1");
});

test("File component widens the accept attribute for a compound extension.", async ({
	page
}) => {
	await expect(page.locator("input[type=file]").nth(6)).toHaveAttribute(
		"accept",
		".nii.gz, .gz"
	);
});

test("File component rejects a partial match of a compound extension in file_types.", async ({
	page
}) => {
	const locator = page.locator("input[type=file]").nth(6);
	await drag_and_drop_file(
		page,
		locator,
		"./test/files/alphabet.txt",
		"brain.nii",
		"application/octet-stream"
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
