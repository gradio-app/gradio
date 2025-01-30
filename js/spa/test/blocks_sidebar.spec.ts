import { test, expect } from "@self/tootils";

test("shows open sidebar and components in sidebar work", async ({ page }) => {
	await expect(page.getByRole('heading', { name: '🐾 Pet Name Generator' })).toBeVisible();
	await expect(page.getByLabel('Choose your pet type')).toBeVisible();
	await expect(page.getByText("Personality type")).toBeVisible();

	await page.getByLabel('Choose your pet type').click();
	await page.getByText("Dog").click();
	await page.getByText("Silly").click();
	await page.getByRole("button", { name: "Generate Name! 🎲" }).click();

	const nameOutput = page.getByText("Your pet's fancy name:");
	await expect(nameOutput).toBeVisible();
	await expect(nameOutput).not.toBeEmpty();

	await page.getByLabel('Toggle Sidebar').click();

	await expect(page.getByRole('heading', { name: '🐾 Pet Name Generator' })).not.toBeInViewport();
	await expect(page.getByText("Choose your pet type")).not.toBeInViewport();
	await expect(page.getByText("Personality type")).not.toBeInViewport();
});
