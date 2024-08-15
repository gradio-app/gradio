import { test, expect } from "@gradio/tootils";

test("UploadButton properly dispatches load event and click event for the single file case.", async ({
	page
}) => {
	await page.getByRole("button", { name: "Upload Single File" }).click();
	const uploader = await page.getByTestId("Upload Single File-upload-button");
	await uploader.setInputFiles(["./test/files/cheetah1.jpg"]);

	await expect(page.getByLabel("# Load Upload Single File")).toHaveValue("1");
	await expect(
		page.getByLabel("# Click Upload Single File Output")
	).toHaveValue("1");

	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("link").nth(0).click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("cheetah1.jpg");
});

test.skip("UploadButton properly dispatches load event and click event for the multiple file case.", async ({
	page
}) => {
	await page.getByRole("button", { name: "Upload Multiple Files" }).click();
	const uploader = await page.getByTestId(
		"Upload Multiple Files-upload-button"
	);
	await uploader.setInputFiles([
		"./test/files/face.obj",
		"./test/files/cheetah1.jpg"
	]);

	await expect(page.getByLabel("# Load Upload Multiple Files")).toHaveValue(
		"1"
	);
	await expect(
		page.getByLabel("# Click Upload Multiple Files Output")
	).toHaveValue("1");

	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("link").nth(1).click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("cheetah1.jpg");
});
