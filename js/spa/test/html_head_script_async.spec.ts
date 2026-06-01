import { test, expect } from "@self/tootils";

// Both head scripts are marked `async`, so the author opted into
// download-completion order. The first script is delayed, so the faster
// second script must run first. This proves an explicit `async` is honored
// and not forced into document order by the ordering fix.
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

	// The fixture navigated once before these routes existed, so the first
	// mount missed them. Reload to re-run loadHead with the routes active.
	await page.reload();
	await page.waitForLoadState("load");

	// async scripts execute in download-completion order, so the delayed
	// "first" runs after the fast "second".
	await expect
		.poll(async () => page.evaluate(() => (window as any).__ASYNC_ORDER), {
			timeout: 10000
		})
		.toEqual(["second", "first"]);
});
