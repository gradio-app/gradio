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

test("Consecutive success event", async ({ page }) => {
	const textbox = page.getByLabel("Consecutive Event");

	await page.click("text=Trigger Consecutive Success");
	// need to wait for all the events to fire
	await page.waitForTimeout(1000);

	expect(textbox).toHaveValue("Consecutive Event Triggered");
});

test("gr.Error Triggers modal", async ({ page }) => {
	await Promise.all([
		page.click("text=Trigger Failure"),
		page.waitForResponse("**/run/predict")
	]);

	const toast = page.getByTestId("error-toast");
	expect(toast).toContainText("Something went wrong");
	const close = page.getByTestId("error-close");
	await close.click();
	// need to let the toast fade out
	await page.waitForTimeout(2000);
	expect(await page.getByTestId("error-toast").count()).toEqual(0);
});

test("ValueError Triggers modal", async ({ page }) => {
	// The demo has show_error=True so ValueError should show the modal
	await Promise.all([
		page.click("text=Trigger Failure With ValueError"),
		page.waitForResponse("**/run/predict")
	]);

	const toast = page.getByTestId("error-toast");

	expect(toast).toContainText("Something went wrong");
	const close = page.getByTestId("error-close");
	await close.click();
	await page.waitForTimeout(2000);
	expect(await page.getByTestId("error-toast").count()).toEqual(0);
});
