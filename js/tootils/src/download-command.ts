import type { BrowserCommand } from "vitest/node";
import { resolve } from "path";
import { readFile } from "fs/promises";

/**
 * Vitest browser command that captures a real file download triggered by
 * clicking an element. Runs server-side with access to the Playwright page.
 *
 * Sets up page.waitForEvent("download") BEFORE clicking, so the download
 * event is never missed.
 */
export const expect_download: BrowserCommand<
	[selector: string, options?: { timeout?: number }],
	{ suggested_filename: string; content: string | null }
> = async (context, selector, options) => {
	const timeout = options?.timeout ?? 5000;
	const provider = context.provider as any;
	const page = provider.getPage(context.sessionId);
	// Tests run inside an iframe; use the iframe locator to click
	// but listen for the download event on the parent page.
	const iframe = (context as any).iframe;

	const [download] = await Promise.all([
		page.waitForEvent("download", { timeout }),
		iframe.locator(selector).click()
	]);

	const suggested_filename = download.suggestedFilename();
	const path = await download.path();

	let content: string | null = null;
	if (path) {
		const fs = await import("fs/promises");
		content = await fs.readFile(path, "utf-8");
	}

	return {
		suggested_filename,
		content
	};
};

/**
 * Vitest browser command that sets files on an <input type="file"> element.
 * Resolves fixture URL paths (e.g. "/test/test_files/bus.png") to absolute
 * disk paths and uses Playwright's setInputFiles().
 */
export const set_file_inputs: BrowserCommand<
	[file_urls: string[], selector?: string]
> = async (context, file_urls, selector) => {
	const root = context.project.config.root;
	const iframe = (context as any).iframe;

	const paths = file_urls.map((url) => resolve(root, url.replace(/^\//, "")));

	await iframe
		.locator(selector ?? 'input[type="file"]')
		.first()
		.setInputFiles(paths);
};

interface Drop_file_spec {
	data: string; // base64
	name: string;
	mime_type: string;
}

/**
 * Vitest browser command that simulates dropping files onto an element.
 * Reads files from disk, transfers them as base64 into the browser context,
 * and dispatches dragenter, dragover, and drop events with a real DataTransfer.
 */
export const drop_files: BrowserCommand<
	[file_urls: string[], selector: string]
> = async (context, file_urls, selector) => {
	const root = context.project.config.root;

	const files: Drop_file_spec[] = await Promise.all(
		file_urls.map(async (url) => {
			const abs = resolve(root, url.replace(/^\//, ""));
			const data = (await readFile(abs)).toString("base64");
			const name = abs.split("/").pop()!;
			const ext = name.split(".").pop()!.toLowerCase();
			const mime_type = MIME_TYPES[ext] || "application/octet-stream";
			return { data, name, mime_type };
		})
	);

	const iframe = (context as any).iframe;
	await iframe
		.locator(selector)
		.first()
		.evaluate((target: Element, files: Drop_file_spec[]) => {
			const dt = new DataTransfer();
			for (const f of files) {
				const bytes = Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0));
				dt.items.add(new File([bytes], f.name, { type: f.mime_type }));
			}

			target.dispatchEvent(
				new DragEvent("dragenter", {
					dataTransfer: dt,
					bubbles: true
				})
			);
			target.dispatchEvent(
				new DragEvent("dragover", {
					dataTransfer: dt,
					bubbles: true
				})
			);
			target.dispatchEvent(
				new DragEvent("drop", { dataTransfer: dt, bubbles: true })
			);
		}, files);
};

const MIME_TYPES: Record<string, string> = {
	txt: "text/plain",
	csv: "text/csv",
	json: "application/json",
	pdf: "application/pdf",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	webp: "image/webp",
	svg: "image/svg+xml",
	mp4: "video/mp4",
	webm: "video/webm",
	ogg: "video/ogg",
	avi: "video/x-msvideo",
	wav: "audio/wav",
	mp3: "audio/mpeg",
	flac: "audio/flac"
};
