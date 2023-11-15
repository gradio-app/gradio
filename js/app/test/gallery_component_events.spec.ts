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

test("Gallery select event returns the right value", async ({ page }) => {
	await page.getByRole("button", { name: "Run" }).click();
	await page.getByLabel("Thumbnail 2 of 3").click();
	await expect(page.getByLabel("Select Data")).toHaveValue(
		"https://gradio-builds.s3.amazonaws.com/assets/lite-logo.png"
	);
});
