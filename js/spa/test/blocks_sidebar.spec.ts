import { test, expect } from "@self/tootils";

test("shows open sidebar and components in sidebar work", async ({ page }) => {
	await expect(page.getByText("🐾 Pet Name Generator")).toBeVisible();
	await expect(page.getByLabel("Choose your pet type")).toBeVisible();
	await expect(page.getByLabel("Personality type")).toBeVisible();

	await page.getByLabel("Choose your pet type").click();
	await page.getByText("Dog").click();
	await page.getByText("Silly").click();
	await page.getByRole("button", { name: "Generate Name! 🎲" }).click();

	const nameOutput = page.getByLabel("Your pet's fancy name:");
	await expect(nameOutput).toBeVisible();
	await expect(nameOutput).not.toBeEmpty();

	await page.getByRole("button", { name: "Collapse Sidebar" }).click();

	await expect(page.getByText("🐾 Pet Name Generator")).not.toBeVisible();
	await expect(page.getByLabel("Choose your pet type")).not.toBeVisible();
	await expect(page.getByLabel("Personality type")).not.toBeVisible();
});
