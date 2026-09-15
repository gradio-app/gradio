import { test, expect } from "@self/tootils";

async function mock_clipboard_with_image(page): Promise<void> {
	await page.evaluate(async () => {
		const canvas = document.createElement("canvas");
		canvas.width = 100;
		canvas.height = 100;
		const ctx = canvas.getContext("2d")!;
		ctx.fillStyle = "red";
		ctx.fillRect(0, 0, 100, 100);
		const blob = await new Promise<Blob>((resolve) =>
			canvas.toBlob((b) => resolve(b!), "image/png")
		);
		await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
	});
}

async function mock_clipboard_with_text(page): Promise<void> {
	await page.evaluate(async () => {
		navigator.clipboard.writeText("just some text, no image");
	});
}

test("Gallery preview mode displays all images/videos correctly.", async ({
	page
}) => {
	await page.getByRole("button", { name: "Run" }).click();
	await page.getByLabel("Thumbnail 2 of 3").click();

	await expect(
		await page.getByTestId("detailed-video").getAttribute("src")
	).toEqual("https://gradio-static-files.s3.amazonaws.com/world.mp4");

	await expect(
		await page.getByTestId("thumbnail 1").getAttribute("src")
	).toEqual("https://gradio-builds.s3.amazonaws.com/assets/cheetah-003.jpg");
});

test("Gallery paste from clipboard works after initial upload", async ({
	page
}) => {
	// First upload a file
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page
			.getByLabel("Click to upload or drop files", { exact: true })
			.first()
			.click()
	]);
	await fileChooser.setFiles(["./test/files/cheetah1.jpg"]);

	await expect(page.getByLabel("Num Upload")).toHaveValue("1");

	// Mock clipboard with an image and paste
	await mock_clipboard_with_image(page);
	await page.getByLabel("Paste from Clipboard").click();

	await expect(page.getByLabel("Num Change")).toHaveValue("2");
});

test("Gallery shows warning toast when clipboard has no image", async ({
	page
}) => {
	// First upload a file so the paste button is visible
	const [fileChooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		page
			.getByLabel("Click to upload or drop files", { exact: true })
			.first()
			.click()
	]);
	await fileChooser.setFiles(["./test/files/cheetah1.jpg"]);

	await expect(page.getByLabel("Num Upload")).toHaveValue("1");

	// Mock clipboard with text only (no image)
	await mock_clipboard_with_text(page);
	await page.getByLabel("Paste from Clipboard").click();

	// Check that warning toast is displayed
	const toast = page.getByTestId("toast-body");
	await expect(toast).toContainText("No image or video found in clipboard");
});
