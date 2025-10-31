import { test, expect } from "@self/tootils";

test("If render_children=True in Tab, the children with visible!=False are rendered", async ({
	page
}) => {
	await expect(page.locator("#invisible-but-rendered")).toBeAttached();
	await expect(page.locator("#invisible-and-not-rendered")).not.toBeAttached();
	await expect(page.locator("#visibility-hidden")).toBeAttached();
});
