import { test as base, type Page } from "@playwright/test";
import { basename } from "path";
import { spy } from "tinyspy";
import { readFileSync } from "fs";

import type { SvelteComponent } from "svelte";
import type { SpyFn } from "tinyspy";

export function get_text<T extends HTMLElement>(el: T): string {
	return el.innerText.trim();
}

export function wait(n: number): Promise<void> {
	return new Promise((r) => setTimeout(r, n));
}

export const test = base.extend<{ setup: void }>({
	setup: [
		async ({ page }, use, testInfo): Promise<void> => {
			const port = process.env.GRADIO_E2E_TEST_PORT;
			const { file } = testInfo;
			const test_name = basename(file, ".spec.ts");

			await page.goto(`localhost:${port}/${test_name}`);

			await use();
		},
		{ auto: true }
	]
});

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
	selector: string,
	filePath: string,
	fileName: string,
	fileType = ""
): Promise<void> => {
	const buffer = readFileSync(filePath).toString("base64");

	const dataTransfer = await page.evaluateHandle(
		async ({ bufferData, localFileName, localFileType }) => {
			const dt = new DataTransfer();

			const blobData = await fetch(bufferData).then((res) => res.blob());

			const file = new File([blobData], localFileName, { type: localFileType });
			dt.items.add(file);
			return dt;
		},
		{
			bufferData: `data:application/octet-stream;base64,${buffer}`,
			localFileName: fileName,
			localFileType: fileType
		}
	);

	await page.dispatchEvent(selector, "drop", { dataTransfer });
};
