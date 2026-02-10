import { test, expect } from "@self/tootils";

test("toggling the checkbox opens the accordion and shows the textbox", async ({
	page
}) => {
	await expect(page.getByLabel("Name")).not.toBeVisible();

	await page.getByLabel("Accordion Open").check();
	await expect(page.getByLabel("Name")).toBeVisible();

	await page.getByLabel("Accordion Open").uncheck();
	await expect(page.getByLabel("Name")).not.toBeVisible();
});

test("clicking the switch tabs button shows Tab 2 content", async ({
	page
}) => {
	await expect(page.getByText("This is Tab 2 content.")).not.toBeVisible();

	await page.getByRole("button", { name: "Switch to Tab 2" }).click();
	await expect(page.getByText("This is Tab 2 content.")).toBeVisible();
});
