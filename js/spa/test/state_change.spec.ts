import { test, expect } from "@self/tootils";

test("test 2d state-based render", async ({ page }) => {
	await page.getByRole("button", { name: "Increment A" }).click();
	await expect(
		page.locator("button").filter({ hasText: "Button" })
	).toHaveCount(0);

	await expect(page.getByLabel("Number A")).toHaveValue("1");
	await page.getByRole("button", { name: "Increment B" }).click();
	await page.getByRole("button", { name: "Increment A" }).click();
	await expect(page.getByLabel("Number B")).toHaveValue("1");
	await expect(
		page.locator("button").filter({ hasText: "Button" })
	).toHaveCount(2);
	await page.getByRole("button", { name: "Increment A" }).click();
	await expect(page.getByLabel("Number A")).toHaveValue("2");

	await page.getByRole("button", { name: "Increment B" }).click();
	await expect(page.getByLabel("Number B")).toHaveValue("2");

	await page.getByRole("button", { name: "Increment A" }).click();
	await expect(page.getByLabel("Number A").first()).toHaveValue("4");
	await expect(
		page.locator("button").filter({ hasText: "Button" })
	).toHaveCount(8);
});

test("test datastructure-based state changes", async ({ page }) => {
	await page.getByRole("button", { name: "Count to" }).click();
	await expect(page.getByLabel("Output")).toHaveValue(
		`{1: 1, 2: 2, 3: 3}\n[[1, 2, 3], [1, 2, 3], [1, 2, 3]]\n{1, 2, 3}`
	);
	await expect(page.getByLabel("Changes").first()).toHaveValue("1");
	await expect(page.getByLabel("Clicks").first()).toHaveValue("1");

	await page.getByRole("button", { name: "Count to" }).click();
	await expect(page.getByLabel("Changes").first()).toHaveValue("1");
	await expect(page.getByLabel("Clicks").first()).toHaveValue("2");

	await page.getByRole("button", { name: "Count to" }).click();
	await expect(page.getByLabel("Changes").first()).toHaveValue("1");
	await expect(page.getByLabel("Clicks").first()).toHaveValue("3");
	await expect(page.getByLabel("Output")).toHaveValue(
		`{1: 1, 2: 2, 3: 3}\n[[1, 2, 3], [1, 2, 3], [1, 2, 3]]\n{1, 2, 3}`
	);

	await page.getByRole("button", { name: "Zero All" }).click();
	await expect(page.getByLabel("Output")).toHaveValue(
		`{0: 0}\n[[0, 0, 0], [0, 0, 0], [0, 0, 0]]\n{0}`
	);
	await expect(page.getByLabel("Changes").first()).toHaveValue("2");
	await expect(page.getByLabel("Clicks").first()).toHaveValue("4");

	await page.getByRole("button", { name: "Zero All" }).click();
	await expect(page.getByLabel("Changes").first()).toHaveValue("2");
	await expect(page.getByLabel("Clicks").first()).toHaveValue("5");
});

test("test generators properly trigger state changes", async ({ page }) => {
	await page.getByRole("button", { name: "Iterator State Change" }).click();
	await expect(page.getByTestId("markdown").first()).toHaveText(
		"Success Box 0 added"
	);
	await page.getByRole("button", { name: "Iterator State Change" }).click();
	await expect(page.getByTestId("markdown").nth(1)).toHaveText(
		"Success Box 1 added"
	);
});

test("test state change for custom hashes", async ({ page }) => {
	await expect(page.getByLabel("Custom State Changes").first()).toHaveValue(
		"0"
	);
	await page.getByRole("button", { name: "Set State to 10" }).click();
	await expect(page.getByLabel("Custom State Clicks").first()).toHaveValue("1");
	await expect(page.getByLabel("Custom State Changes").first()).toHaveValue(
		"1"
	);
	await page.getByRole("button", { name: "Set State to 10" }).click();
	await expect(page.getByLabel("Custom State Clicks").first()).toHaveValue("2");
	await expect(page.getByLabel("Custom State Changes").first()).toHaveValue(
		"1"
	);
});

test("test state changes work within gr.render", async ({ page }) => {
	const textbox = await page.getByLabel("Start State");
	await textbox.fill("test");
	await expect(page.getByLabel("End State").first()).toHaveValue("test");
});
