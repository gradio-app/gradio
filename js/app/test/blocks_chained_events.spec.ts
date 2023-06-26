import { test, expect } from "@gradio/tootils";

test("Success event", async ({ page }) => {
	const textbox = page.getByLabel("Result");
	await expect(textbox).toHaveValue("");

	await Promise.all([
		page.click("text=Trigger Failure"),
		page.waitForResponse("**/run/predict")
	]);
	// Since the event is not triggered, the value should not change
	expect(textbox).toHaveValue("");

	await Promise.all([
		page.click("text=Trigger Success"),
		page.waitForResponse("**/run/predict")
	]);

	expect(textbox).toHaveValue("Success event triggered");
});
