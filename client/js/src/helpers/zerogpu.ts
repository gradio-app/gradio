import { post_message } from "./data";

const ZEROGPU_HEADERS_MESSAGE = "supports-zerogpu-headers";

let zerogpu_handshake_initialized = false;

function supports_browser_handshake(): boolean {
	return (
		typeof window !== "undefined" &&
		typeof document !== "undefined" &&
		typeof window.addEventListener === "function"
	);
}

export function get_zerogpu_origin(hostname: string): string | null {
	if (hostname.includes(".dev.")) {
		return `https://moon-${hostname.split(".")[1]}.dev.spaces.huggingface.tech`;
	}
	if (hostname.endsWith(".hf.space")) {
		return "https://huggingface.co";
	}
	return null;
}

/**
 * Asks the Hugging Face page that embeds this Space for the visitor's ZeroGPU
 * headers, so that the Spaces proxy can attribute GPU usage to the visitor.
 * Resolves with null outside a ZeroGPU-capable iframe.
 */
export function get_zerogpu_headers(): Promise<Record<string, string> | null> {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return Promise.resolve(null);
	}
	const origin = get_zerogpu_origin(window.location.hostname);
	if (window.parent == window || !origin || !window.supports_zerogpu_headers) {
		return Promise.resolve(null);
	}
	return post_message<Record<string, string>>("zerogpu-headers", origin);
}

export function initialize_zerogpu_handshake(): void {
	if (!supports_browser_handshake() || zerogpu_handshake_initialized) {
		return;
	}

	window.addEventListener("message", (event) => {
		if (event.data === ZEROGPU_HEADERS_MESSAGE) {
			window.supports_zerogpu_headers = true;
		}
	});

	zerogpu_handshake_initialized = true;

	const origin = get_zerogpu_origin(window.location.hostname);
	if (origin && window.parent !== window) {
		window.parent.postMessage(ZEROGPU_HEADERS_MESSAGE, origin);
	}
}
