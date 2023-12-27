import { test as base, type Page } from "@playwright/test";
import url from "url";
import path from "path";
import { spy } from "tinyspy";
import { readFileSync } from "fs";
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

export const test = base.extend<{ setup: void }>({
	setup: [
		!!process.env.GRADIO_E2E_TEST_LITE
			? async ({ page }, use, testInfo) => {
					const { file } = testInfo;
					const test_name = path.basename(file, ".spec.ts");
					const demo_dir = path.resolve(ROOT_DIR, `./demo/${test_name}`);
					const demo_filenames = await fsPromises
						.readdir(demo_dir, { withFileTypes: true, recursive: true })
						.then((dirents) =>
							dirents
								.filter(
									(dirent) =>
										dirent.isFile() &&
										!dirent.name.endsWith(".ipynb") &&
										!dirent.name.endsWith(".pyc")
								)
								.map((dirent) => dirent.name)
						);
					const demo_files = await Promise.all(
						demo_filenames.map(
							(filename) =>
								fsPromises
									.readFile(path.join(demo_dir, filename))
									.then((buffer) => [filename, buffer.toString("base64")]) // To pass to the browser, we need to convert the buffer to base64.
						)
					);

					await page.goto("http://localhost:9876/lite.html");

					const controllerHandle = await page.waitForFunction(
						// @ts-ignore
						() => window.controller // This controller object is set in the dev app.
					);
					await controllerHandle.evaluate(
						async (controller: any, files: [string, string][]) => {
							function base64ToUint8Array(base64: string): Uint8Array {
								// Ref: https://stackoverflow.com/a/21797381/13103190
								const binaryString = atob(base64);
								const bytes = new Uint8Array(binaryString.length);
								for (var i = 0; i < binaryString.length; i++) {
									bytes[i] = binaryString.charCodeAt(i);
								}
								return bytes;
							}

							files.forEach(([filepath, data_b64]) => {
								controller.write(filepath, base64ToUint8Array(data_b64), {});
							});

							await controller.run_file("run.py");
						},
						demo_files
					);

					await use();

					controllerHandle.dispose();
			  }
			: async ({ page }, use, testInfo): Promise<void> => {
					const port = process.env.GRADIO_E2E_TEST_PORT;
					const { file } = testInfo;
					const test_name = path.basename(file, ".spec.ts");

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
