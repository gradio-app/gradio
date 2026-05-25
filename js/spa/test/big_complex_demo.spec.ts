import { test as base, expect } from "@playwright/test";
import { launchGradioApp, killGradioApp } from "@self/tootils/app-launcher";
import fs from "fs";

const PERF_RESULTS_FILE =
	process.env.PERF_RESULTS_FILE || "/tmp/perf_results.json";

const WARMUP_ITERATIONS = 1;
const ITERATIONS = 6;

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 !== 0
		? sorted[mid]
		: Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function trimmedMedian(values: number[]): number {
	if (values.length < 4) return median(values);
	const sorted = [...values].sort((a, b) => a - b);
	const q1 = sorted[Math.floor(sorted.length * 0.25)];
	const q3 = sorted[Math.floor(sorted.length * 0.75)];
	const iqr = q3 - q1;
	const lower = q1 - 1.5 * iqr;
	const upper = q3 + 1.5 * iqr;
	const filtered = sorted.filter((v) => v >= lower && v <= upper);
	return filtered.length > 0 ? median(filtered) : median(values);
}

const test = base.extend<{ perfPage: import("@playwright/test").Page }>({
	perfPage: [
		async ({ page }, use, testInfo) => {
			const { port, process: appProcess } = await launchGradioApp(
				"big_complex_demo",
				testInfo.workerIndex,
				60000
			);

			const url = `http://localhost:${port}`;

			const resourceSizes = { js: 0, css: 0, jsCount: 0, cssCount: 0 };
			const responseHandler = (response: any): void => {
				const rUrl = response.url();
				const headers = response.headers();
				const bytes = parseInt(headers["content-length"] || "0", 10);
				if (rUrl.endsWith(".js") || rUrl.endsWith(".mjs")) {
					resourceSizes.js += bytes;
					resourceSizes.jsCount++;
				} else if (rUrl.endsWith(".css")) {
					resourceSizes.css += bytes;
					resourceSizes.cssCount++;
				}
			};

			page.on("response", responseHandler);
			await page.goto(url);
			await page.waitForLoadState("networkidle");
			page.removeListener("response", responseHandler);

			const domContentLoadedValues: number[] = [];
			const pageLoadValues: number[] = [];
			const lcpValues: number[] = [];
			const tabNavValues: number[] = [];

			await page.addInitScript(() => {
				(window as any).__lcpValue = 0;
				(window as any).__lcpResolve = null;
				(window as any).__lcpPromise = null;

				(window as any).__resetLcp = () => {
					(window as any).__lcpValue = 0;
					(window as any).__lcpPromise = new Promise<void>((resolve) => {
						(window as any).__lcpResolve = resolve;
					});
				};
				(window as any).__resetLcp();

				new PerformanceObserver((list) => {
					const entries = list.getEntries();
					if (entries.length > 0) {
						(window as any).__lcpValue = entries[entries.length - 1].startTime;
						if ((window as any).__lcpResolve) {
							(window as any).__lcpResolve();
						}
					}
				}).observe({ type: "largest-contentful-paint", buffered: true });
			});

			for (let i = 0; i < WARMUP_ITERATIONS; i++) {
				await page.goto(url);
				await page.waitForLoadState("networkidle");
				await page.waitForTimeout(200);
			}

			for (let i = 0; i < ITERATIONS; i++) {
				await page.evaluate(() => (window as any).__resetLcp());
				await page.goto(url);
				await page.waitForLoadState("networkidle");

				await page.evaluate(() => {
					return Promise.race([
						(window as any).__lcpPromise,
						new Promise<void>((resolve) => setTimeout(resolve, 2000))
					]);
				});

				const timings = await page.evaluate(() => {
					const nav = performance.getEntriesByType(
						"navigation"
					)[0] as PerformanceNavigationTiming;
					return {
						domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
						pageLoad: Math.round(nav.loadEventEnd),
						lcp: Math.round((window as any).__lcpValue || 0)
					};
				});

				domContentLoadedValues.push(timings.domContentLoaded);
				pageLoadValues.push(timings.pageLoad);
				lcpValues.push(timings.lcp);

				const navDuration = await page.evaluate(() => {
					const start = performance.now();
					const btn = document.querySelector(
						'button[data-tab-id="chatbot"]'
					) as HTMLElement;
					btn.click();
					return new Promise<number>((resolve) => {
						function check() {
							const chatbot = document.querySelector('[role="log"]');
							if (chatbot && (chatbot as HTMLElement).offsetParent !== null) {
								resolve(Math.round(performance.now() - start));
							} else {
								requestAnimationFrame(check);
							}
						}
						requestAnimationFrame(check);
					});
				});
				tabNavValues.push(navDuration);
			}

			const perfMetrics = {
				dom_content_loaded_ms: trimmedMedian(domContentLoadedValues),
				page_load_ms: trimmedMedian(pageLoadValues),
				lcp_ms: trimmedMedian(lcpValues),
				tab_nav_ms: trimmedMedian(tabNavValues),
				total_js_kb: Math.round(resourceSizes.js / 1024),
				total_css_kb: Math.round(resourceSizes.css / 1024),
				js_resource_count: resourceSizes.jsCount,
				css_resource_count: resourceSizes.cssCount
			};

			await page.evaluate(
				(m) => ((window as any).__perfMetrics = m),
				perfMetrics
			);

			await use(page);
			killGradioApp(appProcess);
		},
		{ timeout: 120_000 }
	]
});

test("collect frontend performance metrics", async ({ perfPage: page }) => {
	const metrics = await page.evaluate(() => (window as any).__perfMetrics);
	fs.writeFileSync(PERF_RESULTS_FILE, JSON.stringify(metrics, null, 2));
	expect(metrics.dom_content_loaded_ms).toBeGreaterThan(0);
	expect(metrics.page_load_ms).toBeGreaterThan(0);
	expect(metrics.tab_nav_ms).toBeGreaterThan(0);
	expect(metrics.total_js_kb).toBeGreaterThan(0);
});
