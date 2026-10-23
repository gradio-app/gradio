import { test, expect } from "@self/tootils";

test("refreshing the page keeps its outputs and state", async ({ page }) => {
	const total = page.getByLabel("Total");
	await expect(total).toHaveValue("Welcome");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByRole("button", { name: "Add" }).click();
	await expect(total).toHaveValue("Count: 2");

	await page.reload();

	// The load event does not run again, so neither is reset.
	await expect(total).toHaveValue("Count: 2");
	await page.getByRole("button", { name: "Add" }).click();
	await expect(total).toHaveValue("Count: 3");
});

test("refreshing the page while an event runs keeps it running", async ({
	page
}) => {
	const total = page.getByLabel("Total");
	const progress = page.getByLabel("Progress");
	await expect(total).toHaveValue("Welcome");
	await page.getByRole("button", { name: "Add" }).click();
	await expect(total).toHaveValue("Count: 1");
	await page.getByRole("button", { name: "Run" }).click();
	await expect(progress).toHaveValue(/Step 2 of 5/);

	await page.reload();

	await expect(total).toHaveValue("Count: 1");
	await expect(progress).toHaveValue("Step 5 of 5 (count 1)");
	// The event chained to it with `.then()` runs too, and reads and writes
	// the state the browser restored.
	await expect(total).toHaveValue("Finished: 101");
	await page.getByRole("button", { name: "Add" }).click();
	await expect(total).toHaveValue("Count: 102");
});

test("a new tab starts a new session", async ({ page, context }) => {
	await expect(page.getByLabel("Total")).toHaveValue("Welcome");
	await page.getByRole("button", { name: "Add" }).click();
	await expect(page.getByLabel("Total")).toHaveValue("Count: 1");

	const new_tab = await context.newPage();
	await new_tab.goto(page.url());

	await expect(new_tab.getByLabel("Total")).toHaveValue("Welcome");
});
