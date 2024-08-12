import { test, expect } from "@gradio/tootils";
import { readFileSync } from "fs";

test("when a user closes the page, the unload event should be triggered", async ({
	page
}) => {
	const increment = await page.locator("button", {
		hasText: /Increment/
	});

	// if you click too fast, the page may close before the event is processed
	await increment.click();
	await page.waitForTimeout(100);
	await increment.click();
	await page.waitForTimeout(100);
	await increment.click();
	await page.waitForTimeout(100);
	await increment.click();
	await expect(page.getByLabel("Number")).toHaveValue("4");
	await page.close();

	await new Promise((resolve) => setTimeout(resolve, 5000));

	const data = readFileSync(
		"../../demo/unload_event_test/output_log.txt",
		"utf-8"
	);
	expect(data).toContain("incremented 0");
	expect(data).toContain("incremented 1");
	expect(data).toContain("incremented 2");
	expect(data).toContain("incremented 3");
	expect(data).toContain("unloading");
	expect(data).toContain("deleted 4");
});
