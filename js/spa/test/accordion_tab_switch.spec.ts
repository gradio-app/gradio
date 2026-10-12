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

test("revealing a hidden accordion with open=True shows its content", async ({
	page
}) => {
	await expect(page.getByLabel("Details")).not.toBeVisible();

	await page.getByRole("button", { name: "Reveal Accordion" }).click();
	await expect(page.getByLabel("Details")).toBeVisible();

	await page.getByRole("button", { name: "Hidden Accordion" }).click();
	await expect(page.getByLabel("Details")).not.toBeVisible();
});

test("revealing a hidden accordion with open=True fires expand", async ({
	page
}) => {
	await expect(page.getByLabel("Expand Count")).toHaveValue("0");

	await page.getByRole("button", { name: "Reveal Accordion" }).click();
	await expect(page.getByLabel("Expand Count")).toHaveValue("1");
});

test("revealing hidden tabs with a selected tab shows that tab's content", async ({
	page
}) => {
	await expect(page.getByText("This is Tab B content.")).not.toBeVisible();

	await page.getByRole("button", { name: "Reveal Tabs" }).click();
	await expect(page.getByText("This is Tab B content.")).toBeVisible();
	await expect(page.getByText("This is Tab A content.")).not.toBeVisible();
});

test("a component hidden inside a closed accordion stays hidden when it opens", async ({
	page
}) => {
	await page.getByRole("button", { name: "Hide Extra" }).click();
	await page.getByRole("button", { name: "Advanced" }).click();
	await expect(page.getByLabel("Extra")).not.toBeVisible();
});

test("a backend open/close update applies after a header click", async ({
	page
}) => {
	const header = page.getByRole("button", { name: "Synced Accordion" });
	const child = page.getByLabel("Synced Child");

	await header.click();
	await expect(child).toBeVisible();
	await page.getByRole("button", { name: "Close (backend)" }).click();
	await expect(child).not.toBeVisible();

	await page.getByRole("button", { name: "Open (backend)" }).click();
	await expect(child).toBeVisible();
	await header.click();
	await expect(child).not.toBeVisible();
	await page.getByRole("button", { name: "Open (backend)" }).click();
	await expect(child).toBeVisible();
});

test("an accordion opened while visible='hidden' shows its content once revealed", async ({
	page
}) => {
	await page.getByRole("button", { name: "Stage (visible=hidden)" }).click();
	await page.getByRole("button", { name: "Show Staged" }).click();
	await expect(page.getByLabel("Staged Child")).toBeVisible();
});

test("revealing a hidden open accordion with open=False fires collapse", async ({
	page
}) => {
	await page.getByRole("button", { name: "Reveal Closed" }).click();
	await expect(page.getByLabel("Collapse Log")).toHaveValue("collapsed");
	await expect(page.getByLabel("Hidden Open Child")).not.toBeVisible();
});

test("opening an accordion does not fire change on the components inside it", async ({
	page
}) => {
	const header = page.getByRole("button", { name: "JSON Accordion" });
	await header.click();
	await header.click();
	await header.click();
	await page.waitForTimeout(1000);
	await expect(page.getByLabel("JSON Change Log")).toHaveValue("");
});

test("a collapse fired by a gr.render re-run reaches the new render's listener", async ({
	page
}) => {
	await page.getByRole("button", { name: "Rendered Accordion" }).click();
	await expect(page.getByLabel("Rendered Child")).toBeVisible();

	await page.getByRole("button", { name: "Re-render" }).click();
	await expect(page.getByLabel("Rerender Log")).toHaveValue(/collapse/);
	await expect(page.getByLabel("Rendered Child")).not.toBeVisible();
});
