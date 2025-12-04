import { test, expect } from "@self/tootils";

test("Textbox visibility can be toggled from the backend. Toggling visibility retains the value", async ({ page }) => {
    expect(page.locator("#test-textbox textarea")).toHaveCount(0);
    
    await page.getByLabel("Show").click()

    expect(page.locator("#test-textbox textarea")).toHaveCount(1);

    const textbox = page.locator("#test-textbox textarea");
    await textbox.fill("Test value");

    await page.getByLabel("Hide").click();

    await expect(textbox).not.toBeVisible();
    await expect(textbox).toHaveCount(0);

    await page.getByLabel("Show").click();
    await expect(textbox).toHaveValue("Test value");
});