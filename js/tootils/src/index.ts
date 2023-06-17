import { test as base } from "@playwright/test";
import { basename } from "path";

export function get_text<T extends HTMLElement>(el: T) {
	return el.innerText.trim();
}

export function wait(n: number) {
	return new Promise((r) => setTimeout(r, n));
}

export const test = base.extend<{ setup: void }>({
	setup: [
		async ({ page }, use, testInfo) => {
			const { file } = testInfo;
			const test = basename(file, ".spec.ts");

			await page.goto(`localhost:7879/${test}`);

			await use();
		},
		{ auto: true }
	]
});

export { expect } from "@playwright/test";
export * from "./render";
