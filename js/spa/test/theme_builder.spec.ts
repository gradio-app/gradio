import { test, expect } from "@self/tootils";

test("test theme builder changes are applied", async ({ page }) => {
	test.setTimeout(60_000);
	await page.getByLabel("Theme", { exact: true }).click();
	await page.getByLabel("Soft", { exact: true }).click();
	await page.getByRole("button", { name: "Load Theme" }).click();

	const go_btn = page.getByRole("button", { name: "Go", exact: true });

	// Loading a theme runs through the Gradio queue, ships updated CSS vars
	// from the server, and waits for the browser to apply them — the chain
	// can take >10s on a slow CI runner. Wait on the resolved font-family
	// (cascade-applied to a deeply-nested button) since that only flips once
	// the whole pipeline has settled. Must complete before the primary-hue
	// click below or the two event chains race.
	await expect(go_btn).toHaveCSS(
		"font-family",
		"Montserrat, ui-sans-serif, system-ui, sans-serif",
		{ timeout: 30_000 }
	);

	await page.getByRole("tab", { name: "Core Colors" }).click();
	await page.getByLabel("Primary Hue").click();
	await page.getByLabel("emerald").click();

	await expect(go_btn).toHaveCSS("background-color", "rgb(16, 185, 129)", {
		timeout: 30_000
	});

	await page.getByRole("button", { name: "View Code ▼" }).click();
	const code = page.getByLabel("Code input container");
	await expect(code).toContainText("gr.themes.Soft");
	await expect(code).toContainText('primary_hue="emerald"');
});
