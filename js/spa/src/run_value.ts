/**
 * Helpers for previewing a saved run's values.
 *
 * The run history reuses Gradio's compact Example renderers, but those were
 * written for the values in an `Examples` dataset, which are not always shaped
 * like the live values a run actually produces. Rather than give up and print
 * JSON, reshape the value into what the renderer expects.
 */

interface FileLike {
	orig_name?: string;
	path?: string;
	url?: string;
	meta?: { _type?: string };
}

/**
 * The renderers that draw a file rather than describe it, by reading `url` off
 * the value. Every other renderer prints what it is handed, so a `FileData`
 * would come out as "[object Object]" and wants a file name instead. Keeping
 * this as an allowlist means an unrecognised component degrades to its file
 * name rather than to that.
 */
const RENDERS_FILES = new Set([
	"image",
	"simpleimage",
	"video",
	"gallery",
	"imageeditor"
]);

/**
 * Both the backend and the JS client stamp `FileData` with this discriminator,
 * and it survives being saved. Matching on `path` or `url` instead would claim
 * ordinary JSON such as `{ "url": "https://example.com" }` as a file and show
 * it as a file name.
 */
function is_file_like(value: unknown): boolean {
	if (Array.isArray(value)) return value.some(is_file_like);
	if (!value || typeof value !== "object") return false;
	return (value as FileLike).meta?._type === "gradio.FileData";
}

function file_label(value: unknown): string {
	if (Array.isArray(value)) return value.map(file_label).join(", ");
	if (value && typeof value === "object") {
		const file = value as FileLike;
		const name = file.orig_name || file.path || file.url;
		if (typeof name === "string") return name.split("/").pop() || name;
	}
	return typeof value === "string" ? value : "";
}

/**
 * Reshapes a live component value into the shape that component's Example
 * renderer understands. Values it does not recognise are passed through.
 */
export function to_example_value(type: string, value: unknown): unknown {
	if (value === null || value === undefined) return value;

	// The renderer draws rows of cells; a live dataframe is `{headers, data}`.
	if (type === "dataframe") {
		const frame = value as { headers?: unknown[]; data?: unknown[][] };
		if (Array.isArray(frame.data)) {
			return Array.isArray(frame.headers)
				? [frame.headers, ...frame.data]
				: frame.data;
		}
		return value;
	}

	if (!RENDERS_FILES.has(type) && is_file_like(value)) {
		return file_label(value) || value;
	}

	return value;
}

/** A short, human-readable stand-in for a value with no usable preview. */
export function summarize(value: unknown): string {
	if (value === null || value === undefined) return "No value";
	if (typeof value === "string") return value || "Empty value";
	if (typeof value !== "object") return String(value);

	// `gr.Label`: report the winning label rather than every confidence.
	const label = (value as { label?: unknown }).label;
	if (typeof label === "string") return label;

	// `gr.HighlightedText`: read as the sentence it highlights.
	if (
		Array.isArray(value) &&
		value.length > 0 &&
		value.every((item) => item && typeof item === "object" && "token" in item)
	) {
		return value.map((item) => (item as { token: string }).token).join("");
	}

	if (is_file_like(value)) {
		const file = file_label(value);
		if (file) return file;
	}

	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}
