import { test as base } from "@playwright/test";
import { basename } from "path";
import { spy } from "tinyspy";

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

export { expect } from "@playwright/test";
export * from "./render";
