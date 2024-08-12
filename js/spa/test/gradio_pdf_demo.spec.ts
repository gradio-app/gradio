import { test, expect } from "@gradio/tootils";

test("Custom PDF component demo can be loaded and inference function works .", async ({
	page
}) => {
	await page
		.getByRole("button", { name: "Drop PDF - or - Click to Upload" })
		.first()
		.click();
	const uploader = await page.locator("input[type=file]").first();
	await uploader.setInputFiles(["./test/files/contract.pdf"]);

	await page.getByRole("button", { name: "Submit" }).click();

	await expect(page.getByLabel("contract.pdf")).toBeVisible();

	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("link").nth(0).click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toBe("contract.pdf");
});

test.skip("Custom PDF component examples load properly .", async ({ page }) => {
	expect(page.locator("canvas")).toBeVisible();
});
