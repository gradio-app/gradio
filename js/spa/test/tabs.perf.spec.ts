import { test as base, expect } from "@playwright/test";
import { launchGradioApp, killGradioApp } from "@self/tootils/app-launcher";
import fs from "fs";

const PERF_RESULTS_FILE =
	process.env.PERF_RESULTS_FILE || "/tmp/perf_results.json";

const test = base.extend<{ perfPage: import("@playwright/test").Page }>({
	perfPage: async ({ page }, use, testInfo) => {
		const { port, process: appProcess } = await launchGradioApp(
			"tabs",
			testInfo.workerIndex,
			60000
		);

		// Warmup load: primes OS, disk, browser, and Python caches
		await page.goto(`http://localhost:${port}`);
		await page.waitForLoadState("networkidle");

		// Attach resource tracker after warmup so only the real load is measured
		const resourceSizes = { js: 0, css: 0, jsCount: 0, cssCount: 0 };
		page.on("response", (response) => {
			const url = response.url();
			const headers = response.headers();
			const bytes = parseInt(headers["content-length"] || "0", 10);
			if (url.endsWith(".js") || url.endsWith(".mjs")) {
				resourceSizes.js += bytes;
				resourceSizes.jsCount++;
			} else if (url.endsWith(".css")) {
				resourceSizes.css += bytes;
				resourceSizes.cssCount++;
			}
		});

		// Real load: this is the one we measure
		await page.reload();
		await page.waitForLoadState("networkidle");

		await page.evaluate(
			(sizes) => ((window as any).__resourceSizes = sizes),
			resourceSizes
		);

		await use(page);

		killGradioApp(appProcess);
	}
});

test("collect frontend performance metrics", async ({ perfPage: page }) => {
	await page.evaluate(() => {
		(window as any).__lcpValue = 0;
		new PerformanceObserver((list) => {
			const entries = list.getEntries();
			if (entries.length > 0) {
				(window as any).__lcpValue =
					entries[entries.length - 1].startTime;
			}
		}).observe({ type: "largest-contentful-paint", buffered: true });
	});

	await page.waitForTimeout(1000);

	const metrics = await page.evaluate(() => {
		const nav = performance.getEntriesByType(
			"navigation"
		)[0] as PerformanceNavigationTiming;

		const sizes = (window as any).__resourceSizes || {
			js: 0,
			css: 0,
			jsCount: 0,
			cssCount: 0
		};

		return {
			dom_content_loaded_ms: Math.round(nav.domContentLoadedEventEnd),
			page_load_ms: Math.round(nav.loadEventEnd),
			lcp_ms: Math.round((window as any).__lcpValue || 0),
			total_js_kb: Math.round(sizes.js / 1024),
			total_css_kb: Math.round(sizes.css / 1024),
			js_resource_count: sizes.jsCount,
			css_resource_count: sizes.cssCount
		};
	});

	fs.writeFileSync(PERF_RESULTS_FILE, JSON.stringify(metrics, null, 2));

	console.log("Performance metrics:", JSON.stringify(metrics, null, 2));

	expect(metrics.dom_content_loaded_ms).toBeGreaterThan(0);
	expect(metrics.page_load_ms).toBeGreaterThan(0);
	expect(metrics.total_js_kb).toBeGreaterThan(0);
});
