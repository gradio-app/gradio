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
	"/gradio_api/upload_progress",
	"/gradio_api/file=",
	"/gradio_api/file/",
	"/upload",
	"/upload_progress",
	"/file=",
	"/file/",
	"/static/",
	"/assets/",
	"/svelte/",
	"/favicon.ico",
	"/custom_component/"
];

// Upload routes that need affinity (upload + upload_progress for the same
// upload_id must land on the same worker).
const UPLOAD_AFFINITY_PREFIXES = [
	"/gradio_api/upload",
	"/gradio_api/upload_progress",
	"/upload",
	"/upload_progress"
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
 * Simple string hash (djb2) that returns a non-negative integer.
 * Used to map upload_id to a deterministic worker index.
 *
 * @param {string} str
 * @returns {number}
 */
export function hashString(str) {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
	}
	return hash;
}

/**
 * Classify a request into a routing destination and optional worker index.
 *
 * @param {string} path - URL path (no query string)
 * @param {object} options
 * @param {boolean} options.hasWorkers - whether static workers are configured
 * @param {boolean} options.serverModeEnabled - whether GRADIO_SERVER_MODE_ENABLED is set
 * @param {number} options.numWorkers - number of static workers
 * @param {string} [options.queryString] - raw query string (after ?)
 * @returns {{route: "worker" | "python" | "sveltekit", workerIndex?: number}}
 */
export function classifyRoute(
	path,
	{
		hasWorkers = false,
		serverModeEnabled = false,
		numWorkers = 0,
		queryString = ""
	} = {}
) {
	if (matchesPrefix(path, STATIC_ROUTE_PREFIXES)) {
		if (!hasWorkers) {
			return { route: "python" };
		}
		// For upload routes with an upload_id, use affinity hashing
		if (
			numWorkers > 0 &&
			queryString &&
			matchesPrefix(path, UPLOAD_AFFINITY_PREFIXES)
		) {
			const uploadId = extractUploadId(queryString);
			if (uploadId) {
				return {
					route: "worker",
					workerIndex: hashString(uploadId) % numWorkers
				};
			}
		}
		return { route: "worker" };
	}
	if (matchesPrefix(path, PYTHON_ROUTE_PREFIXES) || serverModeEnabled) {
		return { route: "python" };
	}
	return { route: "sveltekit" };
}

/**
 * Extract upload_id from a query string.
 *
 * @param {string} qs - raw query string (without leading ?)
 * @returns {string|null}
 */
function extractUploadId(qs) {
	for (const part of qs.split("&")) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		if (part.substring(0, eq) === "upload_id") {
			return decodeURIComponent(part.substring(eq + 1));
		}
	}
	return null;
}
