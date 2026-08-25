/**
 * The small grey line in a node header that says how much is in the card:
 * "218 chars" for a prompt, "1.4 MB" for an uploaded image. Purely
 * informational — it never changes what the node holds.
 */
import type { NodeDataValue, PortType, FileValue } from "./workflow-types";

/** Port types whose value is a string the user reads and counts. */
const TEXTUAL_TYPES = new Set<PortType>(["text", "markdown", "html", "json"]);

export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes < 0) return "";
	if (bytes < 1024) return `${bytes} B`;
	const units = ["KB", "MB", "GB", "TB"];
	let value = bytes / 1024;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit++;
	}
	// One decimal below 10 (1.4 MB reads better than 1 MB), none above.
	return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

export function formatChars(count: number): string {
	return `${count.toLocaleString("en-US")} ${count === 1 ? "char" : "chars"}`;
}

function asFileValue(value: NodeDataValue): FileValue | null {
	return value && typeof value === "object" && !Array.isArray(value)
		? value
		: null;
}

/**
 * The header line for a node's current value, or null when there's nothing
 * worth saying (empty field, a number, a file whose size nobody knows yet).
 *
 * `measuredSize` is a byte count the card resolved itself for a value that
 * arrived as a bare URL — see `resolveFileSize`.
 */
export function nodeMetaLabel(
	type: PortType | null,
	value: NodeDataValue | undefined,
	measuredSize?: number | null
): string | null {
	if (!type) return null;
	if (TEXTUAL_TYPES.has(type)) {
		if (typeof value !== "string" || value.length === 0) return null;
		return formatChars(value.length);
	}
	const file = asFileValue(value ?? null);
	if (!file?.url) return null;
	const size = typeof file.size === "number" ? file.size : measuredSize;
	if (typeof size !== "number" || size <= 0) return null;
	return formatBytes(size);
}

/** Byte length a `data:` URL decodes to, without allocating the payload. */
function dataUrlSize(url: string): number | null {
	const comma = url.indexOf(",");
	if (comma < 0) return null;
	const payload = url.slice(comma + 1);
	if (!/;base64$/i.test(url.slice(0, comma))) {
		try {
			return new Blob([decodeURIComponent(payload)]).size;
		} catch {
			return null;
		}
	}
	const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
	return Math.max(0, Math.floor((payload.length * 3) / 4) - padding);
}

/**
 * Best-effort byte size for a file the graph only knows by URL. `blob:` and
 * `data:` resolve locally; an http(s) URL gets one HEAD request and is dropped
 * silently if the server won't say (no `Content-Length`, or CORS).
 */
export async function resolveFileSize(url: string): Promise<number | null> {
	try {
		if (url.startsWith("data:")) return dataUrlSize(url);
		if (url.startsWith("blob:")) {
			const blob = await fetch(url).then((r) => r.blob());
			return blob.size || null;
		}
		const res = await fetch(url, { method: "HEAD" });
		const len = res.headers.get("content-length");
		const n = len ? parseInt(len, 10) : NaN;
		return Number.isFinite(n) && n > 0 ? n : null;
	} catch {
		return null;
	}
}
