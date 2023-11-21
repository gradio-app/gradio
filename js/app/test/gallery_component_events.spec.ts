import { test, expect } from "@gradio/tootils";

const regexLocalHostFileURL = (basename: string) =>
	new RegExp(`^http://localhost:7860/(\\w+/)*file=(.*\\/)?${basename}$`);

test("Gallery preview mode displays all images correctly.", async ({
	page
}) => {
	await page.getByRole("button", { name: "Run" }).click();
	await page.getByLabel("Thumbnail 2 of 3").click();

	expect(await page.getByTestId("detailed-image").getAttribute("src")).toMatch(
		regexLocalHostFileURL("lite-logo.png")
	);

	expect(await page.getByTestId("thumbnail 1").getAttribute("src")).toMatch(
		regexLocalHostFileURL("cheetah-003.jpg")
	);
});

test("Gallery select event returns the right value", async ({ page }) => {
	await page.getByRole("button", { name: "Run" }).click();
	await page.getByLabel("Thumbnail 2 of 3").click();
	await expect(page.getByLabel("Select Data")).toHaveValue(
		regexLocalHostFileURL("lite-logo.png")
	);
});
