import { test, expect } from "@gradio/tootils";

test("Success event", async ({ page }) => {
	const value = page.getByLabel("Result");
	expect(value.inputValue()).toEqual("");

	await Promise.all([
		page.click("text=Trigger Failure"),
		page.waitForResponse("**/run/predict")
	]);
	expect(value.inputValue()).toEqual("");

	await Promise.all([
		page.click("text=Trigger Success"),
		page.waitForResponse("**/run/predict")
	]);

	expect(value.inputValue()).toEqual("Success event triggered");
});
