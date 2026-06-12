import { test, expect } from "@self/tootils";

// Two components share the same head script. The instance that dedupes the
// script must still wait for the other instance's in-flight load before
// running js_on_load (issue #13528).
const LIB = `
window.__SHARED_LIB = true;
`;

test("js_on_load waits for a head script added by another instance", async ({
	page
}) => {
	await page.route("**/__head_shared__/lib.js", async (route) => {
		// Delay the library so a js_on_load that skips waiting runs too early.
		await new Promise((resolve) => setTimeout(resolve, 800));
		await route.fulfill({
			contentType: "application/javascript",
			body: LIB
		});
	});

	// Reload so loadHead re-runs with the route above now active.
	await page.reload();
	await page.waitForLoadState("load");

	await expect(page.locator("#shared-left")).toHaveText("loaded", {
		timeout: 10000
	});
	await expect(page.locator("#shared-right")).toHaveText("loaded", {
		timeout: 10000
	});
});
