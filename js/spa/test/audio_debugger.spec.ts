import { test, expect } from "@self/tootils";
import { chromium } from "playwright";
// we cannot currently test the waveform canvas with playwright (https://github.com/microsoft/playwright/issues/23964)
// so this test covers the interactive elements around the waveform canvas

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

	await page.getByRole("tab", { name: "Interface" }).click();
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
