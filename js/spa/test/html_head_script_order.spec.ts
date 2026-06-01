import { test, expect } from "@self/tootils";

// Two head scripts where "plugin" depends on a global set by "core". The core
// request is delayed, so a force-async plugin (the bug) would download and run
// first and miss the global. With in-order execution the browser must run core
// before plugin regardless of which finishes downloading first.
const CORE = `
window.__SCRIPT_ORDER = window.__SCRIPT_ORDER || [];
window.__SCRIPT_ORDER.push("core");
window.__CORE_READY = true;
`;

const PLUGIN = `
window.__SCRIPT_ORDER = window.__SCRIPT_ORDER || [];
window.__SCRIPT_ORDER.push("plugin");
window.__PLUGIN_SAW_CORE = window.__CORE_READY === true;
var result = document.getElementById("order-result");
if (result) {
	result.textContent =
		window.__SCRIPT_ORDER.join(",") + " saw_core=" + window.__PLUGIN_SAW_CORE;
}
`;

test("head scripts execute in document order", async ({ page }) => {
	await page.route("**/__head_order__/core.js", async (route) => {
		// Delay core so the smaller plugin wins the download race.
		await new Promise((resolve) => setTimeout(resolve, 800));
		await route.fulfill({
			contentType: "application/javascript",
			body: CORE
		});
	});
	await page.route("**/__head_order__/plugin.js", async (route) => {
		await route.fulfill({
			contentType: "application/javascript",
			body: PLUGIN
		});
	});

	// The fixture navigated once before these routes existed, so the first
	// mount missed them. Reload to re-run loadHead with the routes active.
	await page.reload();
	await page.waitForLoadState("load");

	await expect
		.poll(async () => page.evaluate(() => (window as any).__SCRIPT_ORDER), {
			timeout: 10000
		})
		.toEqual(["core", "plugin"]);

	const saw_core = await page.evaluate(() => (window as any).__PLUGIN_SAW_CORE);
	expect(saw_core).toBe(true);
});
