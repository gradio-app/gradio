import { test, expect } from "@self/tootils";

// Both scripts are explicitly `async`, so download-completion order applies:
// the delayed "first" must run after the fast "second".
const FIRST = `
window.__ASYNC_ORDER = window.__ASYNC_ORDER || [];
window.__ASYNC_ORDER.push("first");
`;

const SECOND = `
window.__ASYNC_ORDER = window.__ASYNC_ORDER || [];
window.__ASYNC_ORDER.push("second");
`;

test("explicit async on head scripts is honored", async ({ page }) => {
	await page.route("**/__head_async__/first.js", async (route) => {
		// Delay "first" so, if async is respected, the fast "second" wins.
		await new Promise((resolve) => setTimeout(resolve, 800));
		await route.fulfill({
			contentType: "application/javascript",
			body: FIRST
		});
	});
	await page.route("**/__head_async__/second.js", async (route) => {
		await route.fulfill({
			contentType: "application/javascript",
			body: SECOND
		});
	});

	// Reload so loadHead re-runs with the routes above now active.
	await page.reload();
	await page.waitForLoadState("load");

	await expect
		.poll(async () => page.evaluate(() => (window as any).__ASYNC_ORDER), {
			timeout: 10000
		})
		.toEqual(["second", "first"]);
});
