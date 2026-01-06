import { test, expect } from "@self/tootils";

test("login with valid credentials shows greeting", async ({ page }) => {
	await page.context().clearCookies();
	await page.reload();

	await page.getByLabel("username").fill("admin");
	await page.getByLabel("password").fill("admin");
	await page.getByRole("button", { name: "Login" }).click();

	await expect(page.getByText("Greetings")).toBeVisible();
});
