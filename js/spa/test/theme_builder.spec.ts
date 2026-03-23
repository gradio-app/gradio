import { test, expect } from "@self/tootils";

test("test theme builder changes are applied", async ({ page }) => {
	await page.getByLabel("Theme", { exact: true }).click();
	await page.getByLabel("Soft", { exact: true }).click();
	await page.getByRole("button", { name: "Load Theme" }).click();

	const go_btn = page.getByRole("button", { name: "Go", exact: true });

	// Wait for Soft theme to be fully applied before changing the primary hue,
	// otherwise the Load Theme and emerald select event chains can race.
	await expect(go_btn).toHaveCSS(
		"font-family",
		"Montserrat, ui-sans-serif, system-ui, sans-serif"
	);

	await page.getByRole("tab", { name: "Core Colors" }).click();
	await page.getByLabel("Primary Hue").click();
	await page.getByLabel("emerald").click();

	await expect(go_btn).toHaveCSS("background-color", "rgb(16, 185, 129)");

	await page.getByRole("button", { name: "View Code ▼" }).click();
	const code = page.getByLabel("Code input container");
	await expect(code).toContainText("gr.themes.Soft");
	await expect(code).toContainText('primary_hue="emerald"');
});
