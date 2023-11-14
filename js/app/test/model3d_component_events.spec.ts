import { test, expect } from "@gradio/tootils";

test("Model3D click-to-upload uploads file successfuly. Upload and clear events work correctly. Downloading works.", async ({
	page
}) => {
	await page
		.getByRole("button", { name: "Drop File Here - or - Click to Upload" })
		.click();
	const uploader = await page.locator("input[type=file]");
	await Promise.all([
		uploader.setInputFiles(["./test/files/face.obj"]),
		page.waitForResponse("**/upload?*?*")
	]);

	await expect(page.getByLabel("# Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");

	await page.getByLabel("Clear").nth(0).click();
	await expect(page.getByLabel("# Change Events")).toHaveValue("2");
	await expect(page.getByLabel("# Clear Events")).toHaveValue("1");
	await expect(page.getByLabel("Clear Value")).toHaveValue("");

	const downloadPromise = page.waitForEvent("download");
	await page.getByLabel("Download").click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("face.obj");
});
