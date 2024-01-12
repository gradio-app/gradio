import { test, expect } from "@gradio/tootils";

test("correct tabs are visible", async ({ page}) => {
    const tabs = await page.getByRole('tab');
    expect(tabs).toHaveCount(3);

    await expect(tabs.nth(0)).toContainText("Secret Tab");
    await expect(tabs.nth(1)).toContainText("Hello World");
    await expect(tabs.nth(2)).toContainText("Bye World");

    let hidden_tab_locator = await page.getByText("Hidden Tab");
    await expect(hidden_tab_locator).not.toBeAttached();
});

test("correct tab is selected", async ({ page }) => {
    const tabs = await page.getByRole('tab');
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "false");
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "false");
});

test('correct tabs are disabled', async ({ page }) => {
    const tabs = await page.getByRole('tab');
    await expect(tabs.nth(0)).toHaveAttribute("disabled");
    await expect(tabs.nth(1)).not.toHaveAttribute("disabled");
    await expect(tabs.nth(1)).not.toHaveAttribute("disabled");
});
