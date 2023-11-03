import { test, expect } from "@gradio/tootils";

test("Gallery preview mode displays all images correctly.", async ({
	page
}) => {
	await page.getByRole("button", { name: "Run" }).click();
	await page.getByLabel("Thumbnail 2 of 5").click();

	expect(await page.getByTestId("detailed-image").getAttribute("src")).toEqual(
		"https://nationalzoo.si.edu/sites/default/files/animals/cheetah-003.jpg"
	);

	expect(await page.getByTestId("thumbnail 1").getAttribute("src")).toEqual(
		"https://upload.wikimedia.org/wikipedia/commons/0/09/TheCheethcat.jpg"
	);
});

test("Gallery select event returns the right value", async ({ page }) => {
	await page.getByRole("button", { name: "Run" }).click();
	await page.getByLabel("Thumbnail 2 of 5").click();

	expect(await page.getByLabel("Select Data")).toHaveValue(
		"https://nationalzoo.si.edu/sites/default/files/animals/cheetah-003.jpg"
	);
});

// test("Video click-to-upload uploads video successfuly. Clear, play, and pause buttons dispatch events correctly.", async ({
// 	page
// }) => {
// 	await page
// 		.getByRole("button", { name: "Drop Video Here - or - Click to Upload" })
// 		.click();
// });
