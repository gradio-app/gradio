import { test, expect } from "@self/tootils";

test(".success should not run if function fails", async ({ page }) => {
	const textbox = page.getByLabel("Result");
	await expect(textbox).toHaveValue("");

	await page.click("text=Trigger Failure");
	expect(textbox).toHaveValue("");
});

test(".success event runs after function successfully completes", async ({
	page
}) => {
	const textbox = page.getByLabel("Result");
	await page.click("text=Trigger Success");
	await expect(textbox).toHaveValue("Success event triggered");
});

test("Consecutive .success event is triggered successfully", async ({
	page
}) => {
	const textbox = page.getByLabel("Consecutive Event");
	const first = page.getByLabel("Result");

	await page.click("text=Trigger Consecutive Success");
	await expect(textbox).toHaveValue("Consecutive Event Triggered");
	expect(first).toHaveValue("First Event Trigered");
});

test("gr.Error makes the toast show up", async ({ page }) => {
	await page.click("text=Trigger Failure");

	const toast = page.getByTestId("toast-body");
	expect(toast).toContainText("Error");
	const close = page.getByTestId("toast-close");
	await close.click();
	await expect(page.getByTestId("toast-body")).toHaveCount(0);
});

test("ValueError makes the toast show up when show_error=True", async ({
	page
}) => {
	await page.click("text=Trigger Failure With ValueError");

	const toast = page.getByTestId("toast-body");
	expect(toast).toContainText("Error");
	const close = page.getByTestId("toast-close");
	await close.click();
	await expect(page.getByTestId("toast-body")).toHaveCount(0);
});

test("gr.Info makes the toast show up", async ({ page }) => {
	await page.click("text=Trigger Info");
	const toast = await page.getByTestId("toast-body");

	expect(toast).toContainText("This is some info");
	const close = await page.getByTestId("toast-close");
	await close.click();
	await expect(page.getByTestId("toast-body")).toHaveCount(0);
});

test("gr.Warning makes the toast show up", async ({ page }) => {
	await page.click("text=Trigger Warning");

	const toast = page.getByTestId("toast-body");
	expect(toast).toContainText("This is a warning!");
	const close = page.getByTestId("toast-close");
	await close.click();
	await expect(page.getByTestId("toast-body")).toHaveCount(0);
});
