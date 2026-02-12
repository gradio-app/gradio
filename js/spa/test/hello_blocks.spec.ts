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
