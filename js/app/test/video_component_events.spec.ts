import { test, expect } from "@gradio/tootils";
import { readFileSync } from "fs";

const dragAndDropFile = async (
  page: Page,
  selector: string,
  filePath: string,
  fileName: string,
  fileType = ''
) => {
  const buffer = readFileSync(filePath).toString('base64');

  const dataTransfer = await page.evaluateHandle(
    async ({ bufferData, localFileName, localFileType }) => {
      const dt = new DataTransfer();

      const blobData = await fetch(bufferData).then((res) => res.blob());

      const file = new File([blobData], localFileName, { type: localFileType });
      dt.items.add(file);
      return dt;
    },
    {
      bufferData: `data:application/octet-stream;base64,${buffer}`,
      localFileName: fileName,
      localFileType: fileType,
    }
  );

  await page.dispatchEvent(selector, 'drop', { dataTransfer });
};


test("test video click-to-upload and play-pause trigger", async ({ page }) => {
	await page
		.getByRole("button", { name: "Drop Video Here - or - Click to Upload" })
		.click();
	const uploader = await page.locator("input[type=file]");
	await Promise.all([
		uploader.setInputFiles(["./test/files/file_test.ogg"]),
		page.waitForResponse("**/upload")
	]);

	await expect(page.getByLabel("# Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");

	await page.getByLabel("play-pause-replay-button").nth(0).click();
	await page.getByLabel("play-pause-replay-button").nth(0).click();
	await expect(page.getByLabel("# Play Events")).toHaveValue("1");
	await expect(page.getByLabel("# Pause Events")).toHaveValue("1");

	await page.getByLabel("Clear").click();
	await expect(page.getByLabel("# Change Events")).toHaveValue("2");
	await page
		.getByRole("button", { name: "Drop Video Here - or - Click to Upload" })
		.click();

	await Promise.all([
		uploader.setInputFiles(["./test/files/file_test.ogg"]),
		page.waitForResponse("**/upload")
	]);

	await expect(page.getByLabel("# Change Events")).toHaveValue("3");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("2");

	await page.getByLabel("play-pause-replay-button").first().click();
	await page.getByLabel("play-pause-replay-button").first().click();
	await expect(page.getByLabel("# Play Events")).toHaveValue("2");
	await expect(page.getByLabel("# Pause Events")).toHaveValue("2");
});


test("test video drag-and-drop", async ({ page }) => {
	await dragAndDropFile(page, 'button', './test/files/file_test.ogg', 'file_test.ogg', "video/*");
  await page.waitForResponse("**/upload");
	await expect(page.getByLabel("# Change Events")).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");
});


test("test video drag-and-drop invalid mime type raises warning toast", async ({ page }) => {
	await dragAndDropFile(page, 'button', './test/files/file_test.ogg', 'file_test.ogg');
  const toast = page.getByTestId("toast-body");
	expect(toast).toContainText("warning");
});