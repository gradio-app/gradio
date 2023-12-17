import { test, expect, drag_and_drop_file } from "@gradio/tootils";

test("Model3D click-to-upload uploads file successfuly. Upload and clear events work correctly. Downloading works.", async ({
	page
}) => {
	await page
		.getByRole("button", { name: "Drop File Here - or - Click to Upload" })
		.click();
	const uploader = await page.locator("input[type=file]");
	const change_counter = await page.getByLabel("# Change Events");
	const upload_counter = await page.getByLabel("# Upload Events");
	const clear_counter = await page.getByLabel("# Clear Events");

	await uploader.setInputFiles("./test/files/face.obj");

	await expect(change_counter).toHaveValue("1");
	await expect(upload_counter).toHaveValue("1");

	await page.getByLabel("Clear").nth(0).click();
	await expect(change_counter).toHaveValue("2");
	await expect(clear_counter).toHaveValue("1");
	await expect(await page.getByLabel("Clear Value")).toHaveValue("");

	const downloadPromise = page.waitForEvent("download");
	await page.getByLabel("Download").click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("face.obj");
});

test("Model3D drag-and-drop uploads a file to the server correctly.", async ({
	page
}) => {
	await drag_and_drop_file(
		page,
		"input[type=file]",
		"./test/files/face.obj",
		"face.obj"
	);
	await expect(await page.getByLabel("# Change Events")).toHaveValue("1");
	await expect(await page.getByLabel("# Upload Events")).toHaveValue("1");
});
