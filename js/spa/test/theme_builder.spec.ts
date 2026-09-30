import { test, expect } from "@self/tootils";

test("test theme builder changes are applied", async ({ page }) => {
	test.setTimeout(90_000);

	const go_btn = page.getByRole("button", { name: "Go", exact: true });
	await page.getByRole("button", { name: "View Code ▼" }).click();
	const code = page.getByLabel("Code input container");

	// The demo automatically loads the Base theme on startup. Wait for that
	// event chain to finish before clicking Load Theme again; clicks while the
	// initial event is running are ignored by the event listener.
	await expect(code).toContainText("gr.themes.Base", { timeout: 30_000 });

	await page.getByLabel("Theme", { exact: true }).click();
	await page.getByLabel("Soft", { exact: true }).click();
	await page.getByRole("button", { name: "Load Theme" }).click();

	// Generated code is updated by the final step in the event chain, making it
	// a stable signal that the selected theme has reached the browser.
	await expect(code).toContainText("gr.themes.Soft", { timeout: 30_000 });
	await expect(go_btn).toHaveCSS(
		"font-family",
		"Montserrat, ui-sans-serif, system-ui, sans-serif",
		{ timeout: 30_000 }
	);

	await page.getByRole("tab", { name: "Core Colors" }).click();
	await page.getByLabel("Primary Hue").click();
	await page.getByLabel("emerald").click();

	await expect(code).toContainText('primary_hue="emerald"', {
		timeout: 30_000
	});
	await expect(go_btn).toHaveCSS("background-color", "rgb(16, 185, 129)", {
		timeout: 30_000
	});
});
