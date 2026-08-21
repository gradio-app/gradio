import { describe, test, expect } from "vitest";
import { wrap_history_value } from "./history-hydration";
import type { FileValue } from "./workflow-types";

// Mirrors NodeWidget.svelte:getFileValue.
function widget_reads_file(v: unknown): FileValue | null {
	return v && typeof v === "object" && !Array.isArray(v)
		? (v as FileValue)
		: null;
}

describe("wrap_history_value", () => {
	test("image URL string → FileValue the widget accepts", () => {
		const wrapped = wrap_history_value(
			"https://huggingface.co/buckets/u/b/resolve/media/x.png",
			"image"
		);
		const file = widget_reads_file(wrapped);
		expect(file).not.toBeNull();
		expect(file!.url).toBe(
			"https://huggingface.co/buckets/u/b/resolve/media/x.png"
		);
		expect(file!.name).toBe("x.png");
		expect(file!.mime).toBe("image/*");
	});

	test("audio URL wraps with audio mime", () => {
		const file = widget_reads_file(
			wrap_history_value("https://x/y.mp3", "audio")
		);
		expect(file).not.toBeNull();
		expect(file!.mime).toBe("audio/*");
	});

	test("video and file also wrap", () => {
		expect(widget_reads_file(wrap_history_value("/v.mp4", "video"))).not.toBeNull();
		expect(widget_reads_file(wrap_history_value("/f.bin", "file"))).not.toBeNull();
	});

	test("text value passes through as string", () => {
		const wrapped = wrap_history_value("hello world", "text");
		expect(wrapped).toBe("hello world");
		expect(widget_reads_file(wrapped)).toBeNull();
	});

	test("number passes through unchanged", () => {
		expect(wrap_history_value(42, "number")).toBe(42);
	});

	test("null stays null", () => {
		expect(wrap_history_value(null, "image")).toBeNull();
	});

	test("already-a-FileValue is not double-wrapped", () => {
		const already: FileValue = {
			url: "https://x/y.png",
			name: "y.png",
			mime: "image/png"
		};
		expect(wrap_history_value(already, "image")).toBe(already);
	});

	test("empty basename doesn't crash", () => {
		const file = widget_reads_file(wrap_history_value("/", "image"));
		expect(file).not.toBeNull();
		expect(file!.name).toBe("");
	});
});
