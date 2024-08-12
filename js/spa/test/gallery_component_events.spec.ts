import { test, expect } from "@gradio/tootils";

test("Gallery preview mode displays all images correctly.", async ({
	page
}) => {
	await page.getByRole("button", { name: "Run" }).click();
	await page.getByLabel("Thumbnail 2 of 3").click();

	await expect(
		await page.getByTestId("detailed-image").getAttribute("src")
	).toEqual("https://gradio-builds.s3.amazonaws.com/assets/lite-logo.png");

	await expect(
		await page.getByTestId("thumbnail 1").getAttribute("src")
	).toEqual("https://gradio-builds.s3.amazonaws.com/assets/cheetah-003.jpg");
});

test("Gallery select event returns the right value and the download button works correctly", async ({
	page
}) => {
	await page.getByRole("button", { name: "Run" }).click();
	await page.getByLabel("Thumbnail 2 of 3").click();
	await expect(page.getByLabel("Select Data")).toHaveValue(
		"https://gradio-builds.s3.amazonaws.com/assets/lite-logo.png"
	);

	const downloadPromise = page.waitForEvent("download");
	await page.getByLabel("Download").click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe("lite-logo.png");
});

test("Gallery click-to-upload, upload and change events work correctly", async ({
	page
}) => {
	await page
		.getByRole("button", { name: "Drop Image(s) Here - or - Click to Upload" })
		.first()
		.click();
	const uploader = await page.locator("input[type=file]").first();
	await uploader.setInputFiles([
		"./test/files/cheetah1.jpg",
		"./test/files/cheetah1.jpg"
	]);

	await expect(page.getByLabel("Num Upload")).toHaveValue("1");
	await page.getByLabel("Clear").first().click();
	await expect(page.getByLabel("Num Change")).toHaveValue("1");
});
