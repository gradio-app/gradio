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
	test("loading a saved run restores its inputs and outputs", async ({
		page
	}) => {
		await page.getByLabel("Name").fill("run history");
		await page.getByRole("button", { name: "Greet" }).click();
		await expect(page.getByLabel("Output Box")).toHaveValue(
			"Hello run history!"
		);

		await page.goto(new URL("/", page.url()).href);
		await expect(page.getByLabel("Name")).toHaveValue("");
		await expect(page.getByLabel("Output Box")).toHaveValue("");

		await page.goto(new URL("/gradio_api/runs", page.url()).href);
		await page.getByRole("button", { name: "Load run" }).click();

		await expect(page.getByLabel("Name")).toHaveValue("run history");
		await expect(page.getByLabel("Output Box")).toHaveValue(
			"Hello run history!"
		);
	});
});
