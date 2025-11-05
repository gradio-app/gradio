import { test, expect } from "@self/tootils";

test("test HTML components", async ({ page }) => {
	await expect(page.locator("#simple")).toContainText("Hello, World!");

	await page.getByLabel("Name").fill("Sam");
	await expect(page.locator("#templated")).toContainText(
		"Hello, Sam! 3 letters"
	);

	await page.getByLabel("Person").fill("Carl");
	await page.getByText("Bold Text").click();
	await page.getByRole("button", { name: "Update HTML" }).click();
	await expect(page.locator("#css")).toContainText("Hello, Carl!");
	const html = await page.locator("#css").innerHTML();
	expect(html).toContain("<li>C</li>");
	expect(html).toContain("<li>a</li>");

	await page.locator("#A").click();
	await expect(page.getByLabel("Clicked")).toHaveValue("A");
	await page.locator("#B").click();
	await expect(page.getByLabel("Clicked")).toHaveValue("B");

	await page.locator("#text-input").fill("testing");
	await page.locator("button:has-text('submit')").click();
	await expect(page.locator("#form")).toContainText("letters");
	await page.locator("button:has-text('clear')").click();
	await expect(page.locator("#form")).toContainText("0 letters");

	await expect(page.locator("#fruits")).toContainText("Apple");
	await expect(page.locator("#vegetables")).toContainText("Carrot");
});
