import { test, expect, type Page, type Response } from "@playwright/test";
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

async function gotoApp(page: Page, url: string): Promise<void> {
	await page.goto(url, { waitUntil: "load" });
}

async function collectMetrics(
	page: Page,
	url: string
): Promise<{
	dom_content_loaded_ms: number;
	page_load_ms: number;
	lcp_ms: number;
	tab_nav_ms: number;
	total_js_kb: number;
	total_css_kb: number;
	js_resource_count: number;
	css_resource_count: number;
}> {
	const resourceSizes = { js: 0, css: 0, jsCount: 0, cssCount: 0 };
	const responseHandler = (response: Response): void => {
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

	page.on("response", responseHandler);
	try {
		await gotoApp(page, url);
	} finally {
		page.removeListener("response", responseHandler);
	}

	const domContentLoadedValues: number[] = [];
	const pageLoadValues: number[] = [];
	const lcpValues: number[] = [];
	const tabNavValues: number[] = [];

	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		await gotoApp(page, url);
		await page.waitForTimeout(200);
	}

	for (let i = 0; i < ITERATIONS; i++) {
		await page.evaluate(() => (window as any).__resetLcp());
		await gotoApp(page, url);

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

		await page.waitForFunction(
			() => {
				const trackers = document.querySelectorAll(
					'[data-testid="status-tracker"]'
				);
				return (
					trackers.length === 0 ||
					Array.from(trackers).every(
						(t) =>
							t.classList.contains("hide") ||
							getComputedStyle(t).display === "none"
					)
				);
			},
			{ timeout: 15_000 }
		);

		const navDuration = await page.evaluate(() => {
			const start = performance.now();
			const btn = (document.querySelector('button[data-tab-id="chatbot"]') ??
				Array.from(document.querySelectorAll('[role="tab"]')).find(
					(el) => el.textContent?.trim() === "Chatbot"
				)) as HTMLElement | undefined;
			if (!btn) {
				throw new Error("Chatbot tab button not found");
			}
			btn.click();
			return Promise.race([
				new Promise<number>((resolve) => {
					function check() {
						const chatbot = document.querySelector('[role="log"]');
						if (chatbot && (chatbot as HTMLElement).offsetParent !== null) {
							resolve(Math.round(performance.now() - start));
						} else {
							requestAnimationFrame(check);
						}
					}
					requestAnimationFrame(check);
				}),
				new Promise<number>((resolve) =>
					setTimeout(
						() => resolve(Math.round(performance.now() - start)),
						10_000
					)
				)
			]);
		});
		tabNavValues.push(navDuration);
	}

	return {
		dom_content_loaded_ms: trimmedMedian(domContentLoadedValues),
		page_load_ms: trimmedMedian(pageLoadValues),
		lcp_ms: trimmedMedian(lcpValues),
		tab_nav_ms: trimmedMedian(tabNavValues),
		total_js_kb: Math.round(resourceSizes.js / 1024),
		total_css_kb: Math.round(resourceSizes.css / 1024),
		js_resource_count: resourceSizes.jsCount,
		css_resource_count: resourceSizes.cssCount
	};
}

test.setTimeout(240_000);

test("collect frontend performance metrics", async ({ page }, testInfo) => {
	page.setDefaultNavigationTimeout(60_000);

	const { port, process: appProcess } = await launchGradioApp(
		"big_complex_demo",
		testInfo.workerIndex,
		60_000
	);

	try {
		const metrics = await collectMetrics(page, `http://localhost:${port}`);
		fs.writeFileSync(PERF_RESULTS_FILE, JSON.stringify(metrics, null, 2));
		expect(metrics.dom_content_loaded_ms).toBeGreaterThan(0);
		expect(metrics.page_load_ms).toBeGreaterThan(0);
		expect(metrics.tab_nav_ms).toBeGreaterThan(0);
		expect(metrics.total_js_kb).toBeGreaterThan(0);
	} finally {
		killGradioApp(appProcess);
	}
});
