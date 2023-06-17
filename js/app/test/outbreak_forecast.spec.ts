import { test, expect } from "@gradio/tootils";
import { BASE64_PLOT_IMG } from "./media_data";

test("matplotlib", async ({ page }) => {
	await page.getByLabel("Plot Type").click();
	await page.getByRole("button", { name: "Matplotlib" }).click();
	await page.getByLabel("Month").click();
	await page.getByRole("button", { name: "January" }).click();
	await page.getByLabel("Social Distancing?").check();

	await Promise.all([
		page.click("text=Submit"),
		page.waitForResponse("**/run/predict")
	]);

	const matplotlib_img = await page.locator("img").nth(0);
	const matplotlib_img_data = await matplotlib_img.getAttribute("src");
	await expect(matplotlib_img_data).toBeTruthy();
});

test("plotly", async ({ page }) => {
	await page.getByLabel("Plot Type").click();
	await page.getByRole("button", { name: "Plotly" }).click();
	await page.getByLabel("Month").click();
	await page.getByRole("button", { name: "January" }).click();
	await page.getByLabel("Social Distancing?").check();

	await Promise.all([
		page.click("text=Submit"),
		page.waitForResponse("**/run/predict")
	]);
	await expect(page.locator(".js-plotly-plot")).toHaveCount(1);
});
