import { test, expect } from "@self/tootils";

test("DataFrame updates and events are tracked correctly", async ({ page }) => {
	await expect(page.getByLabel("Change events")).toHaveValue("0");
	await expect(page.getByLabel("Input events")).toHaveValue("0");
	await expect(page.getByLabel("Sum of values")).toHaveValue("0");

	await page.getByRole("button", { name: "Update DataFrame" }).click();
	await page.getByTestId("cell-0-0").getByRole("button", { name: "2" }).click();

	await expect(page.getByLabel("Change events")).toHaveValue("2");
	await expect(page.getByLabel("Input events")).toHaveValue("0");
	await expect(page.getByLabel("Sum of values")).toHaveValue("50");
});
