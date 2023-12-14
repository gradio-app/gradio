import { test, expect, drag_and_drop_file } from "@gradio/tootils";
import fs from "fs";

test("Image click-to-upload uploads image successfuly. Clear button dispatches event correctly. Downloading the file works and has the correct name.", async ({
	page
}) => {
	await page.getByRole("button", { name: "Drop Image Here" }).click();
	const uploader = await page.locator("input[type=file]");
	const change_counter = await page.getByLabel("# Change Events", {
		exact: true
	});
	const clear_counter = await page.getByLabel("# Clear Events");
	const upload_counter = await page.getByLabel("# Upload Events");
	const change_output_counter = await page.getByLabel("# Change Events Output");

	await uploader.setInputFiles("./test/files/cheetah1.jpg");

	await expect(change_counter).toHaveValue("1");
	await expect(upload_counter).toHaveValue("1");
	await expect(change_output_counter).toHaveValue("1");

	const downloadPromise = page.waitForEvent("download");
	await page.getByLabel("Download").click();
	const download = await downloadPromise;
	// PIL converts from .jpg to .jpeg
	await expect(download.suggestedFilename()).toBe("cheetah1.jpeg");

	await page.getByLabel("Remove Image").click();
	await expect(clear_counter).toHaveValue("1");
	await expect(change_counter).toHaveValue("2");
	await expect(upload_counter).toHaveValue("1");

	await uploader.setInputFiles("./test/files/gradio-logo.svg");
	await expect(change_counter).toHaveValue("3");
	await expect(upload_counter).toHaveValue("2");
	await expect(change_output_counter).toHaveValue("2");

	const SVGdownloadPromise = page.waitForEvent("download");
	await page.getByLabel("Download").click();
	const SVGdownload = await SVGdownloadPromise;
	expect(SVGdownload.suggestedFilename()).toBe("gradio-logo.svg");
});

test("Image drag-to-upload uploads image successfuly.", async ({ page }) => {
	await drag_and_drop_file(
		page,
		"input[type=file]",
		"./test/files/cheetah1.jpg",
		"cheetag1.jpg",
		"image/*"
	);
	await expect(page.getByLabel("# Change Events").first()).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");
});

test("Image copy from clipboard dispatches upload event.", async ({ page }) => {
	// Need to make request from inside browser for blob to be formatted correctly
	// tried lots of different things
	await page.evaluate(async () => {
		const blob = await (
			await fetch(
				`https://gradio-builds.s3.amazonaws.com/assets/PDFDisplay.png`
			)
		).blob();
		navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
	});

	await page.getByLabel("clipboard-image-toolbar-btn").click();
	await expect(page.getByLabel("# Change Events").first()).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");
});
