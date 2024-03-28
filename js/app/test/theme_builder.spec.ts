import { test, expect } from "@gradio/tootils";

test("test theme builder changes are applied", async ({ page }) => {
	await page.getByLabel("Theme", { exact: true }).click();
	await page.getByLabel("Soft", { exact: true }).click();
	await page.getByRole("button", { name: "Load Theme" }).click();
	await page.getByRole("tab", { name: "Core Colors" }).click();
	await page.getByLabel("Primary Hue").click();
	await page.getByLabel("emerald").click();

	const go_btn = page.getByRole("button", { name: "Go", exact: true });
	await expect(go_btn).toHaveCSS(
		"font-family",
		'Montserrat, ui-sans-serif, "system-ui", sans-serif'
	);
	await expect(go_btn).toHaveCSS("background-color", "rgb(16, 185, 129)");

	await page.getByRole("button", { name: "View Code ▼" }).click();
	const code = page.getByLabel("Code input container");
	await expect(code).toContainText("gr.themes.Soft");
	await expect(code).toContainText('primary_hue="emerald"');
});
