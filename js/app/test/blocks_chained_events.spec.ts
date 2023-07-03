import { test, expect } from "@gradio/tootils";
import type { Response } from "@playwright/test";

test(".success event runs after function successfully completes. .success should not run if function fails", async ({
	page
}) => {
	const textbox = page.getByLabel("Result");
	await expect(textbox).toHaveValue("");

	await Promise.all([
		page.waitForResponse("**/run/predict"),
		page.click("text=Trigger Failure")
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

	async function predicate(url: Response) {
		const is_json =
			(await url.headerValue("content-type")) === "application/json";
		if (!is_json) return false;

		const data = await url.json();
		return data?.data?.[0] === "Consecutive Event Triggered";
	}

	await Promise.all([
		page.waitForResponse(predicate),
		page.click("text=Trigger Consecutive Success")
	]);

	await expect(textbox).toHaveValue("Consecutive Event Triggered");
	expect(first).toHaveValue("First Event Trigered");
});

test("gr.Error makes the toast show up", async ({ page }) => {
	await Promise.all([
		page.waitForResponse("**/run/predict"),
		page.click("text=Trigger Failure")
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
		page.waitForResponse("**/run/predict"),
		page.click("text=Trigger Failure With ValueError")
	]);

	const toast = page.getByTestId("error-toast");

	expect(toast).toContainText("Something went wrong");
	const close = page.getByTestId("error-close");
	await close.click();
	await expect(page.getByTestId("error-toast")).toHaveCount(0);
});
