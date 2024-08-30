import { test, expect } from "@self/tootils";

test("Test Country Filter", async ({ page }) => {
	const countries_list = page.getByTestId("json");
	await expect(countries_list).toContainText("Algeria");
	await expect(countries_list).not.toContainText("Argentina");
	await page.getByLabel("range slider for Country Count").fill("3");
	await expect(countries_list).toContainText("Algeria");
	await expect(countries_list).toContainText("Argentina");
	await page.getByLabel("Alphabetical Order").uncheck();
	await expect(countries_list).not.toContainText("Algeria");
	await expect(countries_list).toContainText("Sudan");
});

test("Test Random Country List", async ({ page }) => {
	const random_country_box = page.getByLabel("Random Country");
	const random_countries_box = page.getByLabel("Random Countries");
	await expect(random_country_box).not.toBeEmpty();
	await expect(random_countries_box).not.toBeEmpty();
	const first_country_value = await random_country_box.inputValue();
	const first_countries_value = await random_countries_box.inputValue();
	await expect(random_country_box).not.toHaveValue(
		first_country_value as string
	);
	await expect(random_countries_box).not.toHaveValue(
		first_countries_value as string
	);
	await page.getByRole("button", { name: "Stop" }).click();
	await page.waitForTimeout(2000);
	const current_country_value = await random_country_box.inputValue();
	const current_countries_value = await random_countries_box.inputValue();
	await expect(random_country_box).toHaveValue(current_country_value as string);
	await expect(random_countries_box).toHaveValue(
		current_countries_value as string
	);
	await page.getByRole("button", { name: "Start" }).click();
	await expect(random_country_box).not.toHaveValue(
		current_country_value as string
	);
	await expect(random_countries_box).not.toHaveValue(
		current_countries_value as string
	);
});
