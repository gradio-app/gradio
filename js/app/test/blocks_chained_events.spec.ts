import { test, expect } from "@gradio/tootils";

test(".success event runs after function successfully completes. .success should not run if function fails", async ({
	page
}) => {
	const textbox = page.getByLabel("Result");
	await expect(textbox).toHaveValue("");

	await Promise.all([
		page.click("text=Trigger Failure"),
		page.waitForResponse("**/run/predict")
	]);
	expect(textbox).toHaveValue("");

	await Promise.all([
		page.click("text=Trigger Success"),
		page.waitForResponse("**/run/predict")
	]);

	expect(textbox).toHaveValue("Success event triggered");
});

test("Consecutive .success event is triggered successfully", async ({
	page
}) => {
	const textbox = page.getByLabel("Consecutive Event");
	const first = page.getByLabel("Result");

	await page.click("text=Trigger Consecutive Success");
	let count = 0;
	await page.waitForResponse((url) => {
		if (url.url().endsWith("run/predict")) {
			count += 1;
			return count == 3;
		}
		return false;
	});
	expect(textbox).toHaveValue("Consecutive Event Triggered");
	expect(first).toHaveValue("First Event Trigered");
});

test("gr.Error makes the toast show up", async ({ page }) => {
	await Promise.all([
		page.click("text=Trigger Failure"),
		page.waitForResponse("**/run/predict")
	]);

	const toast = page.getByTestId("error-toast");
	expect(toast).toContainText("Something went wrong");
	const close = page.getByTestId("error-close");
	await close.click();
	await expect(page.getByTestId("error-toast")).toHaveCount(0);
});

test("ValueError makes the toast show up when show_error=True", async ({
	page
}) => {
	await Promise.all([
		page.click("text=Trigger Failure With ValueError"),
		page.waitForResponse("**/run/predict")
	]);

	const toast = page.getByTestId("error-toast");

	expect(toast).toContainText("Something went wrong");
	const close = page.getByTestId("error-close");
	await close.click();
	await expect(page.getByTestId("error-toast")).toHaveCount(0);
});
