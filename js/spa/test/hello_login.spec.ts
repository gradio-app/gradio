import { test, expect } from "@self/tootils";

const LOGIN_TITLE = "Login";
const USERNAME_LABEL = "username";
const PASSWORD_LABEL = "password";
const INCORRECT_CREDENTIALS = "Incorrect Credentials";

test("shows login page when auth is required", async ({ page }) => {
	// The login page should be shown initially
	await expect(page.getByRole("heading", { name: LOGIN_TITLE })).toBeVisible();
	await expect(page.getByLabel(USERNAME_LABEL)).toBeVisible();
	await expect(page.getByLabel(PASSWORD_LABEL)).toBeVisible();
	await expect(page.getByRole("button", { name: LOGIN_TITLE })).toBeVisible();
});

test("shows error message with incorrect credentials", async ({ page }) => {
	// Fill in wrong credentials
	await page.getByLabel(USERNAME_LABEL).fill("wrong_user");
	await page.getByLabel(PASSWORD_LABEL).fill("wrong_pass");
	await page.getByRole("button", { name: LOGIN_TITLE }).click();

	// Should show incorrect credentials message
	await expect(page.getByText(INCORRECT_CREDENTIALS)).toBeVisible();

	// Should still be on login page
	await expect(page.getByRole("heading", { name: LOGIN_TITLE })).toBeVisible();
});

test("successful login shows the app", async ({ page }) => {
	// Fill in correct credentials (admin/admin as defined in the demo)
	await page.getByLabel(USERNAME_LABEL).fill("admin");
	await page.getByLabel(PASSWORD_LABEL).fill("admin");
	await page.getByRole("button", { name: LOGIN_TITLE }).click();

	// Wait for page to reload and show the app
	await expect(
		page.getByRole("heading", { name: "Greetings User!" })
	).toBeVisible({ timeout: 10000 });

	// Login form should no longer be visible
	await expect(
		page.getByRole("heading", { name: LOGIN_TITLE })
	).not.toBeVisible();
});

test("app functionality works after login", async ({ page }) => {
	// Login first
	await page.getByLabel(USERNAME_LABEL).fill("admin");
	await page.getByLabel(PASSWORD_LABEL).fill("admin");
	await page.getByRole("button", { name: LOGIN_TITLE }).click();

	// Wait for app to load
	await expect(
		page.getByRole("heading", { name: "Greetings User!" })
	).toBeVisible({ timeout: 10000 });

	// Test the app functionality - input should copy to output
	const inputTextbox = page.getByLabel("Textbox").first();
	const outputTextbox = page.getByLabel("Textbox").last();

	await inputTextbox.fill("Hello World");

	// The change event should copy the value to output
	await expect(outputTextbox).toHaveValue("Hello World");
});
