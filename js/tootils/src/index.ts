import { test as base } from "@playwright/test";

export function get_text<T extends HTMLElement>(el: T) {
	return el.innerText.trim();
}

export function wait(n: number) {
	return new Promise((r) => setTimeout(r, n));
}

export * from "./render";

export const test = base.extend<{ setup: typeof base.beforeAll }>({
	setup: [
		async ({}, use, workerInfo) => {
			console.log("FIXTURE RUN", workerInfo.workerIndex);
			return;
		},
		{ auto: true, scope: "test" }
	]
	// log: [
	// 	async ({}, use, workerInfo) => {
	// 		console.log("FIXTURE RUN");
	// 	},
	// 	{ auto: true, scope: "worker" }
	// ]
});

export { expect } from "@playwright/test";
