import { test, expect } from "@self/tootils";

test("event-loaded ImageEditor with sources disabled exposes transform tools", async ({
	page
}) => {
	const editor = page.locator("#no-sources-editor");

	await page.getByRole("button", { name: "Load no-source image" }).click();
	await expect(editor.getByLabel("Image")).toBeVisible();

	await editor.getByLabel("Image").click();

	await expect(editor.getByLabel("Crop")).toBeVisible();
	await expect(editor.getByLabel("Resize")).toBeVisible();
});

test("ImageEditor can be hidden and shown without resize tool errors", async ({
	page
}) => {
	const page_errors: string[] = [];
	page.on("pageerror", (error) => {
		page_errors.push(String(error.stack || error.message || error));
	});

	for (let i = 0; i < 2; i++) {
		await page.getByRole("button", { name: "Hide editor column" }).click();
		await expect(page.locator("#toggle-editor")).toHaveCount(0);

		await page.getByRole("button", { name: "Show editor column" }).click();
		await expect(page.locator("#toggle-editor")).toBeVisible();
		await expect(
			page.locator("#toggle-editor").getByRole("button", {
				name: "Brush",
				exact: true
			})
		).toBeVisible();
	}

	expect(page_errors).toEqual([]);
});
