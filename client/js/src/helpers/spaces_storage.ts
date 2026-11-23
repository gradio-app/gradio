import { post_message } from "./data";
import { get_zerogpu_origin } from "./zerogpu";

// Inside a Space page, the page hands out a short-lived viewer token for the
// viewer's own HF storage. It renews the token itself, so we ask for it before
// storage requests and keep an answer only for a few minutes. The answer is
// `{}` when the viewer is logged out or storage is unavailable, and nothing
// answers at all when the app is not inside the Space page.
const PROBE_MESSAGE = "supports-spaces-storage-headers";
const HEADERS_MESSAGE = "spaces-storage-headers";
const TIMEOUT_MS = 3000;
const CACHE_MS = 3 * 60 * 1000;

let available = false;
let probed = false;
let cached: { at: number; headers: Record<string, string> } | null = null;

function space_page_origin(): string | null {
	if (typeof window === "undefined" || window.parent === window) return null;
	return get_zerogpu_origin(window.location.hostname);
}

/** Whether the viewer's Spaces storage is usable, as last seen. */
export function spaces_storage_available(): boolean {
	return available;
}

/** Ask the Space page once whether storage is usable; it echoes when it is. */
export function initialize_spaces_storage_handshake(): void {
	const origin = space_page_origin();
	if (probed || !origin) return;
	probed = true;
	window.addEventListener("message", (event) => {
		if (event.data === PROBE_MESSAGE) available = true;
	});
	window.parent.postMessage(PROBE_MESSAGE, origin);
}

/** The headers that address the viewer's Spaces storage, for a request to
 * `url`, or `{}`. The token is for this Space only, so it is never sent to
 * another origin, such as another app this page's client connects to. */
export async function spaces_storage_headers(
	url: string,
	refresh = false
): Promise<Record<string, string>> {
	const origin = space_page_origin();
	if (!origin) return {};
	if (new URL(url, window.location.href).origin !== window.location.origin) {
		return {};
	}
	if (!refresh && cached && Date.now() - cached.at < CACHE_MS) {
		return cached.headers;
	}
	const answer = await Promise.race([
		post_message<Record<string, string> | Map<string, string>>(
			HEADERS_MESSAGE,
			origin
		),
		new Promise<null>((res) => setTimeout(() => res(null), TIMEOUT_MS))
	]);
	const headers =
		answer instanceof Map ? Object.fromEntries(answer) : (answer ?? {});
	available = Object.keys(headers).length > 0;
	cached = { at: Date.now(), headers };
	return headers;
}
