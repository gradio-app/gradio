import { test, expect } from "@gradio/tootils";
import { chromium } from "playwright";
// we cannot currently test the waveform canvas with playwright (https://github.com/microsoft/playwright/issues/23964)
// so this test covers the interactive elements around the waveform canvas

test("audio waveform", async ({ page }) => {
	await expect(page.getByRole("tab", { name: "Audio" })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await page.getByRole("tab", { name: "Interface" }).click();
	await page.getByRole("tab", { name: "Interface" }).click();
	await page.getByRole("button", { name: "cantina.wav" }).click();

	await page
		.getByTestId("waveform-x")
		.getByLabel("Adjust playback speed to 1.5x")
		.click();
	await page.getByLabel("Adjust playback speed to 2x").click();

	await page
		.getByTestId("waveform-x")
		.getByLabel("Skip forward by 0.15 seconds")
		.click();
	await page
		.getByTestId("waveform-x")
		.getByLabel("Skip backwards by 0.15 seconds")
		.click();
	await page.getByLabel("Trim audio to selection").click();
	await page.getByRole("button", { name: "Trim" }).click();
	await page.getByLabel("Reset audio").click();
	await page.getByRole("button", { name: "Submit" }).click();
	await page
		.getByTestId("waveform-output")
		.getByLabel("Adjust playback speed to 1.5x")
		.click();
	await page
		.getByTestId("waveform-output")
		.getByLabel("Skip backwards by 0.15 seconds")
		.click();
	await page
		.getByTestId("waveform-output")
		.getByLabel("Skip forward by 0.15 seconds")
		.click();
});

test("audio streaming tab", async ({ page }) => {
	const browser = await chromium.launch({
		args: ["--use-fake-ui-for-media-stream"]
	});

	const context = await browser.newContext({
		permissions: ["microphone"]
	});

	context.grantPermissions(["microphone"]);

	await page.getByRole("tab", { name: "Streaming" }).click();

	await expect(page.getByLabel("Select input device")).toContainText(
		"Fake Default Audio InputFake Audio Input 1Fake Audio Input 2"
	);
});

test("recording audio", async ({ page }) => {
	const browser = await chromium.launch({
		args: ["--use-fake-ui-for-media-stream"]
	});

	const context = await browser.newContext({
		permissions: ["microphone"]
	});

	await page.getByText("Interface").click();
	await page.getByLabel("Record audio").click();

	context.grantPermissions(["microphone"]);

	await expect(page.getByRole("combobox")).toContainText(
		"Fake Default Audio InputFake Audio Input 1Fake Audio Input 2"
	);

	await page.getByRole("button", { name: "Record", exact: true }).click();

	await page.waitForTimeout(1000);

	await expect(page.getByText("0:01", { exact: true })).toBeAttached();

	await page.getByText("Stop", { exact: true }).nth(0).click();
});
