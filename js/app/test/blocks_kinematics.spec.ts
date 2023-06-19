import { test } from "@gradio/tootils";

test("renders the correct elements", async ({ page }) => {
	await Promise.all([
		page.click("button:has-text('Run')"),
		page.waitForResponse("**/run/predict")
	]);
});
