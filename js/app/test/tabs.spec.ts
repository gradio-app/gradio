import { test, expect } from "@gradio/tootils";

test("clicking through tabs shows correct content", async ({ page }) => {
	await page.getByRole("tab", { name: "Tab 2" }).click();
	await expect(page.getByText("Text 1!")).toBeHidden();
	await expect(page.getByText("Text 2!")).toBeVisible();

	await page.getByRole("tab", { name: "Tab 4" }).click();
	await expect(page.getByText("Text 2!")).toBeHidden();
	await expect(page.getByText("Text 4!")).toBeVisible();

	await page.getByRole("tab", { name: "Set 2" }).click();
	await page.getByRole("tab", { name: "Tab 12" }).click();
	await expect(page.getByText("Text 2!")).toBeHidden();
	await expect(page.getByText("Text 12!")).toBeVisible();
});

test("correct selected tab shown", async ({ page }) => {
	await page.getByRole("tab", { name: "Tab 2" }).click();
	await expect(page.getByLabel("Selected Tab")).toHaveValue("Tab 2");

	await page.getByRole("tab", { name: "Tab 5" }).click();
	await expect(page.getByLabel("Selected Tab")).toHaveValue("Tab 5");

	await page
		.getByRole("button", { name: "Make Even Tabs Uninteractive" })
		.click();
	await page.waitForTimeout(1000);

	await expect(page.getByRole("tab", { name: "Tab 2" })).toBeDisabled();

	await page.getByRole("button", { name: "Make All Tabs Interactive" }).click();
	await page.waitForTimeout(1000);

	await page.getByRole("tab", { name: "Tab 2" }).click();
	await expect(page.getByLabel("Selected Tab")).toHaveValue("Tab 2");

	await page.getByRole("button", { name: "Hide Odd Tabs" }).click();
	await page.waitForTimeout(1000);

	await page.getByRole("tab", { name: "Tab 4" }).click();
	await page.getByRole("button", { name: "Show All Tabs" }).click();
	await page.waitForTimeout(1000);

	await page.getByRole("tab", { name: "Tab 9" }).click();
	await expect(page.getByLabel("Selected Tab")).toHaveValue("Tab 9");
});

test("output from one tab to another works", async ({ page }) => {
	await page.getByRole("tab", { name: "Tab 4" }).click();
	await page.getByLabel("Input 4").fill("hi");
	await page.getByLabel("Input 4").press("Enter");

	await page.getByRole("tab", { name: "Set 2" }).click();
	await page.getByRole("tab", { name: "Tab 13" }).click();
	await expect(page.getByLabel("Input 13")).toHaveValue("");
	await expect(page.getByLabel("Input 13")).toBeVisible();
	await expect(page.getByLabel("Input 14")).toBeHidden();

	await page.getByRole("tab", { name: "Tab 14" }).click();
	await expect(page.getByLabel("Input 14")).toBeVisible();
	await expect(page.getByLabel("Input 14")).toHaveValue("hi");
});

test("programmatic selection works", async ({ page }) => {
	await expect(page.getByText("Text 1!")).toBeHidden();
	await expect(page.getByText("Text 3!")).toBeVisible();

	await page.getByLabel("Select Tab #").click();
	await page.getByLabel("Select Tab #").fill("6");
	await page.getByLabel("Select Tab #").press("Enter");

	await expect(page.getByText("Text 3!")).toBeHidden();
	await expect(page.getByText("Text 6!")).toBeVisible();
});
