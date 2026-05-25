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
