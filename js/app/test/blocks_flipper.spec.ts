import { test, expect } from "@gradio/tootils";

test("accordion stays open when interacting with the slider", async ({
	page
}) => {
	await page.getByRole("button", { name: "Open for More! ▼" }).click();
	await page.getByLabel("range slider for Slide me").fill("0.5");
	await expect(page.getByText("Look at me...")).toBeVisible();
});
