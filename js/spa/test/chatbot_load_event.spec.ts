import { test, expect } from "@self/tootils";

test("load event sets value on component in hidden tab", async ({ page }) => {
	// Wait for the load event to complete (value arrives from backend)
	await page.waitForTimeout(2000);

	// Click Tab 2 to reveal the textbox
	await page.getByRole("tab", { name: "Tab 2" }).click();

	// The textbox should show the value set by demo.load()
	await expect(page.getByLabel("Output")).toHaveValue("some text", {
		timeout: 5000
	});
});
