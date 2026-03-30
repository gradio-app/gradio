import { commands } from "vitest/browser";
import type { FileData } from "@gradio/client";

export interface DownloadResult {
	suggested_filename: string;
	content: string | null;
}

/**
 * Clicks an element and captures the resulting file download.
 *
 * Uses a real browser download via Playwright under the hood —
 * the file is actually downloaded and its content is readable.
 *
 * @param selector - CSS selector for the element to click
 * @param options - Optional timeout (default 5000ms)
 * @returns The downloaded file's suggested filename and text content
 *
 * @example
 * ```ts
 * const { suggested_filename, content } = await download_file("a.download-link");
 * expect(suggested_filename).toBe("data.csv");
 * expect(content).toContain("col1,col2");
 * ```
 */
export async function download_file(
	selector: string,
	options?: { timeout?: number }
): Promise<DownloadResult> {
	return (commands as any).expect_download(selector, options);
}

/**
 * Sets files on an `<input type="file">` element using real file fixtures.
 *
 * Accepts one or more FileData fixtures (e.g. TEST_JPG, TEST_PNG) and
 * sets them on the file input, triggering the browser's native change event.
 *
 * @param files - One or more FileData fixtures to upload
 * @param selector - CSS selector for the file input (default: 'input[type="file"]')
 *
 * @example
 * ```ts
 * import { render, upload_file, TEST_JPG } from "@self/tootils/render";
 *
 * const { listen } = await render(ImageUpload, { interactive: true });
 * const upload = listen("upload");
 *
 * await upload_file(TEST_JPG);
 *
 * expect(upload).toHaveBeenCalled();
 * ```
 */
export async function upload_file(
	files: FileData | FileData[],
	selector?: string
): Promise<void> {
	const file_list = Array.isArray(files) ? files : [files];
	const urls = file_list.map((f) => f.url ?? f.path);
	return (commands as any).set_file_inputs(urls, selector);
}

/**
 * Simulates dragging and dropping files onto an element.
 *
 * Reads the fixture files from disk, constructs a real DataTransfer
 * with File objects, and dispatches dragenter, dragover, and drop events
 * on the target element.
 *
 * @param files - One or more FileData fixtures to drop
 * @param selector - CSS selector for the drop target element
 *
 * @example
 * ```ts
 * import { render, drop_file, TEST_JPG } from "@self/tootils/render";
 *
 * const { listen } = await render(ImageUpload, { interactive: true });
 * const upload = listen("upload");
 *
 * await drop_file(TEST_JPG, "[aria-label='Click to upload or drop files']");
 *
 * await vi.waitFor(() => expect(upload).toHaveBeenCalled());
 * ```
 */
export async function drop_file(
	files: FileData | FileData[],
	selector: string
): Promise<void> {
	const file_list = Array.isArray(files) ? files : [files];
	const urls = file_list.map((f) => f.url ?? f.path);
	return (commands as any).drop_files(urls, selector);
}
