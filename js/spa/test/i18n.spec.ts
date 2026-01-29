import { test, expect } from "@self/tootils";

test("i18n labels render correctly", async ({ page }) => {
	await expect(page.getByLabel("Your Name")).toBeVisible();
	await expect(page.getByRole("button", { name: "Greet" })).toBeVisible();
	await expect(page.getByLabel("Result")).toBeVisible();
});

test("i18n markers translate when props update via event", async ({ page }) => {
	const nameInput = page.getByLabel("Your Name");

	await nameInput.fill("");
	await expect(nameInput).toHaveValue("");

	await page.getByRole("button", { name: "Reset Name" }).click();

	await expect(nameInput).not.toHaveValue(/__i18n__/);
	await expect(nameInput).toHaveValue("John English");
});

test("changing language via settings updates UI", async ({ page }) => {
	await expect(page.getByLabel("Your Name")).toBeVisible();

	await page.locator("footer").getByText("Settings").click();
	await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();

	const languageInput = page.locator('input[aria-label="Language"]');
	await expect(languageInput).toBeVisible();

	await languageInput.click();
	await languageInput.clear();
	await languageInput.pressSequentially("Esp");

	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("Enter");

	await page.locator(".backdrop").click();

	await expect(page.getByLabel("Tu Nombre")).toBeVisible();
});

test.describe("i18n with Spanish locale", () => {
	test.use({ locale: "es" });

	test("labels render in Spanish", async ({ page }) => {
		await expect(page.getByLabel("Tu Nombre")).toBeVisible();
		await expect(page.getByRole("button", { name: "Saludar" })).toBeVisible();
		await expect(page.getByLabel("Resultado")).toBeVisible();
	});

	test("props update with Spanish translations", async ({ page }) => {
		const nameInput = page.getByLabel("Tu Nombre");
		await nameInput.fill("");
		await page.getByRole("button", { name: "Reset Name" }).click();
		await expect(nameInput).toHaveValue("John Spanish");
	});
});
