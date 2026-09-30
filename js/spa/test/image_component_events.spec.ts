import { test, expect, drag_and_drop_file } from "@self/tootils";

test("Image drag-to-upload replaces an image successfully.", async ({
	page,
	context
}) => {
	const initialPages = context.pages();
	await drag_and_drop_file(
		page,
		"input[type=file]",
		"./test/files/cheetah1.jpg",
		"cheetah1.jpg",
		"image/*"
	);
	await expect(page.getByLabel("# Change Events").first()).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");

	await drag_and_drop_file(
		page,
		"input[type=file]",
		"./test/files/bus.png",
		"bus.png",
		"image/*"
	);

	await expect(page.getByLabel("# Change Events").first()).toHaveValue("2");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("2");
	const newPages = context.pages();
	expect(newPages.length).toBe(initialPages.length);
});

test("Image copy from clipboard dispatches upload event.", async ({ page }) => {
	// Need to make request from inside browser for blob to be formatted correctly
	// tried lots of different things
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

	await page.getByLabel("Paste from clipboard").click();
	await expect(page.getByLabel("# Change Events").first()).toHaveValue("1");
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");
});

test("Image paste to clipboard via the Upload component works", async ({
	page
}) => {
	await page.evaluate(async () => {
		navigator.clipboard.writeText("123");
	});

	await page.getByLabel("Paste from clipboard").click();
	await page.evaluate(async () => {
		const canvas = document.createElement("canvas");
		canvas.width = 100;
		canvas.height = 100;
		const ctx = canvas.getContext("2d")!;
		ctx.fillStyle = "blue";
		ctx.fillRect(0, 0, 100, 100);
		const blob = await new Promise<Blob>((resolve) =>
			canvas.toBlob((b) => resolve(b!), "image/png")
		);
		await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
	});

	await page.getByText("Paste from clipboard").click();
	await expect(page.getByLabel("# Upload Events")).toHaveValue("1");
});
