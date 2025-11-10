import { test, expect } from "@self/tootils";

test("component props", async ({ page }) => {
	const numberInput = page.getByLabel("Input A");
	const outputJson = page.locator("#output")
	const showValueBtn = page.getByRole("button", { name: "Show Value" });
	const doubleBtn = page.getByRole("button", {
		name: "Double Value and Maximum"
	});
	const resetBtn = page.getByRole("button", { name: "Reset" });

	await expect(numberInput).toHaveValue("5");

	await showValueBtn.click();
	await expect(outputJson).toContainText('"value": 5');
	await expect(outputJson).toContainText('"maximum": 10');
	await expect(outputJson).toContainText('"minimum": 0');

	await doubleBtn.click();

	await expect(numberInput).toHaveValue("10");
	await expect(outputJson).toContainText('"value": 10');
	await expect(outputJson).toContainText('"maximum": 20');
	await expect(outputJson).toContainText('"minimum": 0');

	await doubleBtn.click();
	await expect(numberInput).toHaveValue("20");
	await expect(outputJson).toContainText('"value": 20');
	await expect(outputJson).toContainText('"maximum": 40');

	await resetBtn.click();
	await expect(outputJson).toContainText('"value": 5');
	await expect(outputJson).toContainText('"maximum": 10');
	await expect(outputJson).toContainText('"minimum": 0');

	await numberInput.fill("7");
	await showValueBtn.click();

	await expect(outputJson).toContainText('"value": 7');
	await expect(outputJson).toContainText('"maximum": 10');
	await expect(outputJson).toContainText('"minimum": 0');
});
