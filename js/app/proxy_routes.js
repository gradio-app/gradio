/**
 * Routing logic for the Gradio Node proxy.
 *
 * Extracted so it can be unit-tested independently of the SvelteKit handler.
 */

// Routes that must go to the Python server (FastAPI).
export const PYTHON_ROUTE_PREFIXES = [
	"/gradio_api",
	"/config",
	"/login",
	"/logout",
	"/theme.css",
	"/robots.txt",
	"/pwa_icon",
	"/manifest.json",
	"/monitoring"
];

// Routes that can be offloaded to static workers.
// Workers serve both /upload and /gradio_api/upload (same handler).
// Checked BEFORE the /gradio_api Python catch-all.
export const STATIC_ROUTE_PREFIXES = [
	"/gradio_api/upload",
	"/gradio_api/file=",
	"/gradio_api/file/",
	"/upload",
	"/file=",
	"/file/",
	"/static/",
	"/assets/",
	"/svelte/",
	"/favicon.ico",
	"/custom_component/"
];

export function matchesPrefix(path, prefixes) {
	for (const prefix of prefixes) {
		if (path === prefix || path.startsWith(prefix)) {
			return true;
		}
	}
	return false;
}

/**
 * Classify a request path into a routing destination.
 *
 * @param {string} path - URL path (no query string)
 * @param {boolean} hasWorkers - whether static workers are configured
 * @param {boolean} serverModeEnabled - whether GRADIO_SERVER_MODE_ENABLED is set
 * @returns {"worker" | "python" | "sveltekit"} where to route
 */
export function classifyRoute(
	path,
	{ hasWorkers = false, serverModeEnabled = false } = {}
) {
	if (matchesPrefix(path, STATIC_ROUTE_PREFIXES)) {
		return hasWorkers ? "worker" : "python";
	}
	if (matchesPrefix(path, PYTHON_ROUTE_PREFIXES) || serverModeEnabled) {
		return "python";
	}
	return "sveltekit";
}
