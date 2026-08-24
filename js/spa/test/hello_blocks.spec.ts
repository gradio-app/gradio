import { test, expect } from "@self/tootils";

test.describe("hello blocks", () => {
	test("the demo renders correctly", async ({ page }) => {
		await expect(page.getByLabel("Output Box")).toBeVisible();
	});
});

test.describe("i18n", () => {
	test.use({ locale: "pt-BR", timezoneId: "America/Sao_Paulo" });

	test("the demo renders correctly: i18n", async ({ page }) => {
		await expect(page.getByLabel("Output Box")).toBeVisible();
	});
});

test.describe("run history", () => {
	test("loading an earlier run restores that run, not the latest", async ({
		page
	}) => {
		await page.getByLabel("Name").fill("first");
		await page.getByRole("button", { name: "Greet" }).click();
		await expect(page.getByLabel("Output Box")).toHaveValue("Hello first!");

		await page.getByLabel("Name").fill("second");
		await page.getByRole("button", { name: "Greet" }).click();
		await expect(page.getByLabel("Output Box")).toHaveValue("Hello second!");

		await page.goto(new URL("/gradio_api/runs", page.url()).href);
		const runs = page.locator("article.run");
		await expect(runs).toHaveCount(2);
		await expect(runs.first()).toContainText("Hello second!");
		await runs
			.filter({ hasText: "Hello first!" })
			.getByRole("button", { name: "Load run" })
			.click();

		await expect(page.getByLabel("Name")).toHaveValue("first");
		await expect(page.getByLabel("Output Box")).toHaveValue("Hello first!");
	});
});
