import { test as base, type Locator, type Page } from "@playwright/test";
import { spy } from "tinyspy";
import { performance } from "node:perf_hooks";
import url from "url";
import path from "path";
import fsPromises from "fs/promises";

import type { SvelteComponent } from "svelte";
import type { SpyFn } from "tinyspy";

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

const test_normal = base.extend<{ setup: void }>({
	setup: [
		async ({ page }, use, testInfo): Promise<void> => {
			const port = process.env.GRADIO_E2E_TEST_PORT;
			const { file } = testInfo;
			const test_name = path.basename(file, ".spec.ts");

			await page.goto(`localhost:${port}/${test_name}`);
			if (process.env?.GRADIO_SSR_MODE?.toLowerCase() === "true") {
				await page.waitForSelector("#svelte-announcer");
			}
			await page.waitForLoadState("load");
			await use();
		},
		{ auto: true }
	]
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
	test_case: string
): Promise<void> {
	const url = page.url();
	await page.goto(`${url.substring(0, url.length - 1)}_${test_case}_testcase`);
	if (process.env?.GRADIO_SSR_MODE?.toLowerCase() === "true") {
		await page.waitForSelector("#svelte-announcer");
	}
}
