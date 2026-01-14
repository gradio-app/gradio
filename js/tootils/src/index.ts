import { test as base, type Locator, type Page } from "@playwright/test";
import { spy } from "tinyspy";
import url from "url";
import path from "path";
import fsPromises from "fs/promises";
import type { ChildProcess } from "node:child_process";

import type { SvelteComponent } from "svelte";
import type { SpyFn } from "tinyspy";

import { launchGradioApp, killGradioApp, hasTestcase } from "./app-launcher";

export function get_text<T extends HTMLElement>(el: T): string {
	return el.innerText.trim();
}

export function wait(n: number): Promise<void> {
	return new Promise((r) => setTimeout(r, n));
}

const ROOT_DIR = path.resolve(
	url.fileURLToPath(import.meta.url),
	"../../../.."
);

// Extract testcase name from test title if present
// Test titles like "case eager_caching_examples: ..." indicate a testcase
function extractTestcaseFromTitle(
	title: string,
	demoName: string
): string | undefined {
	const caseMatch = title.match(/^case\s+(\w+):/);
	if (caseMatch) {
		const caseName = caseMatch[1];
		// Check if this is a testcase (not the main demo)
		if (hasTestcase(demoName, caseName)) {
			return caseName;
		}
	}
	return undefined;
}

// Cache for launched apps - key is "demoName" or "demoName_testcaseName"
const appCache = new Map<
	string,
	{ port: number; process: ChildProcess; refCount: number }
>();

// Test fixture that launches Gradio app per test
const test_normal = base.extend<{ setup: void }>({
	setup: [
		async ({ page }, use, testInfo): Promise<void> => {
			const { file, title } = testInfo;
			const demoName = path.basename(file, ".spec.ts");

			// Check if this is a reload test (they manage their own apps)
			if (demoName.endsWith(".reload")) {
				// For reload tests, don't launch an app - they handle it themselves
				await use();
				return;
			}

			// Check if this test is for a specific testcase
			const testcaseName = extractTestcaseFromTitle(title, demoName);

			// Cache key includes testcase if present
			const cacheKey = testcaseName ? `${demoName}_${testcaseName}` : demoName;

			let appInfo = appCache.get(cacheKey);

			if (!appInfo) {
				// Launch the app for this test
				const workerIndex = testInfo.workerIndex;
				try {
					const { port, process } = await launchGradioApp(
						demoName,
						workerIndex,
						60000,
						testcaseName
					);
					appInfo = { port, process, refCount: 0 };
					appCache.set(cacheKey, appInfo);
				} catch (error) {
					console.error(`Failed to launch app for ${cacheKey}:`, error);
					throw error;
				}
			}

			appInfo.refCount++;

			// Navigate to the app
			await page.goto(`http://localhost:${appInfo.port}`);

			if (
				process.env?.GRADIO_SSR_MODE?.toLowerCase() === "true" &&
				!(
					demoName.includes("multipage") ||
					demoName.includes("chatinterface_deep_link")
				)
			) {
				await page.waitForSelector("#svelte-announcer");
			}
			await page.waitForLoadState("load");

			await use();

			// Decrement ref count
			appInfo.refCount--;

			// Note: We don't kill the app here because other tests might
			// still need it. The app will be killed when the process exits.
		},
		{ auto: true }
	]
});

// Cleanup apps when the process exits
process.on("exit", () => {
	for (const [, appInfo] of appCache) {
		killGradioApp(appInfo.process);
	}
});

process.on("SIGINT", () => {
	for (const [, appInfo] of appCache) {
		killGradioApp(appInfo.process);
	}
	process.exit(0);
});

process.on("SIGTERM", () => {
	for (const [, appInfo] of appCache) {
		killGradioApp(appInfo.process);
	}
	process.exit(0);
});

export const test = test_normal;

export async function wait_for_event(
	component: SvelteComponent,
	event: string
): Promise<SpyFn> {
	const mock = spy();
	return new Promise((res) => {
		component.$on(event, () => {
			mock();
			res(mock);
		});
	});
}

export interface ActionReturn<
	Parameter = never,
	Attributes extends Record<string, any> = Record<never, any>
> {
	update?: [Parameter] extends [never] ? never : (parameter: Parameter) => void;
	destroy?: () => void;
	/**
	 * ### DO NOT USE THIS
	 * This exists solely for type-checking and has no effect at runtime.
	 * Set this through the `Attributes` generic instead.
	 */
	$$_attributes?: Attributes;
}

export { expect } from "@playwright/test";
export * from "./render";

export const drag_and_drop_file = async (
	page: Page,
	selector: string | Locator,
	filePath: string,
	fileName: string,
	fileType = "",
	count = 1
): Promise<void> => {
	const buffer = (await fsPromises.readFile(filePath)).toString("base64");

	const dataTransfer = await page.evaluateHandle(
		async ({ bufferData, localFileName, localFileType, count }) => {
			const dt = new DataTransfer();

			const blobData = await fetch(bufferData).then((res) => res.blob());

			const file = new File([blobData], localFileName, {
				type: localFileType
			});

			for (let i = 0; i < count; i++) {
				dt.items.add(file);
			}
			return dt;
		},
		{
			bufferData: `data:application/octet-stream;base64,${buffer}`,
			localFileName: fileName,
			localFileType: fileType,
			count
		}
	);

	if (typeof selector === "string") {
		await page.dispatchEvent(selector, "drop", { dataTransfer });
	} else {
		await selector.dispatchEvent("drop", { dataTransfer });
	}
};

export async function go_to_testcase(
	page: Page,
	_test_case: string
): Promise<void> {
	// With the new setup, each testcase launches its own Gradio app.
	// The fixture detects the testcase from the test title and launches
	// the correct app, so this function is now a no-op.
	// The page is already at the correct testcase app.
}
