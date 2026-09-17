import { test, expect } from "@self/tootils";

test("examples_get_updated_correctly", async ({ page }) => {
	await page.locator(".gallery-item").first().click();
	let image = await page.getByTestId("image").locator("img").first();
	await expect(await image.getAttribute("src")).toContain("cheetah1.jpg");
	await page.getByRole("button", { name: "Update Examples" }).click();

	let example_image;
	await expect(async () => {
		example_image = await page.locator(".gallery-item").locator("img").first();
		await expect(await example_image.getAttribute("src")).toContain("logo.png");
	}).toPass();

	await example_image.click();
	await expect(async () => {
		image = await page.getByTestId("image").locator("img").first();
		await expect(await image.getAttribute("src")).toContain("logo.png");
	}).toPass();
});

test.describe("run history", () => {
	test("loading an earlier run restores that run's media", async ({ page }) => {
		const input_image = page.getByTestId("image").locator("img");
		const output_image = page
			.locator(".block")
			.filter({ hasText: "output" })
			.locator("img");

		await page.locator(".gallery-item").first().click();
		await expect(input_image).toHaveAttribute("src", /cheetah1/);
		await page.getByRole("button", { name: "Submit" }).click();
		await expect(output_image).toBeVisible();
		const cheetah_output = (await output_image.getAttribute("src")) as string;

		await page.locator(".gallery-item").nth(1).click();
		await expect(input_image).toHaveAttribute("src", /lion/);
		await page.getByRole("button", { name: "Submit" }).click();
		await expect(output_image).not.toHaveAttribute("src", cheetah_output);

		await page.goto(new URL("/gradio_api/runs", page.url()).href);
		const runs = page.locator("article.run");
		await expect(runs).toHaveCount(2);
		await expect(runs.first().locator('img[src*="lion"]')).toBeVisible();
		await runs
			.filter({ has: page.locator('img[src*="cheetah1"]') })
			.getByRole("button", { name: "Load run" })
			.click();

		await expect(input_image).toHaveAttribute("src", /cheetah1/);
		await expect(output_image).toHaveAttribute("src", cheetah_output);
	});
});
